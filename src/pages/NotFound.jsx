import { Link } from 'react-router-dom';

export default function NotFound({ message = "That page doesn't exist or has moved." }) {
  return (
    <div className="narrow center">
      <p className="big404">404</p>
      <h1>Page not found</h1>
      <p className="muted">{message}</p>
      <Link to="/" className="btn btn-primary btn-lg">Back to home</Link>
    </div>
  );
}
