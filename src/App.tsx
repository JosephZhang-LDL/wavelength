import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import Lobby from './components/Lobby'
import Game from './components/Game'
import './App.css'

interface Player {
  id: string;
  name: string;
}

interface Spectrum {
  left: string;
  right: string;
}

interface Room {
  id: string;
  players: Player[];
  spectrum: Spectrum;
  targetPosition: number;
  clue: string | null;
  guessPosition: number | null;
  revealed: boolean;
  currentCluegiver: string | null;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [inGame, setInGame] = useState(false);

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    newSocket.on('roomJoined', ({ roomId, room }) => {
      setRoomId(roomId);
      setRoom(room);
      setInGame(true);
    });

    newSocket.on('playerJoined', ({ players }) => {
      setRoom(prev => prev ? { ...prev, players } : null);
    });

    newSocket.on('playerLeft', ({ players }) => {
      setRoom(prev => prev ? { ...prev, players } : null);
    });

    newSocket.on('clueSubmitted', ({ clue }) => {
      setRoom(prev => prev ? { ...prev, clue } : null);
    });

    newSocket.on('guessSubmitted', ({ guessPosition, targetPosition, revealed }) => {
      setRoom(prev => prev ? { 
        ...prev, 
        guessPosition, 
        targetPosition, 
        revealed 
      } : null);
    });

    newSocket.on('newRound', ({ room }) => {
      setRoom(room);
    });

    newSocket.on('error', (message) => {
      alert(message);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleCreateRoom = (name: string, room: string) => {
    setPlayerName(name);
    socket?.emit('createRoom', room, name);
  };

  const handleJoinRoom = (name: string, room: string) => {
    setPlayerName(name);
    socket?.emit('joinRoom', room, name);
  };

  return (
    <div className="App">
      {!inGame ? (
        <Lobby 
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      ) : (
        room && socket && (
          <Game 
            room={room}
            socket={socket}
            playerId={socket.id}
            roomId={roomId}
          />
        )
      )}
    </div>
  );
}

export default App
