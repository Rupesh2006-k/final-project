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
import {
    createJourneySchema,
    updateJourneyStatusSchema,
    completeJourneySchema,
    cancelJourneySchema
} from './journey.validation.js';

const router = express.Router();

router.post(
    '/create',
    authenticate,                           
    validate(createJourneySchema),          
    createJourney                           
);

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

router.post(
    '/:journeyId/cancel',
    authenticate,                          
    validate(cancelJourneySchema),          
    cancelJourney                         
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
    '/:journeyId/accept',
    authenticate,                          
    authorizeRole('DRIVER'),               
    acceptJourney                          
);

router.patch(
    '/:journeyId/status',
    authenticate,                          
    validate(updateJourneyStatusSchema),   
    updateJourneyStatus                   
);

router.post(
    '/:journeyId/complete',
    authenticate,                         
    validate(completeJourneySchema),       
    completeJourney                         
);

router.get(
    '/driver/history',
    authenticate,                          
    authorizeRole('DRIVER'),               
    getDriverJourneys                       
);

export default router;
