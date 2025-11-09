import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  },
  text:String,
  fileUrl: String, // URL from Firebase Storage
  fileType: String, // "image" or "video"
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Status", statusSchema);
