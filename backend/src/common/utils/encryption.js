import crypto from 'crypto';
import { env } from '../../config/env.js';

const ALGORITHM = 'aes-256-cbc'; 
const ENCRYPTION_KEY = env.ENCRYPTION_KEY || 'your-32-character-secret-key!!'; 
const IV_LENGTH = 16; 
export const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(
        ALGORITHM,                                   
        Buffer.from(ENCRYPTION_KEY.slice(0, 32)),    
        iv                                            
    );
    let encrypted = cipher.update(text, 'utf8', 'hex'); 
    encrypted += cipher.final('hex');                   
    return `${encrypted}:${iv.toString('hex')}`;
};
export const decrypt = (encryptedText) => {
    const parts = encryptedText.split(':');
    const encrypted = parts[0];
    const iv = Buffer.from(parts[1], 'hex'); 

    const decipher = crypto.createDecipheriv(
        ALGORITHM,                                   
        Buffer.from(ENCRYPTION_KEY.slice(0, 32)),    
        iv                                           
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8'); 
    decrypted += decipher.final('utf8');                        

    return decrypted;
};

export const maskAadhar = (aadharNumber) => {
    if (!aadharNumber || aadharNumber.length !== 12) {
        return 'XXXX XXXX XXXX';
    }

    const lastFour = aadharNumber.slice(-4);
    return `XXXX XXXX ${lastFour}`;
};
