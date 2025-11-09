import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId:{type:mongoose.Schema.Types.ObjectId,ref:"user",required:true},
    receiverId:{type:mongoose.Schema.Types.ObjectId,ref:"user",required:true},
    msg:{type:String,required:true},
    seen:{type:Boolean,default:false},
    createdAt:{type:Date,default:Date.now()}
});

export default mongoose.model("message",messageSchema);