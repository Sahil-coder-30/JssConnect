import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String, // 'email_verification' or 'password_reset'
    default: 'email_verification'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes (in seconds)
  },
});

const otpModel = mongoose.model("Otp", otpSchema);
export default otpModel;
