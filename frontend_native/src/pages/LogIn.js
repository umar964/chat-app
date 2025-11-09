import React,{useState} from "react";
import {View,Text,TextInput,TouchableOpacity,Alert,StyleSheet} from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from "@env";
 

export default function LogIn({navigation}){
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [error,setError] = useState('');

    const submitHandler = async()=>{
     try{
    const userData = {
      email:email,
      password:password
    }
    const response = await axios.post(`${BACKEND_URL}/login`,userData);
    if(response.status === 200){
      const data = response.data;
     
      // setUser(data.user);
      // in react native AsyncStorage will use instead of localStorage
      AsyncStorage.setItem("user",JSON.stringify(data.user));
      AsyncStorage.setItem("userToken",data.token);
      AsyncStorage.setItem("userId",data.user._id);
    
      alert("Login successfully")
      navigation.navigate('Home'); // here koi component render kre gai ye this is defined in App.js of frontend_native folder

    }

     setEmail('')
     setPassword('') 
    }catch(err){
      if(err.response && err.response.data.error){
        setError(err.response.data.error)
      }
    }

    }
    
    
  return (
    <View style={styles.main}>
      <View style={styles.content}>
        <Text style={styles.text}>Login</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
        />
        <TextInput
        placeholder="Password"
        required
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        />
        <TouchableOpacity style={styles.button} onPress={submitHandler}>
            <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <View style={styles.signUpDiv}>
        <Text style={styles.signUp}>Not a member?</Text>
        <TouchableOpacity onPress={()=>navigation.navigate("Signup")}>
          <Text style={styles.signUpLink}>Sign Up</Text>  
        </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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
    height:"66%",
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

  signUpDiv:{
    // display:"flex",
    flexDirection:"row",
    justifyContent:"center",
    // alignContent:"center",
    alignItems:"center",
    height:60,
    width:220,
  },

  text: {
    fontSize: 33,
    fontWeight: "600",
    marginBottom: 40,
    color: "#242222ff",
    textAlign: "center",
  },

  error: {
    fontSize: 15,
    fontWeight: "400",
    marginBottom: 6,
    color: "#f50808ff",
    textAlign: "center",
  },

 

  input: {
    
    width: "100%",
    paddingLeft: 15,
    borderWidth: 0.2,
    borderColor: "#ccc",
    borderRadius: 25,
    marginTop:7,
    fontSize: 18,
    backgroundColor: "#eee",
    color: "black",
  },

  button: {
    marginVertical: 15,
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    backgroundColor: "#dde1e7",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#191414ff",
  },

  signUp: {
    margin: 10,
    color: "#272020ff",
    fontSize: 16,
    textAlign: "center",
  },

  signUpLink: {
    color: "black",
    fontWeight: "600",
  },
});



 
