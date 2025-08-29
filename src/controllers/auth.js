
import { register, login, refreshUsersSession, logout, requestResetEmail, resetPassword   } from '../services/auth.js';

import { THIRTY_DAYS } from '../constants/index.js';

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
  res.cookie('sessionId', session.sessionId || session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
};

export const refreshUserSessionController = async (req, res) => {
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const registerController = async (req, res) => {
  const user = await register(req.body);
   res.status(201).json({
     status: 201,
     message: 'Successfully registered a user!',
     data: user,
   });
};

export const loginController = async (req, res) => {
  const session = await login(req.body);
  
  setupSession(res, session);
  
  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutController = async (req, res) => {
  const sessionId = req.cookies.sessionId;
  
  if (sessionId && sessionId !== 'undefined') {
    await logout(sessionId);
  }
  
  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');
  res.status(204).send();
};

export const requestResetEmailController = async (req, res) => {
  await requestResetEmail(req.body.email);
  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};