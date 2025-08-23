import User from '../db/models/user.js';
import Session from '../db/models/session.js';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';
import { randomBytes } from 'crypto';

export const register = async (userData) => {
  const user = await User.findOne({ email: userData.email });
  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const encryptedPassword = await bcrypt.hash(userData.password, 10);
  return await User.create({ ...userData, password: encryptedPassword });
};

export const login = async (userData) => {
   const user = await User.findOne({ email: userData.email });
   if (!user) {
     throw createHttpError(401, 'User not found');
   }
   const isEqual = await bcrypt.compare(userData.password, user.password);

   if (!isEqual) {
     throw createHttpError(401, 'Unauthorized');
   }
await User.deleteOne({ userId: user._id });

   const accessToken = randomBytes(30).toString('base64');
   const refreshToken = randomBytes(30).toString('base64');

   const session = await Session.create({
     userId: user._id.toString(),
     accessToken,
     refreshToken,
     accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
     refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
   });

   return {
     accessToken: session.accessToken,
     refreshToken: session.refreshToken,
     sessionId: session._id,
   };
};

export const createSession = async () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }
  
  const newSession = createSession();

  await Session.deleteOne({ _id: sessionId, refreshToken });

  return await Session.create({
    userId: session.userId,
    ...newSession,
  });   
};

export const logout = async (sessionId) => {
  await Session.deleteOne({ _id: sessionId });
};