import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
  {
    toWhomInteracted: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "onModel",
    },
    onModel: {
      type: String,
      required: true,
      enum: ["User", "Project", "DoubtPost"],
    },
    whoInteracted: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const interactionModel = mongoose.model("Interaction", interactionSchema);
export default interactionModel;
