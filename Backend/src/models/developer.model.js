import mongoose from "mongoose";

const developerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passkeys: {
      type: [Object], // Array of { credentialID, credentialPublicKey, counter, transports }
      default: [],
    },
    currentChallenge: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const developerModel = mongoose.model("Developer", developerSchema);
export default developerModel;
