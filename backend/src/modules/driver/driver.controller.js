import { driverService } from "./driver.service.js";

export const createProfile = async (req, res) => {
    try {
     
        const userId = req.user._id;
        const profileData = req.body;
        const driver = await driverService.createProfile(userId, profileData);

        res.status(201).json({
            success: true,
            data: driver,
            message: 'Driver profile created successfully'
        });
    } catch (error) {
        console.error('Error in createProfile:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create driver profile'
        });
    }
};

// GET DRIVER PROFILE
export const getProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const driver = await driverService.getProfile(userId);
        res.status(200).json({
            success: true,
            data: driver,
            message: 'Driver profile retrieved successfully'
        });
    } catch (error) {
        console.error('Error in getProfile:', error);

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve driver profile'
        });
    }
};
// UPDATE DRIVER PROFILE
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const updateData = req.body;
        const driver = await driverService.updateProfile(userId, updateData);
        res.status(200).json({
            success: true,
            data: driver,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Error in updateProfile:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update driver profile'
        });
    }
};

// UPDATE DRIVER STATUS (ONLINE/OFFLINE)
export const updateStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const { isOnline } = req.body;  
        const driver = await driverService.updateStatus(userId, isOnline);
        res.status(200).json({
            success: true,
            data: driver,
            message: `Status updated to ${isOnline ? 'ONLINE' : 'OFFLINE'}`
        });
    } catch (error) {
        console.error('Error in updateStatus:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update driver status'
        });
    }
};

// GET PROFILE COMPLETION DETAILS
export const getProfileCompletion = async (req, res) => {
    try {
        const userId = req.user._id;

        console.log("Logged user:", req.user);
        const completion = await driverService.getProfileCompletion(userId);
        res.status(200).json({
            success: true,
            data: completion,
            message: 'Profile completion details'
        });
    } catch (error) {
        console.error('Error in getProfileCompletion:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get profile completion details'
        });
    }
};
