import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required : function() {
        return !this.googleId; 
      },
      default: null,
    },
    contact: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },
    googleId: {
      type: String,
      default: null,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);
export default userModel;
