import mongoose from "mongoose";
import { encrypt, decrypt, maskAadhar } from "../../common/utils/encryption.js";

const driverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    personalInfo: {
      languagePreference: {
        type: String,
        enum: [
          "HINDI",
          "ENGLISH",
          "MARATHI",
          "TAMIL",
          "TELUGU",
          "KANNADA",
          "BENGALI",
          "GUJARATI",
        ],
        required: [true, "Language preference is required"],
      },

      city: {
        type: String,
        enum: [
          "MUMBAI",
          "DELHI",
          "BANGALORE",
          "HYDERABAD",
          "CHENNAI",
          "KOLKATA",
          "PUNE",
          "AHMEDABAD",
        ],
        required: [true, "City is required"],
      },

      profilePicture: {
        type: String,
        default: null,
      },
      aadharNumber: {
        type: String,
        required: [true, "Aadhar number is required"],
        unique: true,
      },
    },
    documents: {
      licenseNumber: {
        type: String,
        required: [true, "License number is required"],
        uppercase: true,
        trim: true,
      },

      licenseExpiry: {
        type: Date,
        default: null,
      },
      rcNumber: {
        type: String,
        required: [true, "RC number is required"],
        uppercase: true,
        trim: true,
      },
      rcExpiry: {
        type: Date,
        default: null,
      },
    },
    vehicleInfo: {
      vehicleType: {
        type: String,
        enum: ["CAR", "BIKE", "AUTO", "E_RICKSHAW", "ELECTRIC_SCOOTER"],
        required: [true, "Vehicle type is required"],
      },
      vehicleNumber: {
        type: String,
        uppercase: true,
        trim: true,
        default: null,
      },
      vehicleModel: {
        type: String,
        trim: true,
        default: null,
      },

      vehicleColor: {
        type: String,
        trim: true,
        default: null,
      },
    },
    status: {
      isOnline: {
        type: Boolean,
        default: false,
      },

      isVerified: {
        type: Boolean,
        default: false,
      },
      profileCompletionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    stats: {
      rating: {
        type: Number,
        default: 5.0,
        min: 1,
        max: 5,
      },

      totalRides: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  {
    timestamps: true,
  },
);


driverSchema.pre("save", function () {
  if (
    this.isModified("personalInfo.aadharNumber") &&
    this.personalInfo.aadharNumber &&
    !this.personalInfo.aadharNumber.includes(":")
  ) {
    this.personalInfo.aadharNumber = encrypt(this.personalInfo.aadharNumber);
  }
});

driverSchema.pre("save", function () {
  this.status.profileCompletionPercentage = this.calculateProfileCompletion();
});

driverSchema.methods.calculateProfileCompletion = function () {
  let percentage = 0;
  if (this.personalInfo.languagePreference) percentage += 10;
  if (this.personalInfo.city) percentage += 10;
  if (this.personalInfo.aadharNumber) percentage += 15;
  if (this.documents.licenseNumber) percentage += 15;
  if (this.documents.rcNumber) percentage += 10;
  if (this.vehicleInfo.vehicleType) percentage += 10;
  if (this.personalInfo.profilePicture) percentage += 10;
  if (this.documents.licenseExpiry) percentage += 5;
  if (this.documents.rcExpiry) percentage += 5;
  if (this.vehicleInfo.vehicleModel) percentage += 5;
  if (this.vehicleInfo.vehicleColor) percentage += 5;
  return percentage;
};
driverSchema.methods.getMaskedAadhar = function () {
  if (!this.personalInfo.aadharNumber) return null;
  const decrypted = decrypt(this.personalInfo.aadharNumber);
  return maskAadhar(decrypted);
};

driverSchema.methods.getMissingFields = function () {
  const missing = [];

  if (!this.personalInfo.profilePicture) {
    missing.push({
      field: "profilePicture",
      weight: 10,
      label: "Profile Picture",
    });
  }
  if (!this.documents.licenseExpiry) {
    missing.push({
      field: "licenseExpiry",
      weight: 5,
      label: "License Expiry Date",
    });
  }
  if (!this.documents.rcExpiry) {
    missing.push({ field: "rcExpiry", weight: 5, label: "RC Expiry Date" });
  }
  if (!this.vehicleInfo.vehicleModel) {
    missing.push({ field: "vehicleModel", weight: 5, label: "Vehicle Model" });
  }
  if (!this.vehicleInfo.vehicleColor) {
    missing.push({ field: "vehicleColor", weight: 5, label: "Vehicle Color" });
  }

  return missing;
};
driverSchema.methods.canGoOnline = function () {
  return (
    this.status.profileCompletionPercentage >= 70 && this.status.isVerified
  );
};

export const Driver = mongoose.model("Driver", driverSchema);
