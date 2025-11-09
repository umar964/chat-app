import React, { useState, useEffect, useRef, use } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSocket } from "../Context/SocketContext";
import axios from "axios";
import { BACKEND_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from '@react-navigation/native';

 



export default function ChatScreen() {
  const socket = useSocket();
  const route = useRoute();
  const [user,setUser] = useState(null);

  const {myId, otherUserId } = route.params;
  const navigation = useNavigation();
  const [msg, setMsg] = useState("");

  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const[selectedMsg,setSelectedMsg] = useState(null); // selected msg for delete,copy or share;
  const[isSheetVisible,setIsSheetVisible] = useState(false); // a shhet like whatsapp where deletion,share and copy option will show
  const isFocused = useIsFocused();

  const scrollRef = useRef();
  let typingTimeout = useRef(null);
  let isCurrentlyTyping =  useRef(false);
 
  
// fetch other user by their id

 const didUserFetched = useRef(false);
useEffect(() => {
  if (didUserFetched.current) return;
  
  const fetchUser = async () => {
    try {
      
      const response = await axios.get(`${BACKEND_URL}/fetch-user/${otherUserId}`);
      if (response.status === 200) {
        setUser(response.data);
         
         
      }
    } catch (err) {
      setError("Failed to fetch user details");
    } finally {
      didUserFetched.current = true; // mark fetched
    }
  };

  fetchUser();
}, []);



  const previousMessages = async()=>{
      try{
        const response = await axios.get(`${BACKEND_URL}/fetch-messages/${myId}/${otherUserId}`);
        if(response.status === 200){
          setMessages(response.data);
          // alert("Previous messages loaded successfully");
        }
      }catch(err){
        setError("Failed to load previous messages")
      
      }
    }
  // fetch previous messages between the two users
  useEffect(()=>{
    previousMessages();
  },[])

// mark messages as read whenuser open chat screen
  useEffect(() => {
    if (!isFocused) return; // Only run when the screen is focused
    const markMessagesAsRead = async () => {
      try {
        await axios.post(`${BACKEND_URL}/mark-messages-read`, {
          senderId: otherUserId,
          receiverId: myId,
        });
      } catch (err) {
        console.log("Failed to mark messages as read");
      }
    };
    markMessagesAsRead();
  }, [isFocused,otherUserId, myId]);


  // Typing indicator logic
  useEffect(() => {
    
    if (!socket) {
      return;
    }
    socket.on("typing", ({ senderId,receiverId }) => {
       
      if (senderId === otherUserId && receiverId === myId) {
        setIsTyping(true);
         
      }
    });
    socket.on("stop-typing", ({ senderId, receiverId }) => {
      if (senderId === otherUserId && receiverId === myId) {
        setIsTyping(false);
      } 
    });
  },[socket])

      

  const handleTyping = async(text)=>{
    setMsg(text);

    if(!socket)return;

    if(text.trim().length>0){
      if(!isCurrentlyTyping.current){ //  let i start typing first time then isCurrentlyTyping will be false so emit typing event
        socket.emit("typing",{senderId:myId,receiverId:otherUserId}); // send a typing indicator event  to server
        isCurrentlyTyping.current= true; // set true so that brr brr na bjne pde typing indicator
      }
      if(typingTimeout.current) clearTimeout(typingTimeout.current); // When I type, the timeout countdown gets cleared and the stop-typing event doesn’t run. But if I stop typing for around 2 seconds, the timeout countdown  completes and then the stop-typing event triggers     which hides the typing indicator.

      //  if user stop typing for 2 seconds then emit stop-typing event
      typingTimeout.current = setTimeout(()=>{
        socket.emit("stop-typing",{senderId:myId,receiverId:otherUserId});
        isCurrentlyTyping.current = false;
      },2000);
  }else{
    socket.emit("stop-typing",{senderId:myId,receiverId:otherUserId});
    isCurrentlyTyping.current = false;
    if(typingTimeout) clearTimeout(typingTimeout);
  }
}

const handleLongPress = async(m)=>{
  setSelectedMsg(m);
  setIsSheetVisible(true);
}
// close the sheet of delete,share options
const handleClose = async()=>{
  setIsSheetVisible(false);
}

//  delete the message
const handleDelete = async(msgId)=>{
  try{
    
    const response = await axios.get(`${BACKEND_URL}/delete-msg/${msgId}`);
    previousMessages();
  }catch(err){
    setError("Failed to delete the message")
  }
}



 // handle message seen event when other user open chat screen and emit message-seen event
 useEffect(() => {
  if (!socket)return;
  
  const handleSeen = ({ messageId }) => {
    // alert(messageId);
    previousMessages(); // fetch previous messages to update seen status

 
    
  };

   

  socket.on("message-seen", handleSeen);

  return () => {
    socket.off("message-seen", handleSeen);
  };
}, [socket]);

 



  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg) => {
      setMessages(prev => [...prev, msg ]);

      if(isFocused){ // mark seen only when  other user is on chat screen
      // axios.post(`${BACKEND_URL}/mark-messages-read-byId`, {messageId:msg._id});

      // notify sender that message was seen by receiver
      socket.emit("message-seen", { messageId:msg._id,senderId: otherUserId });

      setMessages(prev =>
        prev.map(m => m._id === msg._id ? { ...m, seen: true } : m)
      );
    }
    };

     

    socket.on("receive-message", handleReceive);

    return () => {
      socket.off("receive-message", handleReceive);
    };
  }, [socket, isFocused ]);

  const sendMessage = () => {
    if (!msg.trim()) return;
    if (!socket) {
      alert("Socket not connected");
      return;
    }
     

    socket.emit("send-message", {
      senderId: myId,
      receiverId: otherUserId,
      msg,
    });

    setMessages(prev => [...prev, { senderId: myId, msg }]); // add message locally
    console.log(messages);

     
    
    setMsg(""); // clear input
  };

  const handleClick = () => {
    navigation.navigate("Home");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Chat header */}
      <View style={styles.header}>
        {error ? <Text style={{ color: "red",display:"flex",justifyContent:"center",fontSize:16 }}>{error}</Text> : null}
        <Text style={styles.headerText}>{user?`Let's Chat With ${user.name}`:"Let's Chat"}</Text>
        <TouchableOpacity onPress={handleClick}>
          <Text style={styles.backText}>← Home</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        ref={scrollRef}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.length === 0 ? (
          <Text style={{ color: "gray", textAlign: "center" }}>
            No messages yet
          </Text>
        ) : (
          messages.map((m, idx) => (
            <>
            <TouchableOpacity
            key = {idx}
            onLongPress={()=>handleLongPress(m)}
            delayLongPress={300} // 300 ms means 0.3 sec tak hold krna padega
            activeOpacity={0.8}
            > 
            <View
              key={idx}
              style={[
                styles.messageBubble,
                m.senderId === myId ? styles.myMessage : styles.otherMessage,
              ]}
            >
              <Text style={{ color: "#fff" }}>{m.msg}</Text>
              {m.senderId === myId && (
              <Text style={{ color: "#fff", fontSize: 10 }}>
              {m.seen ? "Seen" : "Sent"}
              </Text>
              )}
            </View>
            </TouchableOpacity>

            {isSheetVisible &&(
            <Modal transparent visible={isSheetVisible} animationType="fade">
            <TouchableOpacity
            style = {styles.overlay}
            activeOpacity={1}
            onPress={handleClose}
            >
            <View style={styles.bottomSheet}>
              <TouchableOpacity  style={styles.sheetOption} onPress={()=>handleDelete(m._id)}>
                <Text style={styles.optionText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

            </Modal>
            )}
            </>
          ))
        )}

      {isTyping && (
      <Text style={{ fontStyle: "italic", color: "gray" }}>
      Typing...
      </Text>
     )}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputDiv}>
        <TextInput
          placeholder="Type a message..."
          placeholderTextColor="#555"
          value={msg}
          onChangeText={(e)=>handleTyping(e)}
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>

       
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#181717ff" },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#333" },
  headerText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  backText: { color: "#aaa", marginTop: 5 },
  messagesContainer: { flex: 1, padding: 10 },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
    maxWidth: "70%",
  },
  myMessage: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  otherMessage: {
    backgroundColor: "#555",
    alignSelf: "flex-start",
  },
  inputDiv: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
    backgroundColor: "#222",
  },
  input: {
    flex: 1,
    height: 45,
    borderRadius: 25,
    paddingHorizontal: 15,
    backgroundColor: "#333",
    color: "#fff",
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    backgroundColor: "#007AFF",
    borderRadius: 25,
    width: 45,
    height: 45,
  },
  sendText: { color: "#fff", fontSize: 20 },

  overlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "flex-end",
},

bottomSheet: {
  backgroundColor: "#281f1fff",
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
  paddingVertical: 15,
  paddingHorizontal: 20,
},

sheetOption: {
  paddingVertical: 14,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
},

optionText: {
  fontSize: 17,
  fontWeight: "500",
  textAlign: "center",
},

});


 