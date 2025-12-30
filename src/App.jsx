import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Week1 from './pages/week1';

// 首頁元件
function Home() {
  return (
    <div className="container mt-5">
      <div className="card text-center shadow-sm">
        <div className="card-header bg-primary text-white">
          React 作業集
        </div>
        <div className="card-body">
          <h5 className="card-title">作業首頁</h5>
          <p className="card-text">點擊下方按鈕查看作業進度。</p>
          
          <Link to="/week1" className="btn btn-primary btn-lg">
            前往 主線任務 Week 1
          </Link>
        </div>
      </div>
    </div>
  );
}

// 路由位置
function App() {
  return (
    <HashRouter>
      <Routes>
        {/* 當網址是 / 時，顯示 Home */}
        <Route path="/" element={<Home />} />
        
        {/* 當網址是 /week1 時，顯示 Week1 */}
        <Route path="/week1" element={<Week1 />} />
      </Routes>
    </HashRouter>
  );
}

export default App;