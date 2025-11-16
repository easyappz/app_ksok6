import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await login({ username, password });
      localStorage.setItem('token', data.access);
      navigate('/');
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Ошибка входа';
      setError(msg);
    }
  };

  return (
    <div data-easytag="id1-react/src/components/Login/index.jsx" className="auth-card">
      <h2>Вход</h2>
      <form onSubmit={onSubmit} className="form">
        <label>Логин<input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Введите логин" /></label>
        <label>Пароль<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Введите пароль" /></label>
        {error && <div className="error">{error}</div>}
        <button className="btn primary" type="submit">Войти</button>
      </form>
      <div className="muted">Нет аккаунта? <Link to="/register">Регистрация</Link></div>
    </div>
  );
}
