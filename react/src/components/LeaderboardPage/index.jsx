import { useEffect, useState } from 'react';
import { getLeaderboard } from '../../api/leaderboard';

export default function LeaderboardPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getLeaderboard().then(({ data }) => setList(data)).catch(() => setError('Не удалось загрузить рейтинг')).finally(() => setLoading(false));
  }, []);

  return (
    <div data-easytag="id1-react/src/components/LeaderboardPage/index.jsx">
      <h1>Рейтинг игроков</h1>
      <div className="card">
        {loading ? 'Загрузка...' : error ? <div className="error">{error}</div> : (
          list.length === 0 ? <div className="muted">Нет данных</div> : (
            <div className="grid" style={{ gridTemplateColumns: '60px 1fr 100px 1fr' }}>
              <div className="muted">#</div>
              <div className="muted">Игрок</div>
              <div className="muted">ELO</div>
              <div className="muted">Статистика</div>
              {list.map((m, idx) => (
                <>
                  <div key={`i-${m.id}`}>{idx + 1}</div>
                  <div key={`u-${m.id}`}>{m.username}</div>
                  <div key={`r-${m.id}`}>{m.rating}</div>
                  <div key={`s-${m.id}`}>{m.wins}W / {m.draws}D / {m.losses}L</div>
                </>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
