import mongoose from "mongoose";

const passkeySchema = new mongoose.Schema({
  credentialID: {
    type: String,
    required: true,
  },
  credentialPublicKey: {
    type: String,
    required: true,
  },
  counter: {
    type: Number,
    default: 0,
  },
  transports: {
    type: [String],
    default: [],
  },
});

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
      type: [passkeySchema],
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
