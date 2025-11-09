import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, StyleSheet,Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from "@env";

export default function SignUp({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      // Alert.alert("hello")
      Alert.alert("Backend URL:", BACKEND_URL);

      const response = await axios.post(`${BACKEND_URL}/register`, { name, email, password });
      const data = response.data;
      if (response.status === 200) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userId", data.user._id);
        navigation.navigate('Home');
      }
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      }
    }
  };

  return (
    <View style={styles.main}>
      <View style={styles.content}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.text}>Sign Up</Text>

        <TextInput
          placeholder='Name'
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder='Email'
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          placeholder='Password'
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.signUpDiv}>
          <Text style={styles.signUp}>Have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signUpLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
 



const styles = StyleSheet.create({
  main: {
    flex: 1,
    width: "100%",
    display:"flex",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10,
    backgroundColor: "#ae1717ff", // body bg
    
  },

  content: {
    width: "98%",
    height:"70%",
    maxWidth: 340,
    paddingVertical: 60,
    paddingHorizontal: 50,
    borderRadius: 25,
    backgroundColor: "#747976ff",
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
    color: "#08f53bff",
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
    margin: 19,
    height:20,
    color: "#272020ff",
    fontSize: 16,
    textAlign: "center",
  },

  signUpLink: {
    color: "black",
    fontWeight: "600",
  },
});
