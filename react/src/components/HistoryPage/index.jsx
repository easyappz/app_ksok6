import { useEffect, useState } from 'react';
import { getHistory } from '../../api/history';

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getHistory().then(({ data }) => setItems(data)).catch(() => setError('Не удалось загрузить историю')).finally(() => setLoading(false));
  }, []);

  return (
    <div data-easytag="id1-react/src/components/HistoryPage/index.jsx">
      <h1>История игр</h1>
      <div className="card">
        {loading ? 'Загрузка...' : error ? <div className="error">{error}</div> : (
          items.length === 0 ? <div className="muted">История пуста</div> : (
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div className="muted">Игра</div>
              <div className="muted">Соперник</div>
              <div className="muted">Результат</div>
              {items.map(it => (
                <>
                  <div key={`g-${it.id}`}>#{it.id}</div>
                  <div key={`o-${it.id}`}>{it.opponent}</div>
                  <div key={`r-${it.id}`}>{it.result} — {new Date(it.played_at).toLocaleString()}</div>
                </>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
