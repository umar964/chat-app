import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true,select:false},
    lastSeen:{type:Date,default:Date.now()},
    isOnline:{type:Boolean,default:false}
});

userSchema.methods.generateAuthToken = function(){
    const userToken = jwt.sign({email:this.email},process.env.MY_SECRET)
    return userToken;
}

export default mongoose.model("user",userSchema);