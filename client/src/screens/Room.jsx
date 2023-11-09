import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../services/peer";
const Room = () => {
  const [remoteSocketid, setRemoteSocketId] = useState(null);
  const [myStream, setMystream] = useState();
  const socket = useSocket();
  const handleUserJoined = useCallback(({ email, id }) => {
    setRemoteSocketId(id);
    console.log("Joined User", email, id);
  }, []);

  //Calling User
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketid, offer });
    setMystream(stream);

    console.log("Stresm", myStream);
  }, [socket, remoteSocketid]);

  //incommming call
  const handleIncommingCall = useCallback(({ from, offer }) => {
    console.log("Incomming call from:", from, "Offer:", offer);
  });
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
    };
  }, [handleUserJoined, socket]);
  return (
    <>
      {" "}
      <div>Room</div>
      <h1>
        {remoteSocketid
          ? `You are Connected with ${remoteSocketid}`
          : "No one in this room"}
      </h1>
      {remoteSocketid && (
        <button
          onClick={handleCallUser}
          className="bg-green-500 p-3 rounded-md hover:scale-105"
        >
          Call
        </button>
      )}
      {myStream && (
        <>
          <h1>{console.log(myStream)}</h1>
          <video id="video" className="bg-red-600 w-full" />
          <ReactPlayer playing height="300px" width="500" url={myStream} />
        </>
      )}
    </>
  );
};

export default Room;
