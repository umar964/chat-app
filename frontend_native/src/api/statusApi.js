import axios from "axios";
import { BACKEND_URL } from "@env";

export const uploadStatus = async({userId,fileUri,type,text})=>{
     
    const formData = new FormData();
     if(fileUri){
        // we use blob bcz multer/node cannot handle fileUri directly and cannot read it  so we use blob that will convert uri into actual object that is readdable by multer/node at backend

        const response = await fetch(fileUri); //  read file 
        const blob = await response.blob(); // convert into blob

        formData.append("file",blob,`status.${type === "video"?"mp4" : "jpg"}`,);
     }
    formData.append("userId",userId),
    formData.append("text", text || "");
    
    // formData.append("type",type);

    
    await axios.post(`${BACKEND_URL}/upload-status`,formData)
}