import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import Home from './pages/Home';
import Setup from './pages/Setup';
import Game from './pages/Game';
import FastMoney from './pages/FastMoney';
import GameOver from './pages/GameOver';
import Admin from './pages/Admin';

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/game" element={<Game />} />
          <Route path="/fastmoney" element={<FastMoney />} />
          <Route path="/gameover" element={<GameOver />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
}
