import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {  Image,Text, View, TouchableOpacity, Alert, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useSocket } from "../Context/SocketContext";

import { useNavigation } from "@react-navigation/native";
import { BACKEND_URL } from "@env";
import axios from "axios";
 

export default function Home(){
    const socket = useSocket();
    const [users,setUsers] = useState([]);
    const [error,setError] = useState('');
    const [followMsg,setFollowMsg] = useState('');
    const [id,setId] = useState(''); // of user
    // alert(BACKEND_URL)

  


    const navigation = useNavigation();

    const goToScreen = (screenName,params)=>{
        navigation.navigate(screenName,params);
    }
     
    //  get userId and userToken
    useEffect(()=>{
        const fetchData = async()=>{
            const userId = await AsyncStorage.getItem("userId");
              setId(userId);
            const userToken = await AsyncStorage.getItem('userToken');
            
            if(!userToken){
                navigation.navigate('Login');
            }
        }
        fetchData();
    },[]);


    // fetch all users except current user
    useEffect(() => {
  let isMounted = true;
  const fetchUsers = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const response = await axios.get(`${BACKEND_URL}/fetch-users/${userId}`);
      if (isMounted) setUsers(response.data);
    } catch (err) {
      if (isMounted) setError("Failed to fetch all users");
    }
  };

  fetchUsers();

  return () => {
    isMounted = false;
  };
}, []);

 
  const getLastSeenText = (lastSeen, isOnline) => {
  if (isOnline) return "Online";
  // if (!lastSeen) return "Offline";

  const diffMs = Date.now() - new Date(lastSeen).getTime(); // difference in ms
  const minutes = Math.floor(diffMs / 60000); // get minutes
  const hours = Math.floor(minutes / 60); // get hours
  const days = Math.floor(hours / 24); // get days

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `Active ${minutes} m ago`;
  if (hours < 24) return `Active ${hours}h ago`;
  return `Active ${days}dys ago`;
};



    const handleChatting = async(otherUserId)=>{
        try{
            const myId = await AsyncStorage.getItem("userId");
            navigation.navigate('chatScreen',{myId,otherUserId});
        }catch(err){
            setError("Failed to chat, please try again")
        }
    }

    const handleFollowReq = async(followingId)=>{
        try{
          const followerId = await AsyncStorage.getItem("userId");
           const response = await axios.post(`${BACKEND_URL}/send-follow-request`,{
            followerId,
            followingId
           });
        }catch(err){
            setError("Failed to send follow request, please try again")
        }
      };

  useEffect(() => {
  if (!socket){
    console.log("Socket not available yet");
    return;
  };  // ✅ first check

  // const handleNotification = (result) => {
  //   console.log("New Notification:", result);
  // };

  socket.on("new-notification", (result)=>{
     setFollowMsg(result.sender.name+" started following you.");
  });

  // // ✅ cleanup to avoid multiple listeners
  // return () => {
  //   socket.off("new-notification", handleNotification);
  // };

  //  return () => {
  //   socket.off("connect"); // cleanup
  // };
}, [socket]);




    return (
        
        <View>

            {followMsg &&(
              <View style={{backgroundColor:"green", padding:10,width:"20%",textAlign:"center", alignSelf:"center", borderRadius:5, marginTop:10}}>
                <Text style={{fontWeight:"bold",fontSize:16}}>{followMsg}</Text>
                 
              </View>
            )}
            <Text style={{fontSize:12, textAlign:"center", marginTop:20, marginBottom:20, fontWeight:"bold"}}>{id}</Text>
            {error && <Text>{error}</Text>}
            <TouchableOpacity onPress={()=>goToScreen("Signup")} style={{ width:"10%" , borderRadius:5, backgroundColor:"#4da6ff", padding:5}}>
              <Text>← signup</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>goToScreen("AddStatus",{userId:id})} style={{marginTop:10, marginBottom:20 ,width:"10%" , borderRadius:5, backgroundColor:"#4da6ff", padding:5}}>
              <Text>Add Status</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>goToScreen("Notification",{userId:id})} style={{  width:"10%" , borderRadius:5, backgroundColor:"#4da6ff", padding:5}}>
              <Text>Notification</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>goToScreen("StatusList",{userId:id})} style={{marginTop:10, marginBottom:20,width:"10%" , borderRadius:5, backgroundColor:"#4da6ff", padding:5, }}>
              <Text>status list</Text>
            </TouchableOpacity>

            {users.length>0?(
            <ScrollView>
                {users.map((user)=>(
                    <View style={style.userName} key={user._id}>
                      <View style={style.profile}><Image source={{
                        uri:user?.profile?user.profile
                      :"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5mLo0k7gfXhPlqpLi0yxoAST-VuBAMuHBcg&s"}}
                      style={style.photo}
                      /></View>
                         
                    
                        <TouchableOpacity onPress={()=>handleChatting(user._id)}> 
                          <Text>{user.name}</Text>
                         <Text>{getLastSeenText(user.lastSeen,user.isOnline)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>handleFollowReq(user._id)}> 
                          <Text style={style.followBtn}>follow</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
            ):(<Text>Loading...</Text>)}
        </View>
    );
}

const style = StyleSheet.create({
    main: {
    flex: 1,
    width: "100%",
    display:"flex",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 30,
    backgroundColor: "#181717ff", // body bg
  },

  content: {
    width: "98%",
    height:"70%",
    maxWidth: 340,
    paddingVertical: 60,
    paddingHorizontal: 50,
    borderRadius: 25,
    backgroundColor: "#797474ff",
    shadowColor: "#cdbebeff",
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 20, // Android shadow
  },

  profile:{
    flex:0.6,
    justifyContent:"center",
    alignItems:"center",
    // marginRight:10
    // backgroundColor:"lightgrey",

  },

  photo:{
    width:40,
    height:40,
    borderRadius:25,

  },

  userName:{
    display:"flex",
    marginTop:20,
    flexDirection:"row",
    justifyContent:"center",
    // alignContent:"center",
    alignItems:"center",
    height:30,
    width:320,
    gap:10,
  },

  chatBtnTxt:{
    width:70,
    height:22,
    backgroundColor:"black",
    color:"white",
    marginLeft:12,
    borderRadius:12,
    paddingLeft:7
  },
  followBtn:{
    width:70,
    height:22,
    backgroundColor:"#161719ff",
    color:"white",
     textAlign:"center",
    borderRadius:12,
    // paddingLeft:7,
  }
})