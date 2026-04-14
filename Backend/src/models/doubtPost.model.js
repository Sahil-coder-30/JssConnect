import mongoose from "mongoose";

const doubtPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["Normal", "Doubt"],
      default: "Normal",
    },
    likeCount: {
      type: Number,
      default: 0
    },
  },
  { timestamps: true }
);

const doubtPostModel = mongoose.model("DoubtPost", doubtPostSchema);
export default doubtPostModel;
