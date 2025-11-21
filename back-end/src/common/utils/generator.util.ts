import { v4 as uuidv4 } from 'uuid';

export class GeneratorUtil {
  static generateUuid(): string {
    return uuidv4();
  }

  static generateRandomString(length: number = 32): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  }

  static generateRandomNumber(min: number = 100000, max: number = 999999): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static generateVerificationCode(): string {
    return this.generateRandomNumber().toString();
  }
}