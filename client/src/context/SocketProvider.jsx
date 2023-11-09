import React, { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";
const BASE_URL = "http://localhost:5000";
const SocketContext = createContext(null);
export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};
export const SocketProvider = (props) => {
  const socket = useMemo(() => {
    return io(BASE_URL);
  }, []);
  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
