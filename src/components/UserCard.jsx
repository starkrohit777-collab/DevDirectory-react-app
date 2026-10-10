<<<<<<< HEAD
import { useState } from 'react';
import { Link } from 'react-router-dom';

const HUES = [265, 190, 25, 330, 145, 45, 215, 290];
export const Avatar = ({ user, size = 56 }) => {
  const h = HUES[(user.id - 1) % HUES.length];
  const initials = user.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('');
  const [imageFailed, setImageFailed] = useState(false);
  const avatarUrl = user.avatar || `https://github.com/${encodeURIComponent(user.username)}.png?size=${size * 2}`;

  return (
    <div
      className={`avatar${!imageFailed ? ' avatar-photo' : ''}`}
      style={{ width: size, height: size, '--avatar-hue': h, fontSize: size * .34 }}
      role="img"
      aria-label={`${user.name} profile photo`}
    >
      {!imageFailed && avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : initials}
=======
import { Link } from 'react-router-dom';

const HUES = [250, 12, 160, 40, 200, 330, 95, 280, 20, 180];
export const Avatar = ({ user, size = 52 }) => {
  const h = HUES[user.id % HUES.length];
  const initials = user.name.split(' ').filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('');
  return (
    <div className="avatar" style={{ width: size, height: size, background: `hsl(${h} 80% 92%)`, color: `hsl(${h} 60% 30%)`, fontSize: size * 0.36 }}>
      {initials}
>>>>>>> ceda3109cfbd8ddaa4debd0f0066dbe9b3f23fc7
    </div>
  );
};

export default function UserCard({ user }) {
  return (
<<<<<<< HEAD
    <article className="card user-card">
      <Link to={`/users/${user.id}`} className="user-card-main" aria-label={`View ${user.name}'s profile`}>
        <Avatar user={user} />
        <div className="user-card-heading"><h3>{user.name}</h3><p className="muted">@{user.username}</p></div>
        <span className="card-arrow" aria-hidden="true">↗</span>
      </Link>
      <p className="role">{user.role}</p>
      <p className="bio-preview">{user.bio}</p>
      <div className="skill-list">{user.skills.slice(0, 3).map((skill) => <span className="skill" key={skill}>{skill}</span>)}</div>
      <div className="card-bottom"><span>⌖ {user.location}</span><a href={user.github} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>GitHub ↗</a></div>
    </article>
=======
    <Link to={`/users/${user.id}`} className="card user-card">
      <Avatar user={user} />
      <div>
        <h3>{user.name}</h3>
        <p className="muted">@{user.username}</p>
      </div>
      <p className="company">{user.company.name}</p>
      <p className="muted small">{user.address.city} · {user.email}</p>
    </Link>
>>>>>>> ceda3109cfbd8ddaa4debd0f0066dbe9b3f23fc7
  );
}
