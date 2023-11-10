import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../services/peer";
const Room = () => {
  const [remoteSocketid, setRemoteSocketId] = useState(null);
  const [myStream, setMystream] = useState();
  const [remoteStream, setRemoteStream] = useState();

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
  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMystream(stream);
      setRemoteSocketId(from);
      console.log("Incomming call from:", from, "Offer:", offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );
  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);
  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      console.log("call acc", from, ans);
      peer.setLocalDescription(ans);
      console.log("call accepted", ans);
      sendStreams();
    },
    [sendStreams]
  );
  const handleNegoNeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketid });
  }, [remoteSocketid, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeded);
    };
  }, [handleNegoNeded]);
  const handleNegoIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );
  const handleNegoFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("got tracks", remoteStream);
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoIncomming);
    socket.on("peer:nego:final", handleNegoFinal);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoIncomming);
      socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [
    handleCallAccepted,
    handleIncommingCall,
    handleNegoFinal,
    handleNegoIncomming,
    handleUserJoined,
    socket,
  ]);
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
      {myStream && <button onClick={sendStreams}>Sent Stream</button>}
      {myStream && (
        <>
          <h1>Me</h1>

          <h1>{console.log(myStream)}</h1>
          <video id="video" className="" />
          <ReactPlayer playing height="300px" width="500" url={myStream} />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote User</h1>
          <video id="video" className="" />
          <ReactPlayer playing height="500px" width="800" url={remoteStream} />
        </>
      )}
    </>
  );
};

export default Room;
