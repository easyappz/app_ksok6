import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as apiRegister } from '../../api/auth';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await apiRegister({ username, password });
      navigate('/login');
    } catch (err) {
      const msg = err?.response?.data?.username?.[0] || 'Ошибка регистрации';
      setError(msg);
    }
  };

  return (
    <div data-easytag="id1-react/src/components/Register/index.jsx" className="auth-card">
      <h2>Регистрация</h2>
      <form onSubmit={onSubmit} className="form">
        <label>Логин<input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Придумайте логин" /></label>
        <label>Пароль<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Придумайте пароль" /></label>
        {error && <div className="error">{error}</div>}
        <button className="btn primary" type="submit">Зарегистрироваться</button>
      </form>
      <div className="muted">Уже есть аккаунт? <Link to="/login">Войти</Link></div>
    </div>
  );
}
