import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    connection : {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connect",
      required: true,
    },
    message :{
      type : mongoose.Schema.Types.ObjectId,
      ref : "Message",
      required : true ,
    },
  },
  { timestamps: true }
);

const chatModel = mongoose.model("Chat", chatSchema);
export default chatModel;
