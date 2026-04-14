import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  coverImage: {
    type: String,
    default: null,
  },
  backCoverImage: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  bio: {
    type: String,
    default: null,
    maxlength: 500,
    minLength: 10,
    trim : true ,
  },
  about: {
    type: String,
    default: null,
  },
  year: {
    type: String,
    default: null,
  },
  views: {
    type: Number,
    default: 0,
  },
  branch: {
    type: String,
    default: null,
  },
  interactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Interaction",
  }],
  socialLinks: [{
    platform: { type: String, enum: ['LinkedIn', 'GitHub', 'Twitter', 'Instagram'] },
    url: { type: String, trim: true }
  }],
  location : {
      type : String ,
      default : null ,
    },
  education: [
    {
      institution: {
        type: String,
        required: true,
      },
      degree: {
        type: String,
        required: true,
      },
      startYear: {
        type: Number,
        required: true,
      },
      endYear: {
        type: Number
      },
    },
  ],
  skills: [{
    type: String,
    required: true,
  }]
},
  { timestamps: true });

const profileModel = mongoose.model("Profile", profileSchema);
export default profileModel;