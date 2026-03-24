import { Request, Response } from 'express';
import { UserModel } from '../models/index.js';
import { AuthUtil, ValidationUtil } from '../utils/auth.js';
import { asyncHandler, AppError } from '../middleware/error.js';
import logger from '../config/logger.js';
import passport from '../config/passport.js';

// Registration controller (restored after patch)
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, public_key, country, language, phone_number } = req.body;

  if (!username || typeof username !== 'string' || username.length < 3) {
    throw new AppError(400, 'Username is required and must be at least 3 characters');
  }
  if (!ValidationUtil.isValidEmail(email)) {
    throw new AppError(400, 'Invalid email format');
  }
  if (password && !ValidationUtil.isValidPassword(password)) {
    throw new AppError(400, 'Password must be at least 8 characters');
  }
  if (!country || typeof country !== 'string') {
    throw new AppError(400, 'Country/Region is required');
  }
  if (!language || typeof language !== 'string') {
    throw new AppError(400, 'Language preference is required');
  }
  // Phone number is now optional

  let existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    throw new AppError(409, 'Email already registered');
  }
  let existingUsername = await UserModel.findByUsername(username);
  if (existingUsername) {
    throw new AppError(409, 'Username already taken');
  }

  const passwordHash = password ? await AuthUtil.hashPassword(password) : null;
  const user = await UserModel.create(username, email, passwordHash, public_key, country, language, phone_number || null);

  const accessToken = AuthUtil.generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = AuthUtil.generateRefreshToken({
    userId: user.id,
    email: user.email,
  });

  logger.info(`User registered: ${email}`);

  res.status(201).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      country: user.country,
      language: user.language,
      phone_number: user.phone_number,
      trust_score: user.trust_score,
    },
    accessToken,
    refreshToken,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Allow login with email or username
  let user = await UserModel.findByEmail(email);
  if (!user) {
    user = await UserModel.findByUsername(email);
  }

  if (!user) {
    throw new AppError(401, 'Not registered');
  }

  if (!user.password_hash) {
    throw new AppError(401, 'Account registered with Google. Please login with Google.');
  }

  const isPasswordValid = await AuthUtil.comparePasswords(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError(401, 'Incorrect password');
  }

  const accessToken = AuthUtil.generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = AuthUtil.generateRefreshToken({
    userId: user.id,
    email: user.email,
  });

  logger.info(`User logged in: ${email}`);

  res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      public_key: user.public_key,
    },
    accessToken,
    refreshToken,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError(400, 'Refresh token is required');
  }

  const payload = AuthUtil.verifyRefreshToken(refreshToken);
  const user = await UserModel.findById(payload.userId);

  if (!user) {
    throw new AppError(401, 'User not found');
  }

  const newAccessToken = AuthUtil.generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  const newRefreshToken = AuthUtil.generateRefreshToken({
    userId: user.id,
    email: user.email,
  });

  logger.info(`Token refreshed for user: ${user.email}`);

  res.status(200).json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

export const getPublicKey = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!ValidationUtil.isValidUUID(userId)) {
    throw new AppError(400, 'Invalid user ID format');
  }

  const publicKey = await UserModel.getPublicKey(userId);
  if (!publicKey) {
    throw new AppError(404, 'User not found');
  }

  res.status(200).json({ public_key: publicKey });
});

// Google OAuth
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

export const googleAuthCallback = (req: Request, res: Response) => {
  passport.authenticate('google', { session: false }, async (err: any, user: any) => {
    if (err || !user) {
      logger.error('Google OAuth callback error:', err);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`);
    }

    try {
      const accessToken = AuthUtil.generateAccessToken({
        userId: user.id,
        email: user.email,
      });

      const refreshToken = AuthUtil.generateRefreshToken({
        userId: user.id,
        email: user.email,
      });

      logger.info(`User logged in via Google: ${user.email}`);

      // Redirect to frontend with tokens and user data
      const userData = encodeURIComponent(JSON.stringify({
        id: user.id,
        email: user.email,
        username: user.username,
        public_key: user.public_key,
      }));
      
      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${userData}`
      );
    } catch (error) {
      logger.error('Google OAuth token generation error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=token_generation_failed`);
    }
  })(req, res);
};
