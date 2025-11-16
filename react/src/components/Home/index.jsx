import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div data-easytag="id1-react/src/components/Home/index.jsx">
      <h1>Лобби</h1>
      <p>Создайте игру или подключитесь к существующей.</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link className="btn primary" to="/profile">Перейти в профиль</Link>
        <Link className="btn" to="/leaders">Рейтинг игроков</Link>
        <Link className="btn" to="/history">История игр</Link>
      </div>
    </div>
  );
}
