import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800, 
  },
});

const blacklistModel = mongoose.model("Blacklist", blacklistSchema);
export default blacklistModel;
