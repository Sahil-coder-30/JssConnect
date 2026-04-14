import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: { 
      type: String, 
      default: null 
    },
    projectTitle: {
       type: String, 
       required: true, 
       trim: true 
      },
    description: { 
      type: String, 
      required: true 
    },
    bannerImage: 
    { type: String, 
      default: null 
    },
    supportImage: { 
      type: String, 
      default: null 
    },
    techStack:
     [{ 
      type: String
     }],
    links: {
      github: { 
        type: String,
         default: null 
        },
      live: {
         type: String, 
         default: null
         },
    },
    startDate: {
       type: Date,
        default: null
       },
    endDate: { 
      type: Date, 
      default: null 
    },
    viewCount: { 
      type: Number, 
      default: 0 },
    interactions: 
    [{ 
      type: mongoose.Schema.Types.ObjectId,
       ref: "Interaction"
       }],
    pitchVideo: {
      url : {
        type : String ,
        default : null ,
      }
    },
  },
  { timestamps: true }
);

const projectModel = mongoose.model("Project", projectSchema);
export default projectModel;
