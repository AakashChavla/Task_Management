import * as crypto from 'crypto';

export class HelperService {
  generateOTP(): number {
    const randomBytes = crypto.randomBytes(4);
    const otp = (randomBytes.readUInt32BE(0) % 900000) + 100000;
    return otp;
  }
}
