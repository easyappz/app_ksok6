import { useEffect, useState } from 'react';
import { me } from '../../api/auth';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    me().then(({ data }) => setProfile(data)).catch(() => navigate('/login'));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div data-easytag="id1-react/src/components/ProfilePage/index.jsx">
      <h1>Профиль</h1>
      {!profile ? <div>Загрузка...</div> : (
        <div className="card">
          <div><b>Логин:</b> {profile.username}</div>
          <div><b>Рейтинг (ELO):</b> {profile.rating}</div>
          <div><b>Статистика:</b> {profile.wins}W / {profile.draws}D / {profile.losses}L</div>
          <button className="btn" onClick={logout}>Выйти</button>
        </div>
      )}
    </div>
  );
}
