import React,{ useEffect, useState, useRef } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { BACKEND_URL } from "@env";
import { ScrollView } from "react-native";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
 
// import { fetchStatusesByUserId } from "../api/statusApi";

export default function StatusListScreen({navigation}){
    const route = useRoute();
    const {userId} = route.params;
    const [statuses,setStatuses] = useState([]);
    const [error,setError] = useState('');

    useEffect(()=>{
        const fetchStatuses = async()=>{
        try{
            
            const response = await axios.get(`${BACKEND_URL}/fetch-statuses`);
            setStatuses(response.data);
            console.log("hello",response.data)
             
        }catch(err){
            setError("Failed to fetch statuses");
        }
             
        }
        fetchStatuses();
        
    },[])

    const openStory = async(index)=>{
        try{
            navigation.navigate("StatusViewer",{statuses,index})
        }catch(err){
            setError("Failed to load status")
        }
    }

    const getTime = (createdAt)=>{

        const diffMs = Date.now()-new Date(createdAt).getTime(); // we get time in milliseconds
      

        const minutes = Math.floor(diffMs / 60000) // get in minutes
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours/24);

        if(minutes<1)return 'Uploaded Just Now';
        if(minutes<60)return `Uploaded ${minutes}m ago`;
        if(hours<24)return `Uploaded ${hours}h ago`;
        return `Uploaded ${days}d ago`;

    }

    const deleteStatus = async(statusId)=>{
        try{
            const response = await axios.post(`${BACKEND_URL}/delete-status/${statusId}`);
             
        }catch(err){
            setError("Failed to delete status")
        }
    }

    const renderItem=({item,index})=>{
        return(
            <>
            <TouchableOpacity onPress={()=>openStory(index)}>
             <View style={styles.statusContainer}>
                 {item.fileUrl != null && (
                    <Image source={{ uri: item.fileUrl }} style={styles.media} />
                 )} 
                 <Text>{item.text}</Text>
                <Text>{item.userId?.name}</Text>
                <Text>{getTime(item.createdAt)}</Text>

             </View>
            </TouchableOpacity>
             {item.userId._id == userId &&(
                <TouchableOpacity style={styles.deleteBtn} onPress={()=>deleteStatus(item._id)}>
                <Text>Delete</Text>
               </TouchableOpacity>
             )}
            </>
        )
    }

    if (error){
        return(
            <View style={styles.center}>
                <Text>{error}</Text>
            </View>
        )
    }



    return(
        <FlatList
            data={statuses}
            keyExtractor={(item)=>item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
        />
)
}

const styles = StyleSheet.create({
  list: {
    padding: 10,
  },
  statusContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#867070ff",
    padding: 5,
  },
  media: {
    width:"20%",
    height:100,
    borderRadius: 10,
  },
  text: {
    marginTop: 5,
    fontSize: 16,
    color: "#333",
  },
  timestamp: {
    marginTop: 2,
    fontSize: 12,
    color: "#999",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  deleteBtn:{
    backgroundColor:"#ff4d4d",
    padding:5,
    borderRadius:5,
    alignItems:"center",
    marginBottom:10,
    width:"12%"
  }
});

 
