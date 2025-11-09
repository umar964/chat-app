import mongoose from "mongoose";

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    sender: {type: mongoose.Schema.Types.ObjectId,ref: "user",required: true},
    receiver: {type: mongoose.Schema.Types.ObjectId,ref: "user",required: true},
    // what type of notification this is
    type: {type: String,enum: ["follow", "message", "like", "comment"],required: true},
    // unread or read for showing red dot badge
    isRead: {type: Boolean,default: false},
},

    {timestamps: true}
);

export default mongoose.model("Notification",notificationSchema);