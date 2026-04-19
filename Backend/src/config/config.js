import dotenv from 'dotenv';

dotenv.config();
  if(!process.env.MONGO_URI){
    throw new Error("MONGO_URI is not defined");
  }
  if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined");
  }
  if(!process.env.IMAGE_KIT_PRIVATE_KEY){
    throw new Error("IMAGE_KIT_PRIVATE_KEY is not defined");
  }
  if(!process.env.IMAGE_KIT_PUBLIC_KEY){
    throw new Error("IMAGE_KIT_PUBLIC_KEY is not defined");
  }
const config = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  IMAGE_KIT_PRIVATE_KEY: process.env.IMAGE_KIT_PRIVATE_KEY,
  IMAGE_KIT_PUBLIC_KEY: process.env.IMAGE_KIT_PUBLIC_KEY,
};

export { config };