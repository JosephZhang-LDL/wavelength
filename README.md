# Wavelength

The wavelength game, but it's free online.

## About

Wavelength is a social guessing game where players try to read each other's minds. One player is the "clue-giver" who sees a random target position on a spectrum between two opposite concepts (like "Hot" vs "Cold" or "Masculine" vs "Feminine"). They give a one-word clue to help the other players guess where the target is located on the spectrum.

## Screenshots

### Lobby
![Lobby Screen](https://github.com/user-attachments/assets/63c12b4b-f282-41f9-a3a5-071578c7b9d5)

### Clue Giver View
![Clue Giver View](https://github.com/user-attachments/assets/31aab292-2b46-4075-98b4-93ae9eaf7b2b)

### Guesser View
![Guesser View](https://github.com/user-attachments/assets/1216e835-83b1-4a95-ab73-d8d354d4c051)

### Revealed
![Revealed](https://github.com/user-attachments/assets/2bbc1e8b-20aa-457c-ba6d-512db60e9e24)

## Features

- 🎮 **Multiplayer Support**: Create or join rooms with friends
- 🎨 **Beautiful UI**: Gradient semicircle wheel with smooth interactions
- 🎯 **Multiple Spectrums**: 10 different spectrum topics (e.g., "Feminine" ↔ "Masculine", "Cold" ↔ "Hot")
- 🔄 **Turn Rotation**: Clue-giver role rotates between players each round
- ⚡ **Real-time**: Built with Socket.io for instant updates
- 📱 **Responsive**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + Socket.io
- **Styling**: CSS with custom animations
- **Canvas**: HTML5 Canvas for interactive wheel

## Installation

1. Clone the repository:
```bash
git clone https://github.com/JosephZhang-LDL/wavelength.git
cd wavelength
```

2. Install dependencies:
```bash
npm install
```

## Running the Game

### Development Mode

Start both the server and client in development mode:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend client on `http://localhost:3000`

### Run Server Only
```bash
npm run server
```

### Run Client Only
```bash
npm run client
```

### Production Build
```bash
npm run build
npm run preview
```

## How to Play

1. **Create or Join a Room**
   - Enter your name and a room code
   - Click "Create Room" to start a new game or "Join Room" to join an existing one

2. **Clue Giver's Turn**
   - The clue giver sees a target position on the spectrum
   - They give a one-word clue that hints at where the target is
   - The target is hidden from other players

3. **Guessing Phase**
   - Other players see the clue and the spectrum
   - They click on the semicircle wheel to place their guess
   - The guess is submitted immediately

4. **Reveal**
   - Both the target and guess positions are revealed
   - The difference between them is calculated
   - Players can start a new round, and the clue-giver role rotates

## Game Rules

- The clue-giver must give only one word or short phrase as a clue
- Guessers should discuss and agree on where to place the marker
- The closer the guess is to the target, the better!
- Have fun and be creative with your clues!

## Available Spectrums

The game includes these spectrum pairs:
- Not Cheating ↔ Is Cheating
- Feminine ↔ Masculine
- Cold ↔ Hot
- Weak ↔ Strong
- Evil ↔ Good
- Cheap ↔ Expensive
- Boring ↔ Exciting
- Quiet ↔ Loud
- Simple ↔ Complex
- Soft ↔ Hard

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

See [LICENSE](LICENSE) file for details.
