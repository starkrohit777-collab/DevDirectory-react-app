import { Link } from 'react-router-dom';

const HUES = [250, 12, 160, 40, 200, 330, 95, 280, 20, 180];
export const Avatar = ({ user, size = 52 }) => {
  const h = HUES[user.id % HUES.length];
  const initials = user.name.split(' ').filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('');
  return (
    <div className="avatar" style={{ width: size, height: size, background: `hsl(${h} 80% 92%)`, color: `hsl(${h} 60% 30%)`, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
};

export default function UserCard({ user }) {
  return (
    <Link to={`/users/${user.id}`} className="card user-card">
      <Avatar user={user} />
      <div>
        <h3>{user.name}</h3>
        <p className="muted">@{user.username}</p>
      </div>
      <p className="company">{user.company.name}</p>
      <p className="muted small">{user.address.city} · {user.email}</p>
    </Link>
  );
}
