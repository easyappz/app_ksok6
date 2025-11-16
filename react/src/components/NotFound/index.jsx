import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div data-easytag="id1-react/src/components/NotFound/index.jsx">
      <h1>404</h1>
      <p>Страница не найдена</p>
      <Link className="btn" to="/">На главную</Link>
    </div>
  );
}
