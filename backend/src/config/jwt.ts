import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'your_access_secret_key_must_be_at_least_32_characters_long',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key_must_be_at_least_32_characters_long',
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
};
