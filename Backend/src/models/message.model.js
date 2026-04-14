import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
     chatId : {
         type: mongoose.Schema.Types.ObjectId,
         ref : "Chat",
     },
     Content : {
        type : String , 
         minLength : 1 ,
         maxLength : 2000,
         trim : true ,
         required : true ,
     },
      likes : {
        type : Number ,
        default : 0 ,
      },
},{timeStamps : true}) ;

const messageModel = mongoose.Model("Message",messageSchema);
export default messageModel ;
