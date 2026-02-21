import mongoose from "mongoose";
const journeySchema = new mongoose.Schema({
    // USER REFERENCES
    riderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Rider ID is required']
    },

    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
    },
    status: {
        type: String,
        enum: {
            values: ['REQUESTED', 'ACCEPTED', 'ARRIVED', 'STARTED', 'COMPLETED', 'CANCELLED'],
            message: 'Invalid journey status'
        },
        default: 'REQUESTED'
    },
    vehicleType: {
        type: String,
        enum: ['CAR', 'BIKE', 'AUTO', 'E_RICKSHAW', 'ELECTRIC_SCOOTER'],
        required: [true, 'Vehicle type is required']
    },
    pickup: {
        address: {
            type: String,
            required: [true, 'Pickup address is required'],
            trim: true
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],  // [longitude, latitude]
                required: [true, 'Pickup coordinates are required']
            }
        }
    },

    dropoff: {
        address: {
            type: String,
            required: [true, 'Dropoff address is required'],
            trim: true
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],  // [longitude, latitude]
                required: [true, 'Dropoff coordinates are required']
            }
        }
    },

    estimatedFare: {
        type: Number,
        required: [true, 'Estimated fare is required'],
        min: [0, 'Fare cannot be negative']
    },

    actualFare: {
        type: Number,
        default: null,
        min: [0, 'Fare cannot be negative']
    },

    distance: {
        type: Number,
        default: null,
        min: [0, 'Distance cannot be negative']
    },

    duration: {
        type: Number,
        default: null,
        min: [0, 'Duration cannot be negative']
    },
    paymentMethod: {
        type: String,
        enum: ['CASH', 'CARD', 'UPI', 'WALLET'],
        required: [true, 'Payment method is required']
    },

    paymentStatus: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },

    requestedAt: {
        type: Date,
        default: Date.now
    },

    acceptedAt: {
        type: Date,
        default: null
    },

    arrivedAt: {
        type: Date,
        default: null
    },

    startedAt: {
        type: Date,
        default: null
    },

    completedAt: {
        type: Date,
        default: null
    },

    cancelledAt: {
        type: Date,
        default: null
    },
    cancellationReason: {
        type: String,
        default: null,
        trim: true
    },

    cancelledBy: {
        type: String,
        enum: ['RIDER', 'DRIVER', null],
        default: null
    },
    rating: {
        type: Number,
        default: null,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },

    feedback: {
        type: String,
        default: null,
        trim: true,
        maxlength: [500, 'Feedback cannot exceed 500 characters']
    }

}, {
    timestamps: true  
});


journeySchema.index({ 'pickup.location': '2dsphere' });
journeySchema.index({ 'dropoff.location': '2dsphere' });

journeySchema.methods.canBeCancelled = function () {
    return ['REQUESTED', 'ACCEPTED', 'ARRIVED'].includes(this.status);
};

journeySchema.methods.isValidStatusTransition = function (newStatus) {
    const validTransitions = {
        'REQUESTED': ['ACCEPTED', 'CANCELLED'],
        'ACCEPTED': ['ARRIVED', 'CANCELLED'],
        'ARRIVED': ['STARTED', 'CANCELLED'],
        'STARTED': ['COMPLETED', 'CANCELLED'],
        'COMPLETED': [],
        'CANCELLED': []
    };

    return validTransitions[this.status]?.includes(newStatus) || false;
};

export const Journey = mongoose.model('Ride', journeySchema);
export const Ride = Journey;
