import ImageKit from "@imagekit/nodejs";
import { config } from "../config/config.js";

let _client = null;

const getClient = () => {
  if (!_client) {
    if (!config.IMAGE_KIT_PRIVATE_KEY) {
      throw new Error("IMAGE_KIT_PRIVATE_KEY is not configured.");
    }
    _client = new ImageKit({
      publicKey: config.IMAGE_KIT_PUBLIC_KEY,
      privateKey: config.IMAGE_KIT_PRIVATE_KEY,
    });
  }
  return _client;
};

const uploadImage = async (folder = "JssConnect", buffer, fileName) => {
  try {
    const client = getClient();
    const response = await client.files.upload({
      file: buffer,
      fileName: fileName,
      folder: folder,
    });
    return response.url; // Return the URL of the uploaded image
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
};

export { uploadImage };
