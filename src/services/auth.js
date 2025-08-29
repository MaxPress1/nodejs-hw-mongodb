import User from '../db/models/user.js';
import Session from '../db/models/session.js';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { FIFTEEN_MINUTES, THIRTY_DAYS, APP_DOMAIN, JWT, TEMPLATES_DIR } from '../constants/index.js';
import { randomBytes } from 'crypto';
import { getEnvVar } from '../utils/getEnvVar.js';
import jwt from 'jsonwebtoken';
import { sendMail } from '../utils/sendMail.js';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

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
     userId: user._id,
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

export const createSession = () => {
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
  
  const newSessionData = createSession();

  await Session.deleteOne({ _id: sessionId, refreshToken });

  const newSession = await Session.create({
    userId: session.userId,
    accessToken: newSessionData.accessToken,
    refreshToken: newSessionData.refreshToken,
    accessTokenValidUntil: newSessionData.accessTokenValidUntil,
    refreshTokenValidUntil: newSessionData.refreshTokenValidUntil,
  });

  return newSession;
};

export const logout = async (sessionId) => {
  await Session.deleteOne({ _id: sessionId });
};

export const requestResetEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const host = process.env.APP_DOMAIN;
  
  const token = jwt.sign(
    {
      sub: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '5m',
    },
  );

  const resetPasswordLink = `${host}/reset-password?token=${token}`;

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-email-password.html',
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: resetPasswordLink,
  });

  await sendMail({
    to: email,
    subject: 'Reset your password!',
    html,
  });
};

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, process.env.JWT_SECRET);
  } catch (err) {
    if (err instanceof Error) throw createHttpError(401, "Token is expired or invalid.");
    throw err;
  }

  const user = await User.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await User.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );
};