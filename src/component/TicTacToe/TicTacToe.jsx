import React, { useState, useEffect, useMemo, useRef } from 'react';
import io from 'socket.io-client';
import './TicTacToe.css'; // Import CSS for styling
import { useNavigate, useParams } from 'react-router-dom';

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [waiting, setWaiting] = useState(true);
    const [gameboard, setGameboard] = useState(null);
    const [player, setPlayer] = useState(null);
    const [win, setWin] = useState(false);
    const [loss, setLoss] = useState(false);
    const [tie, setTie] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { roomId } = useParams();
    const navigate=useNavigate();
    const socket = useMemo(
        () =>
            io("https://tictac-backend.onrender.com/", {
                // withCredentials: true,
            }),
        []
    );
    const messagesEndRef = useRef(null);

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

useEffect(() => {
  scrollToBottom();
}, [messages]);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("connected", socket.id);
        });
        socket.emit("join", roomId);
        socket.on("start", (data) => {
            setWaiting(false);
            setGameboard(data.gameboard);
            setPlayer(data.player);
            setWin(false);
            setLoss(false);
            setTie(false);
        });
        socket.on("waiting", () => {
            setWaiting(true);
        });
        socket.emit("players", roomId);
        socket.emit("user", socket.id);
        socket.on("updateGame", (data) => {
            setGameboard(data.gameboard);
            setPlayer(prevPlayer => ({ ...prevPlayer, turn: !prevPlayer.turn }));
        });
        socket.on("win", (data) => {
            setGameboard(data.gameboard);
            setWin(true);
        });
        socket.on("loss", (data) => {
            setGameboard(data.gameboard);
            setLoss(true);
        });
        socket.on("tie", (data) => {
            setGameboard(data.gameboard);
            setTie(true);
        });
        socket.on("invalid", (data) => {
            alert("invalid");
        });
        // Chat handle
        socket.on("message", (data) => {
            setMessages(prevMessages => [...prevMessages, data]);
        });
        socket.on("room-error",()=>{
            alert("room does not exist")
            navigate("/")
        })
        return () => {
            console.log("disconnected ", socket.id);
            socket.disconnect();
        };
    }, [roomId]);

    const handleClick = (cell) => {
        if (!win && !loss && !tie ) {
            if(player.turn &&  gameboard[cell] === ""){

                socket.emit("move", { cell, player, roomId });
            }
            else{

                alert("Opponent's Turn");
            }
        } else {
            alert("Game Ended")
        }
    };

    const sendMessage = () => {
        if (newMessage.trim() !== '') {
            socket.emit("send_message", { message: newMessage, id: player.id, roomId });
            setNewMessage('');
        }
    };

    const restartGame = () => {
        // Emit restart event to server
        socket.emit("restart", {roomId});
        // Reset game states
        setWin(false);
        setLoss(false);
        setTie(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div>
                {player && (
                    <div className={`text-lg font-bold ${player.turn ? 'text-green-500' : 'text-red-500'}`}>
                        {player.turn ? (`Your Turn (${player.type=='X'?'X':'O'})` ): (`Opponent's Turn (${player.type=='O'?'X':'O'})`)}
                    </div>
                )}
            </div>
            {waiting ? (
                <div className="text-gray-700">Waiting for another player to join</div>
            ) : gameboard ? (
                <div>
                    <div className="grid grid-cols-3 gap-4 p-4">
                        {Object.keys(gameboard).map((key) => (
                            <div key={key} className="w-24 h-24 bg-white flex items-center justify-center cursor-pointer shadow-md" onClick={() => handleClick(parseInt(key))}>
                                {gameboard[key]}
                            </div>
                        ))}
                    </div>
                    {(win || loss || tie) && (
                        <div>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={restartGame}>Restart</button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-gray-700">No game board available</div>
            )}
            <div>
                {win && <div className="text-green-500">You win the match</div>}
                {loss && <div className="text-red-500">You lose the match</div>}
                {tie && <div className="text-yellow-500">Game tied</div>}
            </div>
            {/* Chat Box */}
            <div className="chat-box mt-4 w-full max-w-md p-4 bg-white rounded shadow-lg">
        <div className="messages overflow-y-auto h-64 mb-4">
            {messages.map((message, index) => (
                <div key={index} className={`message p-2 ${message.id === player.id ? 'bg-blue-100' : 'bg-gray-200'}`}>
                    {message.id === player.id ? `You: ${message.message}` : `Other: ${message.message}`}
                </div>
            ))}
            <div ref={messagesEndRef} /> {/* Empty div for scrolling to */}
        </div>
        <div className="input-container flex">
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="border p-2 w-full rounded-l" onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
            <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-700">Send</button>
        </div>
    </div>
        </div>
    );
    
};

export default TicTacToe;
