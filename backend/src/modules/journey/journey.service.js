import { Ride } from "../model/journey.model.js";
import { User } from "../model/user.model.js";
import { Driver } from "../model/driver.model.js";
import QRCode from "qrcode";

class JourneyService {
  async createJourney(riderId, journeyData) {
    const rider = await User.findById(riderId);
    if (!rider) {
      throw new Error("Rider not found");
    }

    const estimatedFare = this.calculateEstimatedFare(
      journeyData.pickupCoordinates,
      journeyData.dropoffCoordinates,
      journeyData.vehicleType,
    );

    const journey = new Ride({
      riderId,
      vehicleType: journeyData.vehicleType,
      pickup: {
        address: journeyData.pickupAddress,
        location: {
          type: "Point",
          coordinates: journeyData.pickupCoordinates,
        },
      },
      dropoff: {
        address: journeyData.dropoffAddress,
        location: {
          type: "Point",
          coordinates: journeyData.dropoffCoordinates,
        },
      },
      estimatedFare,
      paymentMethod: journeyData.paymentMethod,
      status: "REQUESTED",
    });

    await journey.save();
    await journey.populate("riderId", "name email phone");

    return this.formatJourneyResponse(journey);
  }
  // ✅ userId lo parameter mein
  async acceptJourney(journeyId, userId) {
    // ✅ userId se Driver dhundo
    const driver = await Driver.findOne({ userId }).populate("userId");
    if (!driver) {
      throw new Error("Driver not found");
    }

    if (!driver.status.isOnline) {
      throw new Error("Driver must be online to accept journeys");
    }

    if (!driver.status.isVerified) {
      throw new Error("Driver must be verified to accept journeys");
    }

    const journey = await Ride.findById(journeyId);
    if (!journey) {
      throw new Error("Journey not found");
    }

    if (journey.status !== "REQUESTED") {
      throw new Error("Journey is no longer available");
    }

    if (journey.vehicleType !== driver.vehicleInfo.vehicleType) {
      throw new Error("Vehicle type does not match journey request");
    }

    // ✅ driver._id save karo journey mein
    journey.driverId = driver._id;
    journey.status = "ACCEPTED";
    journey.acceptedAt = new Date();

    await journey.save();
    await journey.populate([
      { path: "riderId", select: "name email phone" },
      {
        path: "driverId",
        populate: { path: "userId", select: "name email phone" },
      },
    ]);

    return this.formatJourneyResponse(journey);
  }

  async updateJourneyStatus(journeyId, userId, newStatus) {
    // ✅ userId se Driver dhundo
    const driver = await Driver.findOne({ userId });
    if (!driver) {
      throw new Error("Driver not found");
    }

    const journey = await Ride.findById(journeyId);
    if (!journey) {
      throw new Error("Journey not found");
    }

    // ✅ driver._id se compare karo
    if (
      !journey.driverId ||
      journey.driverId.toString() !== driver._id.toString()
    ) {
      throw new Error("You are not assigned to this journey");
    }

    if (!journey.isValidStatusTransition(newStatus)) {
      throw new Error(
        `Cannot transition from ${journey.status} to ${newStatus}`,
      );
    }

    journey.status = newStatus;

    if (newStatus === "ARRIVED") {
      journey.arrivedAt = new Date();
    } else if (newStatus === "STARTED") {
      journey.startedAt = new Date();
    }

    await journey.save();
    await journey.populate([
      { path: "riderId", select: "name email phone" },
      {
        path: "driverId",
        populate: { path: "userId", select: "name email phone" },
      },
    ]);

    return this.formatJourneyResponse(journey);
  }

  async completeJourney(journeyId, userId, completionData) {
    // ✅ userId se Driver dhundo
    const driver = await Driver.findOne({ userId });
    if (!driver) {
      throw new Error("Driver not found");
    }

    const journey = await Ride.findById(journeyId);
    if (!journey) {
      throw new Error("Journey not found");
    }

    // ✅ driver._id se compare karo
    if (
      !journey.driverId ||
      journey.driverId.toString() !== driver._id.toString()
    ) {
      throw new Error("You are not assigned to this journey");
    }

    if (journey.status !== "STARTED") {
      throw new Error("Journey must be started before completion");
    }

    journey.status = "COMPLETED";
    journey.completedAt = new Date();
    journey.actualFare = completionData.actualFare;
    journey.distance = completionData.distance;
    journey.duration = completionData.duration;

    await journey.save();

    // ✅ driver._id use karo
    await Driver.findByIdAndUpdate(driver._id, {
      $inc: { "stats.totalRides": 1 },
    });

    await journey.populate([
      { path: "riderId", select: "name email phone" },
      {
        path: "driverId",
        populate: { path: "userId", select: "name email phone" },
      },
    ]);

    return this.formatJourneyResponse(journey);
  }

  async cancelJourney(journeyId, userId, reason, cancelledBy) {
    const journey = await Ride.findById(journeyId);

    if (!journey) {
      throw new Error("Journey not found");
    }

    const isRider = journey.riderId.toString() === userId.toString();
    const isDriver =
      journey.driverId && journey.driverId.toString() === userId.toString();

    if (!isRider && !isDriver) {
      throw new Error("You are not authorized to cancel this journey");
    }

    if (!journey.canBeCancelled()) {
      throw new Error("Journey cannot be cancelled in current status");
    }

    journey.status = "CANCELLED";
    journey.cancelledAt = new Date();
    journey.cancellationReason = reason;
    journey.cancelledBy = cancelledBy;

    await journey.save();
    await journey.populate([
      { path: "riderId", select: "name email phone" },
      {
        path: "driverId",
        populate: { path: "userId", select: "name email phone" },
      },
    ]);

    return this.formatJourneyResponse(journey);
  }

  async getJourneyById(journeyId, userId) {
    const journey = await Ride.findById(journeyId)
      .populate("riderId", "name email phone")
      .populate({
        path: "driverId",
        populate: { path: "userId", select: "name email phone" },
      });

    if (!journey) {
      throw new Error("Journey not found");
    }

    const isRider = journey.riderId._id.toString() === userId.toString();
    const isDriver =
      journey.driverId && journey.driverId._id.toString() === userId.toString();

    if (!isRider && !isDriver) {
      throw new Error("You are not authorized to view this journey");
    }

    return this.formatJourneyResponse(journey);
  }

  async getRiderJourneys(riderId, status = null) {
    const query = { riderId };

    if (status) {
      query.status = status;
    }

    const journeys = await Ride.find(query)
      .populate("riderId", "name email phone")
      .populate({
        path: "driverId",
        populate: { path: "userId", select: "name email phone" },
      })
      .sort({ createdAt: -1 });

    return journeys.map((journey) => this.formatJourneyResponse(journey));
  }

  async getDriverJourneys(userId, status = null) {
    // ✅ userId se Driver dhundo
    const driver = await Driver.findOne({ userId });
    if (!driver) {
      throw new Error("Driver not found");
    }

    const query = { driverId: driver._id }; // ✅ driver._id use karo

    if (status) {
      query.status = status;
    }

    const journeys = await Ride.find(query)
      .populate("riderId", "name email phone")
      .populate({
        path: "driverId",
        populate: { path: "userId", select: "name email phone" },
      })
      .sort({ createdAt: -1 });

    return journeys.map((journey) => this.formatJourneyResponse(journey));
  }

  calculateEstimatedFare(pickupCoords, dropoffCoords, vehicleType) {
    const distance = this.calculateDistance(pickupCoords, dropoffCoords);

    const pricing = {
      CAR: { base: 50, perKm: 12 },
      BIKE: { base: 20, perKm: 6 },
      AUTO: { base: 30, perKm: 8 },
      E_RICKSHAW: { base: 25, perKm: 7 },
      ELECTRIC_SCOOTER: { base: 15, perKm: 5 },
    };

    const { base, perKm } = pricing[vehicleType];
    const fare = base + distance * perKm;

    return Math.round(fare);
  }

  calculateDistance(coords1, coords2) {
    const [lon1, lat1] = coords1;
    const [lon2, lat2] = coords2;

    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  formatJourneyResponse(journey) {
    const response = {
      _id: journey._id,
      status: journey.status,
      vehicleType: journey.vehicleType,

      rider: {
        _id: journey.riderId._id,
        name: journey.riderId.name,
        email: journey.riderId.email,
        phone: journey.riderId.phone,
      },

      driver: journey.driverId
        ? {
            _id: journey.driverId._id,
            name: journey.driverId.userId.name,
            email: journey.driverId.userId.email,
            phone: journey.driverId.userId.phone,
            vehicleModel: journey.driverId.vehicleInfo.vehicleModel,
            vehicleColor: journey.driverId.vehicleInfo.vehicleColor,
            vehicleNumber: journey.driverId.vehicleInfo.vehicleNumber,
            rating: journey.driverId.stats.rating,
          }
        : null,

      pickup: journey.pickup,
      dropoff: journey.dropoff,

      estimatedFare: journey.estimatedFare,
      actualFare: journey.actualFare,
      distance: journey.distance,
      duration: journey.duration,

      paymentMethod: journey.paymentMethod,
      paymentStatus: journey.paymentStatus,

      requestedAt: journey.requestedAt,
      acceptedAt: journey.acceptedAt,
      arrivedAt: journey.arrivedAt,
      startedAt: journey.startedAt,
      completedAt: journey.completedAt,
      cancelledAt: journey.cancelledAt,

      cancellationReason: journey.cancellationReason,
      cancelledBy: journey.cancelledBy,

      rating: journey.rating,
      feedback: journey.feedback,

      createdAt: journey.createdAt,
      updatedAt: journey.updatedAt,
    };

    return response;
  }

  async generatePaymentQR(journeyId, riderId) {
    const journey = await Ride.findById(journeyId);

    if (!journey) {
      throw new Error("Journey not found");
    }

    if (journey.riderId.toString() !== riderId.toString()) {
      throw new Error(
        "You are not authorized to generate payment for this journey",
      );
    }

    if (journey.status !== "COMPLETED") {
      throw new Error("Payment QR only available for completed journeys");
    }

    if (journey.paymentStatus === "COMPLETED") {
      throw new Error("Payment has already been completed");
    }

    const amount = journey.actualFare || journey.estimatedFare;

    const qrData = JSON.stringify({
      journeyId: journey._id.toString(),
      amount,
      paymentMethod: journey.paymentMethod,
      timestamp: Date.now(),
    });

    const qrCode = await QRCode.toDataURL(qrData, {
      width: 256,
      margin: 2,
      color: {
        dark: "#1a1a2e",
        light: "#ffffff",
      },
    });

    return {
      journeyId: journey._id,
      amount,
      paymentMethod: journey.paymentMethod,
      qrCode,
    };
  }
  async confirmPayment(journeyId, riderId) {
    const journey = await Ride.findById(journeyId);

    if (!journey) {
      throw new Error("Journey not found");
    }

    if (journey.riderId.toString() !== riderId.toString()) {
      throw new Error(
        "You are not authorized to confirm payment for this journey",
      );
    }

    if (journey.status !== "COMPLETED") {
      throw new Error("Can only confirm payment for completed journeys");
    }

    if (journey.paymentStatus === "COMPLETED") {
      return { alreadyPaid: true, journeyId: journey._id };
    }

    journey.paymentStatus = "COMPLETED";
    await journey.save();

    return {
      alreadyPaid: false,
      journeyId: journey._id,
      amount: journey.actualFare || journey.estimatedFare,
      paymentMethod: journey.paymentMethod,
    };
  }
}
export const journeyService = new JourneyService();
