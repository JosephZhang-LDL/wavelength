import { useState } from 'react';
import { Socket } from 'socket.io-client';
import WheelDisplay from './WheelDisplay';
import './Game.css';

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

interface GameProps {
  room: Room;
  socket: Socket;
  playerId: string;
  roomId: string;
}

function Game({ room, socket, playerId, roomId }: GameProps) {
  const [clueInput, setClueInput] = useState('');
  const [guessPosition, setGuessPosition] = useState<number | null>(null);
  
  const isClueGiver = room.currentCluegiver === playerId;
  const currentPlayer = room.players.find(p => p.id === room.currentCluegiver);

  const handleSubmitClue = () => {
    if (clueInput.trim()) {
      socket.emit('submitClue', roomId, clueInput);
      setClueInput('');
    }
  };

  const handleSubmitGuess = (position: number) => {
    setGuessPosition(position);
    socket.emit('submitGuess', roomId, position);
  };

  const handleNewRound = () => {
    setGuessPosition(null);
    socket.emit('newRound', roomId);
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h2 className="game-title">Wavelength</h2>
        <div className="room-info">Room: {roomId}</div>
      </div>

      <div className="players-list">
        <h3>Players:</h3>
        <ul>
          {room.players.map(player => (
            <li key={player.id} className={player.id === room.currentCluegiver ? 'active-player' : ''}>
              {player.name} {player.id === room.currentCluegiver && '(Clue Giver)'}
            </li>
          ))}
        </ul>
      </div>

      <div className="game-board">
        <WheelDisplay
          spectrum={room.spectrum}
          targetPosition={isClueGiver || room.revealed ? room.targetPosition : null}
          guessPosition={room.guessPosition}
          revealed={room.revealed}
          isClueGiver={isClueGiver}
          onGuess={handleSubmitGuess}
          clueSubmitted={!!room.clue}
        />

        <div className="game-controls">
          {isClueGiver ? (
            <div className="clue-giver-section">
              {!room.clue ? (
                <>
                  <h3>You are the Clue Giver!</h3>
                  <p>Give a clue that relates to the target position on the spectrum.</p>
                  <div className="clue-input-group">
                    <input
                      type="text"
                      placeholder="Enter your clue..."
                      value={clueInput}
                      onChange={(e) => setClueInput(e.target.value)}
                      className="clue-input"
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmitClue()}
                    />
                    <button onClick={handleSubmitClue} className="submit-button">
                      Submit Clue
                    </button>
                  </div>
                </>
              ) : (
                <div className="waiting-message">
                  <h3>Waiting for guesses...</h3>
                  <p>Your clue: "{room.clue}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="guesser-section">
              {!room.clue ? (
                <div className="waiting-message">
                  <h3>Waiting for {currentPlayer?.name} to give a clue...</h3>
                </div>
              ) : !room.revealed ? (
                <div className="guessing-section">
                  <h3>The clue is: "{room.clue}"</h3>
                  <p>Click on the wheel to place your guess!</p>
                </div>
              ) : (
                <div className="result-message">
                  <h3>Round Complete!</h3>
                  <p>The target was at {room.targetPosition}%</p>
                  <p>Your guess was at {room.guessPosition}%</p>
                  {room.guessPosition !== null && (
                    <p>Difference: {Math.abs(room.targetPosition - room.guessPosition)}%</p>
                  )}
                </div>
              )}
            </div>
          )}

          {room.revealed && (
            <button onClick={handleNewRound} className="new-round-button">
              Start New Round
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Game;
