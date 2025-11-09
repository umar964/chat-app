import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
 
 
import userModel from './Models/userModel.js';
import messageModel from './Models/messageModel.js';

import multer from 'multer'; // for handling multipart/form-data (file uploads)
import StatusModel from './Models/statusModel.js';
import bcrypt from 'bcrypt';

import dotenv from 'dotenv';
import cron from 'node-cron'; // for deleting the status from clodinary

import {CloudinaryStorage} from 'multer-storage-cloudinary';
import cloudinary from './cloudinaryConfig.js';


import http from 'http';
import { Server } from 'socket.io';
import notificationModel from './Models/notificationModel.js';
import { use } from 'react';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());


 

 

 

 





//  for database connection
mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
});





//  for socket connection
const users = new Map() //  store all the users that are connected to socket and this will store sockedId and userId
const io = new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
});

io.on("connection",(socket)=>{
    socket.on("register",async (userId)=>{
        // users[userId] = socket.id;
        if (!users.has(userId)) {
        users.set(userId, new Set());
       }
       users.get(userId).add(socket.id);
       console.log("User connected:",socket.id,userId);

       try{
        await userModel.findByIdAndUpdate(userId,{isOnline:true});
        console.log("Updated isOnline status to true for user:", userId);
       }catch(err){
        console.log("Failed to update isOnline status");
       }
    });

    socket.on("send-message",async ({senderId,receiverId,msg})=>{
        

        // store the message in database
        const message = await messageModel.create({senderId,receiverId,msg});
        // console.log("Message stored in DB:",message);
        //  now find receiver socket id by their userId
        const receiverSockets =  users.get(receiverId); // will return set of socket ids of receiver not onlu one socet id bcz user can be logged in from multiple devices or tabs
        if (receiverSockets && receiverSockets.size > 0) {
        for (const socketId of receiverSockets) { // now check for each socket id of receiver and emit event to all the sockets bcz if user have multiple tabs or devices then we have to send message to all the tabs or devices
      io.to(socketId).emit("receive-message", message);
    }
    // notify sender that message was delivered
    socket.emit("message-sent", message);
  } else {
    console.log("Receiver is not connected");
    // you can still notify sender
    socket.emit("message-sent", message); 
  }

    });

    socket.on("typing",({senderId,receiverId})=>{
        const receiverSockets = users.get(receiverId) ; // get all socket ids of receiver
        if(receiverSockets && receiverSockets.size > 0){
            for (const socketId of receiverSockets) {
                io.to(socketId).emit("typing",{senderId,receiverId});
            }
        }
    }); 

    socket.on("stop-typing",({senderId,receiverId})=>{
        const receiverSockets =users.get(receiverId);     
        if(receiverSockets && receiverSockets.size > 0){
            for (const socketId of receiverSockets) {
                io.to(socketId).emit("stop-typing",{senderId,receiverId});
            }
        }
    });


    socket.on("message-seen",async({messageId,senderId})=>{
        // Emit event to the sender that receiver has seen the message
        // senderId is the user who sent the message
         // now find the sender socket id and sent a event to him of message seen

        //  update the message in database as seen:true before emitting event to sender
        await messageModel.findByIdAndUpdate(messageId,{$set:{seen:true}});
        // now emit event to sender

        const senderSockets = users.get(senderId); // get all socket ids of sender
        if(senderSockets && senderSockets.size > 0){
            for (const socketId of senderSockets) {
                io.to(socketId).emit("message-seen",{messageId});
            }
        }
        console.log("Emitted message-seen event to sender:", senderId);
    })

    socket.on("disconnect", async () => {
    for (const [userId, sockets] of  users.entries()) { // users is a map of key value pair key is userId and value is set of socket ids
        if (sockets.has(socket.id)) { // each user can have multiple sockets (multiple devices or tabs) and this line is the current disconnected socket belong to this user
            sockets.delete(socket.id); // remove the socket from the set bcz it is no longer connected and if user have multiple tabs then other tab will still be connected only current tab will be disconnected
            console.log(`Socket disconnected: ${socket.id} for user ${userId}`);
            if (sockets.size === 0) {
                // after removing the socket  we check if the user still have any other active tab if no then remove the user from the map
                users.delete(userId); // remove user if no sockets left
            }
            try{
                await userModel.findByIdAndUpdate(userId,{isOnline:false,lastSeen:Date.now()});
            }catch(err){
                console.log("Failed to update isOnline status and last seen");
            }
            break; // exit the loop once we found and removed the socket
        }
    }
   });


     
});

 


 

 // here we will write all route because this is small app that's why we are not using  seprate files like routes,controllers,services etc 

//  1. User Login Route
app.post("/login",async(req,res)=>{
    const {email,password} = req.body;
    try{
    if(!email || !password){
        return res.status(400).json({error:"Email and Password are required"});
    }
    // Here we  will add  logic to check email and password from database ,is they are correct or not
    const user  = await userModel.findOne({email}).select("+password");
    // console.log("user",user)
    if(!user){
        console.log("Email or password are incorrect");
        return res.status(401).json({error:"Email or password are incorrect"});

    }
    //  console.log("user password",user.password)
    const isPasswordMatched = await bcrypt.compare(password,user.password);
    if(!isPasswordMatched){ 
        console.log("Email or password are incorrect");
        return res.status(401).json({error:"Email or password are incorrect"});  
    };
    const token = user.generateAuthToken();
    // console.log("Login successful",token,user);
    return res.status(200).json({success :"Log in successfully",user,token});
    }catch(err){
        return res.status(401).json({error:"Email or password are in correct"})
    }
});

//  2. User Register Route
app.post("/register",async(req,res)=>{
    const {name,email,password} = req.body;
    
    if(!name || !email || !password){
        return res.status(400).json({error:"Name, Email and Password are required"});
    }
try{
    const user = await userModel.findOne({email});
    if(user){
        console.log("User already exists");
        return res.status(409).json({error:"User already exists, Please log in"});
        };
    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = await userModel.create({
        name,
        email,
        password:hashedPassword
    });
    
    const token = newUser.generateAuthToken();
    return res.status(200).json({user:newUser,token});
    }catch(err){
        return res.status(400).json({error:"Failed to sign up"});
     }
});

// 3 fetch users for chatting at home page
app.get("/fetch-users/:userId",async(req,res)=>{
    try{
        const {userId} = req.params;
        // console.log(userId)
        const response = await userModel.find();
        // find all other user except him/her self
        const users = response.filter((user)=>{
            return user.id != userId
        });
         
        return res.status(200).json(users);
         
    }catch(err){
        console.log("Failed to fetch users");
        // 68a87cc4e8e975c1038587cf
        return;
    }
});


//  fetch other user at chat screen by their id
app.get("/fetch-user/:otherUserId",async(req,res)=>{
    try{
        const {otherUserId} = req.params;
        
        const response = await userModel.findById(otherUserId);
        
        return res.status(200).json(response);
         
    }catch(err){
        console.log("Failed to fetch user");
        res.status(400).json({error:"Failed to fetch user"});
        return;
    }
});

// fetch msgs between two users
app.get("/fetch-messages/:userId1/:userId2",async(req,res)=>{
    try{
        const {userId1,userId2} = req.params;
         
        const messages = await messageModel.find({
            $or:[
                {senderId:userId1,receiverId:userId2},
                {senderId:userId2,receiverId:userId1}
            ]
        }).sort({createdAt:1}); // sort  message by createdAt in ascending order
        
        return res.status(200).json(messages);
    }catch(err){
        console.log("Failed to fetch messages");
        res.status(400).json({error:"Failed to fetch messages"});
        return;
    }
})

// mark  all messages as read when user open chat
app.post("/mark-messages-read",async(req,res)=>{
    try{    
        const {senderId,receiverId} = req.body;
         
        const messages = await messageModel.updateMany({senderId,receiverId,seen:false},{$set:{seen:true}});
        
        return res.status(200).json({success:"Messages marked as read"});
    }   
    catch(err){
        console.log("Failed to mark messages as read");
        res.status(400).json({error:"Failed to mark messages as read"});
        return;
    }
})

// mark a single message as read by its id during live chat
app.post("/mark-messages-read-byId",async(req,res)=>{
    try{    
        const {messageId} = req.body;
         
        const message = await messageModel.findByIdAndUpdate(messageId,{$set:{seen:true}});
        
        return res.status(200).json({success:"Message marked as read"});
    }   
    catch(err){
        console.log("Failed to mark message as read");
        res.status(400).json({error:"Failed to mark message as read"});
        return;
    }
})

//  upload status(image or video) on cloudinary and then get url from cloudinary and save it in db and store text in db 
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload-status", upload.single("file"), async (req, res) => {
  try {
    
   const { userId, text } = req.body;
   let fileUrl = null;
   let fileType = null;


    if (req.file) {

    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    // we convert file from multer that is in buffer into base64 bcz cloudinary not accept buffer directly , cloudinary accept base64 or url or path , buffer is raw data and base64 is encoded string representation of that data

    const result = await cloudinary.uploader.upload(base64, {
      folder: "status", // folder name here our all status will store
      resource_type: "auto" // auto detct file type image or video
    });
    // cloudinary.uploader.upload // this function will upload file to cloudinary

    console.log("Cloudinary upload result:", result);

    // cloudinary response will contain lot of info about uploaded file including its url and we will store that url in database
    fileUrl = result.secure_url;
    fileType = req.file.mimetype.startsWith("image") ? "image" : "video"
   }
 
    const status = await StatusModel.create({
      userId,
      text: text || "",
      fileUrl,
      fileType,
    });

    console.log("Status uploaded successfully:", status);

    return res.status(200).json({ success: true, status });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to upload status" });
  }
});


// fetch all the statuses
app.get("/fetch-statuses",async(req,res)=>{
    try{
       
        const allStatuses = await StatusModel.find()
        .populate("userId","name") // get user name by populating userId
        .sort({createdAt:-1}) ; // fetch all statuses and sort by createdAt in descending order
     
        
        return res.status(200).json(allStatuses);
    }catch(err){
        console.log("Failed to fetch statuses");
        return res.status(400).json({error:"Failed to fetch statuses"});
    }
});

// automatically delete the status after 24 hr from database and also from cloudinary

cron.schedule("0 * * * *", async () => { // This sets up a cron job using the node-cron package  and it will run after every hour 
// 0 * * * * means minute,hour,day,month  and * means every hr,every day,every month if you want to keep 30 minute then set */30 * * * *
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // find time that was 24 hr ago 
  const expired = await StatusModel.find({ createdAt: { $lt: cutoff } });// find all status that is created before 24 hr ago 

  for (const s of expired) {
    // Extract public_id from Cloudinary URL
    const publicId = s.fileUrl.split("/").slice(-1)[0].split(".")[0];
    await cloudinary.uploader.destroy(`status/${publicId}`);
    await StatusModel.deleteOne({ _id: s._id });
  }

  console.log("Expired statuses cleaned up!");
});

app.post("/delete-status/:statusId",async(req,res)=>{
    try{
        const{statusId} = req.params;
        const status = await StatusModel.findById(statusId);
        if(!status){
            return res.status(404).json({err:"Status not found"})
        }
        if(status.fileUrl){ // it's mean status is image or video then delete also from cloudinary
            const publicId = status.fileUrl.split("/").slice(-1)[0].split(".")[0];
            await cloudinary.uploader.destroy(`status/${publicId}`);
        }

        await StatusModel.findByIdAndDelete(statusId);
        console.log("status deleted successfully ")

    }catch(err){
        console.log("Failed to delete status");
        return res.status(400).json({err:"Failed to delete status"});
    }
})

app.get("/delete-msg/:msgId",async(req,res)=>{
    try{
        const {msgId} = req.params;

        await messageModel.findByIdAndDelete(msgId);
        console.log("msg deleted");
        return res.status(200).json({success:"Message deleted successfully!"})

    }catch(err){
        return res.status(400).json({err:"Failed to delete msg"});
    }
});


// send follow request
 
app.post("/send-follow-request",async(req,res)=>{
    try{

        //  firstly send the  live notification to the user that someone sent him/her follow request and store it in notification model and if user accept the follow request then only add them in friend model
        const {followerId,followingId} = req.body;
       
        const notification = await  notificationModel.create({sender:followerId, receiver:followingId,type:"follow"});

       

        //  i need sender name and profile pic to show in notification to other user jis ko esne follow kiya hai

        const  result = await notificationModel.findById(notification._id).populate("sender","name");

 

        const  receiverSockets = users.get(followingId); // get all socket ids of receiver
        if(receiverSockets && receiverSockets.size > 0){
            for (const socketId of receiverSockets) {
                io.to(socketId).emit("new-notification",result);
                console.log("Live follow request notification sent to receiver");
            }
        }else{
            console.log("Receiver is not connected, but notification stored in DB");
        }

        return res.status(200).json({success:"Follow request sent successfully!"});
    }catch(err){
        return res.status(400).json({error:"Failed to send follow request"});
    }
});

app.get("/fetch-notifications/:userId",async(req,res)=>{{
    try{
        const {userId} = req.params;
        // console.log("Fetching notifications for userId:", userId);
        const notifications = await notificationModel.find({receiver:userId})
        .populate("sender","name")
        .populate("receiver","name")
        .sort({createdAt:-1});
         
        return res.status(200).json(notifications);

        
    }catch(err){
        return res.status(400).json({error:"Failed to fetch notifications"});
    }
}});







 
server.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on port ${process.env.PORT || 4000}`);
});



