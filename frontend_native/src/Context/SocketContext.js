import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "@env";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

   

  useEffect(() => {
    const initSocket = async () => {
      const userId = await AsyncStorage.getItem("userId");
    //   alert(userId)
      const socket = io(BACKEND_URL, { transports: ["websocket"] });

      socketRef.current = socket;

      // Connect
      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        setIsConnected(true);
        if (userId) {
          socket.emit("register", userId.toString());
        }
      });

      socket.on("connect_error", (err) => {
        console.log(" Socket connection error:", err.message);
      });

      socket.on("disconnect", () => {
        console.log(" Socket disconnected");
        setIsConnected(false);
      });
    };

    initSocket();

    // Cleanup on unmount (when app closes)
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("Socket disconnected due to app unmount");
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook
export const useSocket = () => {
  return useContext(SocketContext);
};

 
