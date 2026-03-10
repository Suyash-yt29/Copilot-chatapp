import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { jwtConfig } from '../config/jwt';
import logger from '../config/logger';

export interface JwtPayload {
  userId: string;
  email: string;
}

export class AuthUtil {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateAccessToken(payload: JwtPayload): string {
    try {
      return jwt.sign(payload, jwtConfig.accessSecret as string, {
        expiresIn: jwtConfig.accessExpiry,
        algorithm: 'HS256',
      } as any);
    } catch (error) {
      logger.error('Error generating access token:', error);
      throw error;
    }
  }

  static generateRefreshToken(payload: JwtPayload): string {
    try {
      return jwt.sign(payload, jwtConfig.refreshSecret as string, {
        expiresIn: jwtConfig.refreshExpiry,
        algorithm: 'HS256',
      } as any);
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw error;
    }
  }

  static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, jwtConfig.accessSecret as string, {
        algorithms: ['HS256'],
      } as any) as unknown as JwtPayload;
    } catch (error) {
      logger.error('Error verifying access token:', error);
      throw error;
    }
  }

  static verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, jwtConfig.refreshSecret as string, {
        algorithms: ['HS256'],
      } as any) as unknown as JwtPayload;
    } catch (error) {
      logger.error('Error verifying refresh token:', error);
      throw error;
    }
  }
}

export class ValidationUtil {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    return password.length >= 8;
  }

  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
