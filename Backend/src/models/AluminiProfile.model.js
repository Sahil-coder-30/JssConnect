import mongoose from 'mongoose';

const AluminiProfileSchema = new mongoose.Schema({
  Alumini : {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, 
   profilePhoto : {
      Image : {
        type : String ,
        required : true ,
      },
      alternate : { 
      type : String ,
       default : null ,
      },
   },
   Company : {
    type : String ,
     required : true ,
     default : null ,
   },
   About : {
    type : String ,
    required : true ,
    trim : true ,
    default : null ,
    minLength : 3 ,
    maxLength :  1000 ,
   },   
   backCoverImage: {
    type: String,
    default: null,
  },
});

const AluminiprofileModel = mongoose.model("AluminiProfile", AluminiProfileSchema);
export default AluminiprofileModel;  
