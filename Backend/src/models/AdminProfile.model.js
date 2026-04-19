import mongoose from 'mongoose';

const AdminProfileSchema = new mongoose.Schema({
  Admin : {
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
   Designation : {
    type : String ,
     required : true ,
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
  BlockerUser : { 
    userId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User',
    required :true ,
    },
    reason : {
        type : String ,
        required : true ,
    }
  }
});

const AdminprofileModel = mongoose.model("AdminProfile", AdminProfileSchema);
export default AdminprofileModel;  
