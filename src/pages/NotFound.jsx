import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container text-center py-5">
      <h1 className="display-1 text-danger">404</h1>
      <h2 className="mb-4">哎呀！找不到這個頁面</h2>
      <p className="lead mb-4">
        你看起來迷路了，我們帶你回首頁吧？
      </p>
      <Link to="/" className="btn btn-primary">
        回到首頁
      </Link>
    </div>
  );
}