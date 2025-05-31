export const PORT = () => process.env.PORT;
export const NODE_ENV = () => process.env.NODE_ENV;

// cloudinary keys
export const CLOUD_NAME = () => process.env.CLOUD_NAME;
export const CLOUD_API_KEY = () => process.env.CLOUD_API_KEY;
export const CLOUD_SECRET_KEY = () => process.env.CLOUD_SECRET_KEY;

// stripe key
export const STRIP_API_KEY = () => process.env.STRIP_API_KEY;

// jwt token keys
export const ACCESS_SECRET = () => process.env.ACCESS_SECRET;
export const REFRESH_SECRET = () => process.env.REFRESH_SECRET;

// client keys
export const CLIENT_URL = () => process.env.CLIENT_URL;

// resend api keys
export const RESEND_API_KEY = () => process.env.RESEND_API_KEY;
export const EMAIL_SENDER = () => process.env.EMAIL_SENDER;
