import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, ActivityIndicator } from "react-native";
const Stack = createNativeStackNavigator();

import { SocketProvider } from "./src/Context/SocketContext";
import Home from "./src/pages/Home";
import ChatScreen from "./src/pages/ChatScreen";
import SignUp from "./src/pages/SignUp";
import LogIn from "./src/pages/LogIn"
import AddStatusScreen from "./src/screens/AddStatusScreen";
import StatusListScreen from "./src/screens/StatusListScreen";
import StatusViewerScreen from "./src/screens/StatusViewerScreen";
import NotificationScreen from "./src/screens/NotificationScreen";
 

 
export default function App() {
  const [isReady,setIsReady] = useState(false);
  const [initialState,setInitialState] = useState();
  const [error,setError] = useState('');


  //  this is used for persisting navigation state but its effect is on one refresh multiple times data fetch from backend like on one refresh 18 times user fetch 
  useEffect(()=>{
    const restoreState = async()=>{
    try{
      const savedState = await AsyncStorage.getItem("NAVIGATION_STATE");
      if(savedState){
        setInitialState(JSON.parse(savedState));
      }
    }catch(e){
      setError("Failed to restore your state")
    }
    setIsReady(true);
  }

  restoreState();

  },[]);

  if(!isReady){
    return (
      <View >
        <ActivityIndicator />
        <Text>Loading...</Text>
      </View>
    );
  }
   
  return (
     
    <SocketProvider>
    <NavigationContainer
    initialState={initialState}
    onStateChange={(state)=>{
      AsyncStorage.setItem("NAVIGATION_STATE", JSON.stringify(state))
    }}
    >
      {/* {error && <Text>{error}</Text>} */}
      <Stack.Navigator initialRouteName="Home"> 
        {/*  means home page sab sai pahle dikha gai */}
        <Stack.Screen name="Home" component={Home} /> 
        <Stack.Screen name="chatScreen" component={ChatScreen} />
        <Stack.Screen name="Signup" component={SignUp}/>
        <Stack.Screen name='Login' component={LogIn} />
        <Stack.Screen name='AddStatus' component={AddStatusScreen}/>
        <Stack.Screen name='StatusList' component={StatusListScreen}/>
        <Stack.Screen name='StatusViewer' component={StatusViewerScreen}/>
        <Stack.Screen name='Notification' component={NotificationScreen}/>

      </Stack.Navigator>
    </NavigationContainer>
    </SocketProvider>
  );
}


