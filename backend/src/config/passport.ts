import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserModel } from '../models/index.js';
import logger from './logger.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email provided by Google'));
        }

        let user = await UserModel.findByEmail(email);
        if (!user) {
          // Create new user with Google
          const username = profile.displayName || email.split('@')[0];
          // Placeholder public key - will be updated by frontend
          const placeholderPublicKey = 'placeholder-key-' + Date.now();
          user = await UserModel.create(
            username,
            email,
            null, // no password for Google users
            placeholderPublicKey,
            'US', // default country
            'en', // default language
            null // no phone number
          );
          logger.info(`New user created via Google OAuth: ${email}`);
        }

        return done(null, user);
      } catch (error) {
        logger.error('Google OAuth error:', error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;