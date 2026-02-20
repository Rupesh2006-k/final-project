import { Driver } from "../model/driver.model.js";
import { User } from "../model/user.model.js";

class DriverService {

    async createProfile(userId, profileData) {
        const count = await Driver.countDocuments({ userId });
        if (count > 0) {
            throw new Error('Driver profile already exists');
        }
        const driverData = {
            userId,
            personalInfo: {
                languagePreference: profileData.languagePreference,
                city: profileData.city,
                aadharNumber: profileData.aadharNumber,
                profilePicture: profileData.profilePicture || null
            },

            documents: {
                licenseNumber: profileData.licenseNumber,
                licenseExpiry: profileData.licenseExpiry || null,
                rcNumber: profileData.rcNumber,
                rcExpiry: profileData.rcExpiry || null
            },

            vehicleInfo: {
                vehicleType: profileData.vehicleType,
                vehicleNumber: profileData.vehicleNumber || null,
                vehicleModel: profileData.vehicleModel || null,
                vehicleColor: profileData.vehicleColor || null
            }
        };
        const driver = new Driver(driverData);
        await driver.save();
        await driver.populate('userId', 'name email phone role');

        return this.formatDriverResponse(driver);
    }

    async getProfile(userId) {
        const driver = await Driver.findOne({ userId })
            .populate('userId', 'name email phone role');
        if (!driver) {
            throw new Error('Driver profile not found. Please create your profile first.');
        }
        return this.formatDriverResponse(driver);
    }
    async updateProfile(userId, updateData) {
        const existingProfile = await Driver.findOne({ userId })
            .populate('userId', 'name email phone role');

        if (!existingProfile) {
            throw new Error('Driver profile not found. Please create your profile first.');
        }
        const updates = {};
        if (updateData.languagePreference) {
            updates['personalInfo.languagePreference'] = updateData.languagePreference;
        }
        if (updateData.city) {
            updates['personalInfo.city'] = updateData.city;
        }
        if (updateData.profilePicture) {
            updates['personalInfo.profilePicture'] = updateData.profilePicture;
        }

        if (updateData.licenseExpiry) {
            updates['documents.licenseExpiry'] = updateData.licenseExpiry;
        }
        if (updateData.rcExpiry) {
            updates['documents.rcExpiry'] = updateData.rcExpiry;
        }

        if (updateData.vehicleNumber) {
            updates['vehicleInfo.vehicleNumber'] = updateData.vehicleNumber;
        }
        if (updateData.vehicleModel) {
            updates['vehicleInfo.vehicleModel'] = updateData.vehicleModel;
        }
        if (updateData.vehicleColor) {
            updates['vehicleInfo.vehicleColor'] = updateData.vehicleColor;
        }

        const updatedDriver = await Driver.findOneAndUpdate(
            { userId },                  // Find condition
            { $set: updates },           // Update operation
            {
                new: true,               // Return updated document
                runValidators: true      // Run schema validations
            }
        ).populate('userId', 'name email phone role');
        return this.formatDriverResponse(updatedDriver);
    }

    async updateStatus(userId, isOnline) {
        const driver = await Driver.findOne({ userId })
            .populate('userId', 'name email phone role');

        if (!driver) {
            throw new Error('Driver profile not found');
        }
        if (isOnline && !driver.canGoOnline()) {
            if (driver.status.profileCompletionPercentage < 70) {
                throw new Error('Profile must be at least 70% complete to go online');
            }
            if (!driver.status.isVerified) {
                throw new Error('Your profile is pending verification. Please wait for admin approval.');
            }
        }
        const updatedDriver = await Driver.findOneAndUpdate(
            { userId },                           // Find condition
            { $set: { 'status.isOnline': isOnline } },  // Update isOnline field
            { new: true }                         // Return updated document
        ).populate('userId', 'name email phone role');
        return this.formatDriverResponse(updatedDriver);
    }
    async getProfileCompletion(userId) {
        const driver = await Driver.findOne({ userId })
            .populate('userId', 'name email phone role');

        if (!driver) {
            throw new Error('Driver profile not found');
        }
        return {
            completionPercentage: driver.status.profileCompletionPercentage,  // 0-100
            missingFields: driver.getMissingFields(),  // Array of missing optional fields
            canGoOnline: driver.canGoOnline(),         // Boolean (can driver go online?)
            isVerified: driver.status.isVerified       // Boolean (is admin verified?)
        };
    }

    formatDriverResponse(driver) {
        return {
            _id: driver._id,
            user: {
                _id: driver.userId._id,
                name: driver.userId.name,
                email: driver.userId.email,
                phone: driver.userId.phone
            },

            personalInfo: {
                languagePreference: driver.personalInfo.languagePreference,
                city: driver.personalInfo.city,
                profilePicture: driver.personalInfo.profilePicture,
                aadharNumber: driver.getMaskedAadhar()  // MASKED: XXXX XXXX 9012
            },

            documents: {
                licenseNumber: driver.documents.licenseNumber,
                licenseExpiry: driver.documents.licenseExpiry,
                rcNumber: driver.documents.rcNumber,
                rcExpiry: driver.documents.rcExpiry
            },

            vehicleInfo: {
                vehicleType: driver.vehicleInfo.vehicleType,
                vehicleNumber: driver.vehicleInfo.vehicleNumber,
                vehicleModel: driver.vehicleInfo.vehicleModel,
                vehicleColor: driver.vehicleInfo.vehicleColor
            },

            status: {
                isOnline: driver.status.isOnline,
                isVerified: driver.status.isVerified,
                profileCompletionPercentage: driver.status.profileCompletionPercentage
            },

            stats: {
                rating: driver.stats.rating,
                totalRides: driver.stats.totalRides
            },
        };
    }
}
export const driverService = new DriverService();
