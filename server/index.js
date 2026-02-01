import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Game state
const rooms = new Map();

// Spectrum topics - pairs of opposite concepts
const spectrums = [
  { left: "Not Cheating", right: "Is Cheating" },
  { left: "Feminine", right: "Masculine" },
  { left: "Cold", right: "Hot" },
  { left: "Weak", right: "Strong" },
  { left: "Evil", right: "Good" },
  { left: "Cheap", right: "Expensive" },
  { left: "Boring", right: "Exciting" },
  { left: "Quiet", right: "Loud" },
  { left: "Simple", right: "Complex" },
  { left: "Soft", right: "Hard" }
];

// Minimum and maximum target position to ensure scoring zones stay on wheel
// Scoring zones extend 14 degrees on each side (~8% of 180 degrees)
// Using 10-90 range to provide safe margin
const MIN_TARGET_POSITION = 10;
const MAX_TARGET_POSITION = 90;

// Helper function to generate a random target position within the safe range
function generateTargetPosition() {
  const targetRange = MAX_TARGET_POSITION - MIN_TARGET_POSITION + 1; // +1 to make MAX inclusive
  return MIN_TARGET_POSITION + Math.floor(Math.random() * targetRange);
}

function createRoom(roomId) {
  const spectrum = spectrums[Math.floor(Math.random() * spectrums.length)];
  const targetPosition = generateTargetPosition();
  
  return {
    id: roomId,
    players: [],
    spectrum,
    targetPosition,
    clue: null,
    guessPosition: null,
    revealed: false,
    currentCluegiver: null
  };
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', (roomId, playerName) => {
    if (!rooms.has(roomId)) {
      const room = createRoom(roomId);
      room.players.push({ id: socket.id, name: playerName });
      room.currentCluegiver = socket.id;
      rooms.set(roomId, room);
      socket.join(roomId);
      socket.emit('roomJoined', { roomId, room });
      console.log(`Room ${roomId} created by ${playerName}`);
    } else {
      socket.emit('error', 'Room already exists');
    }
  });

  socket.on('joinRoom', (roomId, playerName) => {
    const room = rooms.get(roomId);
    if (room) {
      room.players.push({ id: socket.id, name: playerName });
      socket.join(roomId);
      socket.emit('roomJoined', { roomId, room });
      io.to(roomId).emit('playerJoined', { players: room.players });
      console.log(`${playerName} joined room ${roomId}`);
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  socket.on('submitClue', (roomId, clue) => {
    const room = rooms.get(roomId);
    if (room && socket.id === room.currentCluegiver) {
      room.clue = clue;
      io.to(roomId).emit('clueSubmitted', { clue });
      console.log(`Clue submitted in room ${roomId}: ${clue}`);
    }
  });

  socket.on('submitGuess', (roomId, position) => {
    const room = rooms.get(roomId);
    if (room && socket.id !== room.currentCluegiver) {
      room.guessPosition = position;
      room.revealed = true;
      io.to(roomId).emit('guessSubmitted', { 
        guessPosition: position,
        targetPosition: room.targetPosition,
        revealed: true
      });
      console.log(`Guess submitted in room ${roomId}: ${position}`);
    }
  });

  socket.on('newRound', (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      // Reset for new round
      const spectrum = spectrums[Math.floor(Math.random() * spectrums.length)];
      const targetPosition = generateTargetPosition();
      
      // Rotate clue giver to next player
      const currentIndex = room.players.findIndex(p => p.id === room.currentCluegiver);
      const nextIndex = (currentIndex + 1) % room.players.length;
      room.currentCluegiver = room.players[nextIndex].id;
      
      room.spectrum = spectrum;
      room.targetPosition = targetPosition;
      room.clue = null;
      room.guessPosition = null;
      room.revealed = false;
      
      io.to(roomId).emit('newRound', { room });
      console.log(`New round started in room ${roomId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove player from all rooms
    rooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        io.to(roomId).emit('playerLeft', { players: room.players });
        
        // Delete room if empty
        if (room.players.length === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        }
      }
    });
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
