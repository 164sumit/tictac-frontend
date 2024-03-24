import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const Lobby = () => {
    const socket = useMemo(
        () =>
          io("https://tictac-backend.onrender.com/", {
            // withCredentials: true,
          }),
        []
      );
    const [activePlayers, setActivePlayers] = useState(0);
    const [roomId, setRoomId] = useState('');
    // const [socket, setSocket] = useState(null); // State for socket connection
    const [socketID, setSocketId] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        socket.on("connect", () => {
            setSocketId(socket.id);
            console.log("connected", socket.id);
          });

        // Listen for the 'connect' event
        socket.on("connect", () => {
            console.log("connected", socket.id);
        });

        // Listen for the 'activeConnections' event to update active players count
        socket.on('activeConnections', (count) => {
            setActivePlayers(count);
        });
        socket.on("start",(data)=>{
            console.log(data);
        })

        // Clean up socket connection when component unmounts
        return () => {
            console.log("disconnected ",socket.id);
            socket.disconnect();
        };
    }, []); // Empty dependency array to ensure effect runs only once

    const handleJoin = () => {
        // Handle joining the room
        socket.emit('joinRoom', roomId);
        console.log('Joining room:', roomId);
        navigate(`/game/${roomId}`);
    };

    const handleCreateRoom = () => {
        // Handle creating a room
        socket.emit('create');
        socket.on("created", ({id:roomID}) => {
            setRoomId(roomID);
            // handleJoin();
        })
        console.log('Creating a room...');
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-8">Lobby</h1>
            <p className="mb-4">Active Players: {activePlayers}</p>
            <div className="flex items-center mb-4">
                <label className="mr-2">
                    Enter Room ID:
                    <input
                        type="text"
                        className="border border-gray-400 px-2 py-1 ml-2"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                </label>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" onClick={handleJoin}>Join</button>
            </div>
            <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600" onClick={handleCreateRoom}>Create Room</button>
        </div>
    );
};

export default Lobby;
