import { getEnvVar } from './getEnvVar.js';
import { OAuth2Client } from 'google-auth-library';
import createHttpError from 'http-errors';

const googleOAuthClient = new OAuth2Client({
  clientId: getEnvVar('GOOGLE_AUTH_CLIENT_ID'),
  clientSecret: getEnvVar('GOOGLE_AUTH_CLIENT_SECRET'),
  redirectUri:  getEnvVar('GOOGLE_AUTH_REDIRECT_URI'),
});


export const generateAuthUrl = () => {
    const url = googleOAuthClient.generateAuthUrl({
    redirect_uri: getEnvVar('GOOGLE_AUTH_REDIRECT_URI'),
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });

  return url;
};

export const validateCode = async (code) => {
  const { tokens } = await googleOAuthClient.getToken(code);
  if (!tokens.id_token) throw createHttpError(401, 'Unauthorized');

  const ticket = await googleOAuthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: getEnvVar('GOOGLE_AUTH_CLIENT_ID'),
  });
  return ticket;
};

export const getFullNameFromGoogleTokenPayload = (payload) => {
  let fullName = 'Guest';
  if (payload.given_name && payload.family_name) {
    fullName = `${payload.given_name} ${payload.family_name}`;
  } else if (payload.given_name) {
    fullName = payload.given_name;
  }
  return fullName;
};
