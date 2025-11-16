import { useEffect, useState } from 'react';
import { createGame, listOpenGames, joinGame } from '../../api/games';
import { useNavigate } from 'react-router-dom';

function isExpired(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return true;
    let base64 = parts[1].replaceAll('-', '+').replaceAll('_', '/');
    while (base64.length % 4 !== 0) base64 += '=';
    const payload = JSON.parse(atob(base64));
    const exp = typeof payload.exp === 'number' ? payload.exp : 0;
    const now = Math.floor(Date.now() / 1000);
    return exp <= now;
  } catch (e) {
    return true;
  }
}

export default function Home() {
  const [openGames, setOpenGames] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      setError('');
      const { data } = await listOpenGames();
      setOpenGames(data);
    } catch (e) {
      setError('Не удалось загрузить список игр');
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async () => {
    const token = localStorage.getItem('token');
    if (!token || isExpired(token)) {
      navigate('/login?next=/');
      return;
    }

    try {
      setLoading(true);
      const { data } = await createGame();
      navigate(`/game/${data.id}`);
    } catch (e) {
      setError('Не удалось создать игру. Авторизуйтесь.');
    } finally { setLoading(false); }
  };

  const onJoin = async (id) => {
    const token = localStorage.getItem('token');
    if (!token || isExpired(token)) {
      const nextPath = encodeURIComponent(window.location.pathname);
      navigate(`/login?next=${nextPath}`);
      return;
    }

    try {
      const { data } = await joinGame(id);
      navigate(`/game/${data.id}`);
    } catch (e) {
      const msg = e?.response?.data?.detail || 'Не удалось подключиться';
      setError(msg);
    }
  };

  return (
    <div data-easytag="id1-react/src/components/Home/index.jsx">
      <div className="card" style={{ marginBottom: 16 }}>
        <h1>Лобби</h1>
        <p className="muted">Создайте свою игру или подключитесь к одной из открытых игр ниже.</p>
        <button className="btn primary" onClick={onCreate} disabled={loading}>{loading ? 'Создание...' : 'Создать игру'}</button>
        {error && <div className="error" style={{ marginTop: 10 }}>{error}</div>}
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2>Открытые игры</h2>
          <button className="btn" onClick={load}>Обновить</button>
        </div>
        {openGames.length === 0 ? (
          <div className="muted">Пока нет открытых игр. Создайте свою!</div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {openGames.map(g => (
              <div key={g.id} className="card" style={{ background: '#141633' }}>
                <div><b>Игра #{g.id}</b></div>
                <div className="muted">Создатель: {g.creator_name}</div>
                <div className="muted">Создана: {new Date(g.created_at).toLocaleString()}</div>
                <button className="btn primary" onClick={() => onJoin(g.id)} style={{ marginTop: 10 }}>Подключиться</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
