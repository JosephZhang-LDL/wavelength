import { useState } from 'react';
import './Lobby.css';

interface LobbyProps {
  onCreateRoom: (name: string, room: string) => void;
  onJoinRoom: (name: string, room: string) => void;
}

function Lobby({ onCreateRoom, onJoinRoom }: LobbyProps) {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [isCreating, setIsCreating] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && room.trim()) {
      if (isCreating) {
        onCreateRoom(name, room);
      } else {
        onJoinRoom(name, room);
      }
    }
  };

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <h1 className="lobby-title">Wavelength</h1>
        <p className="lobby-subtitle">The party game that's free online</p>
        
        <form onSubmit={handleSubmit} className="lobby-form">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="lobby-input"
            required
          />
          
          <input
            type="text"
            placeholder="Room Code"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="lobby-input"
            required
          />
          
          <div className="lobby-buttons">
            <button
              type="submit"
              className={`lobby-button ${isCreating ? 'active' : ''}`}
              onClick={() => setIsCreating(true)}
            >
              Create Room
            </button>
            <button
              type="submit"
              className={`lobby-button ${!isCreating ? 'active' : ''}`}
              onClick={() => setIsCreating(false)}
            >
              Join Room
            </button>
          </div>
        </form>
        
        <div className="lobby-instructions">
          <h3>How to Play:</h3>
          <ol>
            <li>One player is the clue-giver and sees a target on the spectrum</li>
            <li>They give a clue to help others guess where the target is</li>
            <li>Other players place their guess on the spectrum</li>
            <li>The target is revealed to see how close the guess was!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
