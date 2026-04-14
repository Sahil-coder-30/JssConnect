import mongoose from "mongoose";

const connectSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const connectModel = mongoose.model("Connect", connectSchema);
export default connectModel;
