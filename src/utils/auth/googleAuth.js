import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleIdToken = async (idToken) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  return {
    providerId: payload.sub,
    email: payload.email,
    name: payload.name,
    emailVerified: payload.email_verified,
  };
};

export {
  verifyGoogleIdToken,
};
