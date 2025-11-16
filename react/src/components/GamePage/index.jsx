import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGame, makeMove, closeGame } from '../../api/games';

const Cell = ({ value, onClick }) => (
  <button className={`cell ${value}`} onClick={onClick} disabled={value !== '-' }>{value === '-' ? '' : value}</button>
);

export default function GamePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await getGame(id);
      setGame(data);
      setError('');
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Не удалось загрузить игру';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!game) return;
    if (game.status === 'in_progress') {
      const t = setInterval(() => { load(); }, 2000);
      return () => clearInterval(t);
    }
  }, [game, load]);

  const onMove = async (idx) => {
    if (!game || game.status !== 'in_progress') return;
    try {
      const { data } = await makeMove(id, idx);
      setGame(data);
      setError('');
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Ход отклонён';
      setError(msg);
    }
  };

  const onClose = async () => {
    try {
      await closeGame(id);
      navigate('/');
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Не удалось закрыть игру';
      setError(msg);
    }
  };

  const statusText = useMemo(() => {
    if (!game) return '';
    if (game.status === 'open') return 'Ожидаем второго игрока...';
    if (game.status === 'in_progress') return `Ход: ${game.next_turn}`;
    if (game.status === 'finished') {
      if (game.winner === null || typeof game.winner !== 'object') return 'Игра завершена: ничья';
      return `Игра завершена. Победитель: ${game.winner.username}`;
    }
    if (game.status === 'closed') return 'Игра закрыта';
    return '';
  }, [game]);

  if (loading) return <div data-easytag="id1-react/src/components/GamePage/index.jsx"><div className="card">Загрузка...</div></div>;
  if (!game) return <div data-easytag="id1-react/src/components/GamePage/index.jsx"><div className="card error">{error || 'Игра не найдена'}</div></div>;

  return (
    <div data-easytag="id1-react/src/components/GamePage/index.jsx">
      <div className="card" style={{ marginBottom: 16 }}>
        <h1>Игра #{game.id}</h1>
        <div className="muted">Создатель: {game.creator?.username} {game.opponent ? `| Соперник: ${game.opponent.username}` : ''}</div>
        <div style={{ marginTop: 8 }}><b>{statusText}</b></div>
        {error && <div className="error" style={{ marginTop: 8 }}>{error}</div>}
      </div>

      <div className="card" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="board">
          {Array.isArray(game.board_list) && game.board_list.map((v, i) => (
            <Cell key={i} value={v} onClick={() => onMove(i)} />
          ))}
        </div>
      </div>

      {game.status === 'finished' && (
        <div className="card" style={{ marginTop: 16 }}>
          <button className="btn primary" onClick={onClose}>Закрыть игру</button>
        </div>
      )}
    </div>
  );
}
