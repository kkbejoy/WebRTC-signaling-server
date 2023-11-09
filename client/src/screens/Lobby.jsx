import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
const Lobby = () => {
  const [email, setEmail] = useState();
  const [room, setRoom] = useState();
  const socket = useSocket();
  const navigate = useNavigate();
  const handleFormSubmit = useCallback(
    (e) => {
      e.preventDefault();

      socket.emit("room:join", { email, room });
    },
    [email, room]
  );
  const handleRoomJoin = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );
  useEffect(() => {
    socket.on("room:join", handleRoomJoin);
    return () => {
      socket.off("room:join", handleRoomJoin);
    };
  }, [socket]);
  return (
    <div className="bg-gray-300">
      <h2>Login</h2>

      <form onSubmit={handleFormSubmit} className="">
        <label htmlFor="email">Email Id</label>
        <input
          className="my-3"
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          id="email"
        />
        <br />
        <label htmlFor="room">Room </label>
        <input
          onChange={(e) => setRoom(e.target.value)}
          type="text"
          id="room"
        />
        <br />

        <button>Join</button>
      </form>
    </div>
  );
};

export default Lobby;
