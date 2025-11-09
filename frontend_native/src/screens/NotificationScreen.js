import React, { useEffect, useState } from 'react';
import { View, Text,TouchableOpacity, FlatList } from 'react-native';
import { BACKEND_URL } from "@env";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function NotificationScreen({navigation,route}){
    const userId = route.params?.userId;
    // alert("UserID in NotificationScreen: " + userId);
    
    const [notifications,setNotifications] = useState([]);
    const [error,setError] = useState('');

    useEffect(()=>{
         
        const fetchNotifications = async()=>{
            try{
            // fetch notifications from backend
            
            const response = await axios.get(`${BACKEND_URL}/fetch-notifications/${userId}`);
            const fetchedNotifications = response.data;
            setNotifications(fetchedNotifications);
           }catch(err){
            setError("Failed to fetch notifications");
        }
                 
    }
    fetchNotifications();
    },[userId]);

    const handleConfirmReq = async(item)=>{
        try{
            const notificationId = item._id;
            const response = await axios.post(`${BACKEND_URL}/confirm-follow-request/${notificationId}`);
            // Update notifications list after confirming
             setNotifications(prev=>prev.map (item=>
                item._id === notificationId ? {...item, status:'accepted'} : item
             ));
        }
        catch(err){
            setError("Failed to confirm follow request");
        }
    }

             

    const renderNotifications = ({item})=>(
        <View style={{flexDirection:"row", justifyContent:"flex-start", alignItems:"center", padding:10, borderBottomWidth:1, borderColor:"#ccc"}}>
            <Text>{item.sender.name}<Text> started following you.</Text></Text>
            {item.status === 'pending' && (
                <TouchableOpacity onPress={()=>handleConfirmReq(item)} style={{marginLeft:10, backgroundColor:"blue", padding:5, borderRadius:5}}>
                    <Text style={{color:"white"}}>Confirm</Text>
                </TouchableOpacity>
            )}
            {item.status === 'accepted' && (
                <Text style={{marginLeft:10, color:"green", fontWeight:"bold"}}>Followed</Text>
            )}
            
        </View>
    )


    return (
        <View>
            <Text>Notification</Text>
            {error ? <Text style={{color:'red'}}>{error}</Text> : null}
            <FlatList 
            data={notifications}
            keyExtractor={(item)=>item._id}
            renderItem = {renderNotifications}
            />
        </View>
    );
}