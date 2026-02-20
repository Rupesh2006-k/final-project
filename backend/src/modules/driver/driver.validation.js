import { z } from 'zod';


export const createDriverProfileSchema = z.object({
    body: z.object({
        languagePreference: z.enum(
            ['HINDI', 'ENGLISH', 'MARATHI', 'TAMIL', 'TELUGU', 'KANNADA', 'BENGALI', 'GUJARATI'],
            {
                required_error: 'Language preference is required',  // Error if missing
                invalid_type_error: 'Invalid language preference'   // Error if not in enum
            }
        ),

        city: z.enum(
            ['MUMBAI', 'DELHI', 'BANGALORE', 'HYDERABAD', 'CHENNAI', 'KOLKATA', 'PUNE', 'AHMEDABAD'],
            {
                required_error: 'City is required',      // Error if missing
                invalid_type_error: 'Invalid city'       // Error if not in enum
            }
        ),

        aadharNumber: z
            .string({
                required_error: 'Aadhar number is required'  // Error if missing
            })
            .regex(/^[0-9]{12}$/, 'Aadhar number must be exactly 12 digits')  // Must match pattern
            .trim(),  // Remove leading/trailing spaces

        licenseNumber: z
            .string({
                required_error: 'License number is required'  // Error if missing
            })
            .min(8, 'License number must be at least 8 characters')      // Minimum length
            .max(20, 'License number cannot exceed 20 characters')       // Maximum length
            .trim(),  // Remove leading/trailing spaces

        licenseExpiry: z
            .string()
            .optional()  // Field is optional
            .refine((date) => {
                if (!date) return true;  // Skip validation if not provided
                return new Date(date) > new Date();  // Must be future date
            }, 'License expiry date must be in the future'),

        rcNumber: z
            .string({
                required_error: 'RC number is required'  // Error if missing
            })
            .min(8, 'RC number must be at least 8 characters')      // Minimum length
            .max(15, 'RC number cannot exceed 15 characters')       // Maximum length
            .trim(),  // Remove leading/trailing spaces

        rcExpiry: z
            .string()
            .optional()  // Field is optional
            .refine((date) => {
                if (!date) return true;  // Skip validation if not provided
                return new Date(date) > new Date();  // Must be future date
            }, 'RC expiry date must be in the future'),

        vehicleType: z.enum(
            ['CAR', 'BIKE', 'AUTO', 'E_RICKSHAW', 'ELECTRIC_SCOOTER'],
            {
                required_error: 'Vehicle type is required',    // Error if missing
                invalid_type_error: 'Invalid vehicle type'     // Error if not in enum
            }
        ),
        vehicleNumber: z
            .string()
            .optional()  // Field is optional
            .refine((val) => {
                if (!val) return true;  // Skip validation if not provided
                // Regex: 2 letters + 2 digits + 1-2 letters + 4 digits
                return /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(val);
            }, 'Invalid vehicle number format (e.g., MH01AB1234)'),

        vehicleModel: z
            .string()
            .max(50, 'Vehicle model cannot exceed 50 characters')  // Maximum length
            .optional(),  // Field is optional

        vehicleColor: z
            .string()
            .max(20, 'Vehicle color cannot exceed 20 characters')  // Maximum length
            .optional(),  // Field is optional

        profilePicture: z
            .string()
            .url('Profile picture must be a valid URL')  // Must be valid URL
            .optional()  // Field is optional
    })
});

export const updateDriverProfileSchema = z.object({
    body: z.object({
        languagePreference: z.enum(
            ['HINDI', 'ENGLISH', 'MARATHI', 'TAMIL', 'TELUGU', 'KANNADA', 'BENGALI', 'GUJARATI']
        ).optional(),
        city: z.enum(
            ['MUMBAI', 'DELHI', 'BANGALORE', 'HYDERABAD', 'CHENNAI', 'KOLKATA', 'PUNE', 'AHMEDABAD']
        ).optional(),
        licenseExpiry: z
            .string()
            .optional()
            .refine((date) => {
                if (!date) return true;  // Skip if not provided
                return new Date(date) > new Date();  // Must be future
            }, 'License expiry date must be in the future'),

        rcExpiry: z
            .string()
            .optional()
            .refine((date) => {
                if (!date) return true;  // Skip if not provided
                return new Date(date) > new Date();  // Must be future
            }, 'RC expiry date must be in the future'),
        vehicleNumber: z
            .string()
            .optional()
            .refine((val) => {
                if (!val) return true;  // Skip if not provided
                return /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/.test(val);
            }, 'Invalid vehicle number format (e.g., MH01AB1234)'),

        vehicleModel: z
            .string()
            .max(50, 'Vehicle model cannot exceed 50 characters')
            .optional(),

        vehicleColor: z
            .string()
            .max(20, 'Vehicle color cannot exceed 20 characters')
            .optional(),
        profilePicture: z
            .string()
            .url('Profile picture must be a valid URL')
            .optional()
    })
});

export const updateStatusSchema = z.object({
    body: z.object({
        isOnline: z.boolean({
            required_error: 'Status is required',              // Error if missing
            invalid_type_error: 'Status must be true or false' // Error if not boolean
        })
    })
});
