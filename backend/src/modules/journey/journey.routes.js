import express from 'express';
import {
    createJourney,
    acceptJourney,
    updateJourneyStatus,
    completeJourney,
    cancelJourney,
    getJourneyById,
    getRiderJourneys,
    getDriverJourneys,
    generatePaymentQR,
    confirmPayment
} from './journey.controller.js';
import { authenticate, authorizeRole } from '../../common/middleware/auth.middleware.js';
import { validate } from '../../common/middleware/auth.validate.js';

import { createJourneySchema, updateJourneyStatusSchema, completeJourneySchema, cancelJourneySchema
} from './journey.validation.js';

const router = express.Router();
/*
## Fare Kaise Calculate Hoga
Distance = Haversine formula se pickup aur dropoff ke beech
CAR:
  Base = ₹50
  Per KM = ₹12
Agar distance = 3.5 KM:
  Fare = 50 + (3.5 × 12) = 50 + 42 = ₹92
*/ 
router.post(
    '/create',
    authenticate,                           
    validate(createJourneySchema),          
    createJourney                           
);


router.post(
    '/:journeyId/accept',
    authenticate,                          
    authorizeRole('DRIVER'),               
    acceptJourney                          
);

/*
ACCEPTED → STARTED ❌ (Direct nahi ho sakta!)
ACCEPTED → ARRIVED → STARTED ✅ (Sahi order)
*/ 

router.patch(
    '/:journeyId/status',
    authenticate,                          
    validate(updateJourneyStatusSchema),   
    updateJourneyStatus                   
)

router.post(
    '/:journeyId/complete',
    authenticate,                         
    validate(completeJourneySchema),       
    completeJourney                         
);

router.get(
    '/:journeyId/payment-qr',
    authenticate,                         
    generatePaymentQR                     
);

router.post(
    '/:journeyId/confirm-payment',
    authenticate,                          
    confirmPayment                         
);


router.post(
    '/:journeyId/cancel',
    authenticate,                          
    validate(cancelJourneySchema),          
    cancelJourney                         
);

// ye baki ke aips hain
router.get(
    '/:journeyId',
    authenticate,                           
    getJourneyById                          
);

router.get(
    '/rider/history',
    authenticate,                        
    getRiderJourneys                      
);

router.get(
    '/driver/history',
    authenticate,                          
    authorizeRole('DRIVER'),               
    getDriverJourneys                       
);

export default router;
