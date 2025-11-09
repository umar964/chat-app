import React,{useState,useEffect} from "react";
import { View,Text, Image,TouchableOpacity,StyleSheet } from "react-native";

export default function StatusViewerScreen ({route,navigation}){
    const{statuses,index} = route.params;
    const [currentIndex,setCurrentIndex] = useState(index)

    useEffect(()=>{

        // flow
// Screen open and this time currentIndex = 0

//  then useEffect run and set a timer 0f 4 sec means after 4 sec currentIndex become 1 and next status will show

// 4 sec baad setCurrentIndex(1)  

// now useEffect will run again (kyunki currentIndex change hua hai )

//  again set a timer of 4 sec after 4 sec  setCurrentIndex(2) … and so on

// Jab last story aati hai → navigation.goBack()
        const timer = setTimeout(()=>{
            if(currentIndex<statuses.length-1){
                setCurrentIndex(currentIndex+1)
            }else{
                navigation.goBack();
            }
        },4000)
        return ()=> clearTimeout(timer)
    },[currentIndex])

    const currentStatus = statuses[currentIndex]
     
    return (
    <View style={styles.container}>
      <Image source={{ uri: currentStatus.fileUrl }} style={styles.image} resizeMode="contain" />
      <Text style={styles.userName}>{currentStatus.userId?.name || "User"}</Text>

      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={{ color: "white", fontSize: 18 }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black", justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: "80%" },
  userName: {
    position: "absolute",
    top: 50,
    left: 20,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
  },
});