import { journeyService } from "./journey.service.js";

export const createJourney = async (req, res) => {
    try {
        const userId = req.user._id;
        const journeyData = req.body;
        const journey = await journeyService.createJourney(userId, journeyData);
        res.status(201).json({
            success: true,
            data: journey,
            message: 'Journey created successfully'
        });
    } catch (error) {
        console.error('Error in createJourney:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create journey'
        });
    }
};

export const acceptJourney = async (req, res) => {
    try {
        const { journeyId } = req.params;

        // ✅ userId lo, driverId nahi
        const userId = req.user._id;

        const journey = await journeyService.acceptJourney(journeyId, userId);
        res.status(200).json({
            success: true,
            data: journey,
            message: 'Journey accepted successfully'
        });
    } catch (error) {
        console.error('Error in acceptJourney:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to accept journey'
        });
    }
};


export const updateJourneyStatus = async (req, res) => {
    try {
        const { journeyId } = req.params;
        const { status } = req.body;

        // ✅ userId lo
        const userId = req.user._id;

        const journey = await journeyService.updateJourneyStatus(journeyId, userId, status);
        res.status(200).json({
            success: true,
            data: journey,
            message: 'Journey status updated successfully'
        });
    } catch (error) {
        console.error('Error in updateJourneyStatus:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update journey status'
        });
    }
};

// export const completeJourney = async (req, res) => {
//     try {
//         const { journeyId } = req.params;
//         const { actualFare, distance, duration } = req.body;
//         const driverId = req.user.driver._id;
//         const completionData = { actualFare, distance, duration };
//         const journey = await journeyService.completeJourney(journeyId, driverId, completionData);
//         res.status(200).json({
//             success: true,
//             data: journey,
//             message: 'Journey completed successfully'
//         });
//     } catch (error) {
//         console.error('Error in completeJourney:', error);
//         res.status(500).json({
//             success: false,
//             message: error.message || 'Failed to complete journey'
//         });
//     }
// };

// ✅ Fixed Controller
export const completeJourney = async (req, res) => {
    try {
        const { journeyId } = req.params;
        const { actualFare, distance, duration } = req.body;

        // ❌ PEHLE: const driverId = req.user.driver._id;
        // ✅ FIX
        const userId = req.user._id;

        const completionData = { actualFare, distance, duration };
        const journey = await journeyService.completeJourney(journeyId, userId, completionData);
        res.status(200).json({
            success: true,
            data: journey,
            message: 'Journey completed successfully'
        });
    } catch (error) {
        console.error('Error in completeJourney:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to complete journey'
        });
    }
};



export const cancelJourney = async (req, res) => {
    try {
        const { journeyId } = req.params;
        const { reason, cancelledBy } = req.body;
        const userId = req.user._id;
        const journey = await journeyService.cancelJourney(journeyId, userId, reason, cancelledBy);
        res.status(200).json({
            success: true,
            data: journey,
            message: 'Journey cancelled successfully'
        });
    } catch (error) {
        console.error('Error in cancelJourney:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to cancel journey'
        });
    }
};

export const getJourneyById = async (req, res) => {
    try {
        const { journeyId } = req.params;
        const userId = req.user._id;
        const journey = await journeyService.getJourneyById(journeyId, userId);
        res.status(200).json({
            success: true,
            data: journey,
            message: 'Journey retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getJourneyById:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve journey'
        });
    }
};
export const getRiderJourneys = async (req, res) => {
    try {
        const riderId = req.user._id;
        const { status } = req.query;
        const journeys = await journeyService.getRiderJourneys(riderId, status || null);
        res.status(200).json({
            success: true,
            data: journeys,
            message: 'Rider journeys retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getRiderJourneys:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve rider journeys'
        });
    }
};
export const getDriverJourneys = async (req, res) => {
    try {
        // ✅ userId lo
        const userId = req.user._id;
        const { status } = req.query;
        const journeys = await journeyService.getDriverJourneys(userId, status || null);
        res.status(200).json({
            success: true,
            data: journeys,
            message: 'Driver journeys retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getDriverJourneys:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve driver journeys'
        });
    }
};

export const generatePaymentQR = async (req, res) => {
    try {
        const { journeyId } = req.params;
        const riderId = req.user._id;
        const paymentQR = await journeyService.generatePaymentQR(journeyId, riderId);
        res.status(200).json({
            success: true,
            data: paymentQR,
            message: 'Payment QR generated successfully'
        });
    } catch (error) {
        console.error('Error in generatePaymentQR:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate payment QR'
        });
    }
};

export const confirmPayment = async (req, res) => {
    try {
        const { journeyId } = req.params;
        const riderId = req.user._id;
        const result = await journeyService.confirmPayment(journeyId, riderId);
        res.status(200).json({
            success: true,
            data: result,
            message: result.alreadyPaid ? 'Payment already completed' : 'Payment confirmed successfully'
        });
    } catch (error) {
        console.error('Error in confirmPayment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to confirm payment'
        });
    }
};
