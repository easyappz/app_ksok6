import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import GamePage from './components/GamePage';
import HistoryPage from './components/HistoryPage';
import LeaderboardPage from './components/LeaderboardPage';
import ProfilePage from './components/ProfilePage';
import NotFound from './components/NotFound';
import './App.css';

const AppRoutes = () => {
  useEffect(() => {
    if (window && typeof window.handleRoutes === 'function') {
      window.handleRoutes(['/', '/login', '/register', '/game/:id', '/history', '/leaders', '/profile']);
    }
  }, []);
  return (
    <div data-easytag="id1-react/src/App.jsx" className="app-container">
      <header className="app-header">
        <Link to="/" className="brand">XO Arena</Link>
        <nav className="nav">
          <Link to="/history">История</Link>
          <Link to="/leaders">Рейтинг</Link>
          <Link to="/profile">Профиль</Link>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/game/:id" element={<GamePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/leaders" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
