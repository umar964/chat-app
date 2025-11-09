import React,{useState,useEffect,useRef} from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image,Button } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import {uploadStatus} from "../api/statusApi";

const AddStatusScreen = ({navigation,route})=>{
    const [media,setMedia] = useState(null);
    const [statusText,setStatusText] = useState('');
    const userId = route.params?.userId;    
   

    const pickMedia = async()=>{
        const result  = await ImagePicker.launchImageLibraryAsync({
            mediaTypes:ImagePicker.MediaTypeOptions.All,
            allowsEditing:true,
        });
        if(!result.canceled){
            setMedia(result.assets[0]);
        }
    };

    const handleUpload = async()=>{
        if(!media && !statusText.trim()){
            alert("Please select media or enter text first");
            return;
        }
        
        await uploadStatus({
            userId:route.params.userId,
            fileUri:media?.uri,
            type:media?.type,
            text :statusText
        });
        navigation.goBack();
    };


    return(
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {media && <Image source={{ uri: media.uri }} style={{ width: 200, height: 200 }} />}

      <TextInput
        placeholder="What's on your mind?"
        value={statusText}
        onChangeText={setStatusText}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          width: "80%",
          marginVertical: 10,
          padding: 8,
          borderRadius: 5,
        }}
      />
      
      <Button title="Pick Image or Video" onPress={pickMedia} />
      <Button title="Upload Story" onPress={handleUpload} disabled={!media && !statusText.trim()} />
    </View>
    )

}

export default AddStatusScreen;