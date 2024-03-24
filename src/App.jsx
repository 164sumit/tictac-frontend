import React, { useEffect } from 'react'
import Lobby from './component/Lobby/Lobby'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TicTacToe from './component/TicTacToe/TicTacToe';
import { io } from 'socket.io-client';
function App() {
//   useEffect(() => {
//     const socket = io('http://localhost:3000');
//     socket.on("connect", () => {
//         console.log("connected", socket.id);
//     });
//     // socket.on('activeConnections', (count) => {
//     //     setActivePlayers(count);
//     // });

//     // // Listen for the 'created' event to receive the room ID
//     // socket.on('created', ({ id }) => {
//     //     setRoomId(id);
//     //     console.log(id);
//     // });

//     return () => {
//         socket.disconnect();
//     };
// }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/game/:roomId" element={<TicTacToe  />} />

        {/* <Route path="/about" element={<About />} /> */}
        {/* <Route path="/contact" element={<Contact />} /> */}
      </Routes>
    </Router>
  )
}

export default App