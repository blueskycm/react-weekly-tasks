import { useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Week1 from './pages/week1/week1';
import Week2 from './pages/week2/week2';
import Week3 from './pages/week3/week3';

// 首頁元件
function Home() {
  return (
    <div className="container mt-5">
      <div className="card text-center shadow-sm">
        <div className="card-header bg-primary text-white">
          2025 React 作業集
        </div>
        <div className="card-body">
          <h5 className="card-title">作業首頁</h5>
          <p className="card-text">點擊下方按鈕查看作業進度。</p>
          
          <div className="d-grid gap-3 col-6 mx-auto">
            <Link to="/week1" className="btn btn-primary btn-lg">
              前往 主線任務 Week 1
            </Link>

            <Link to="/week2" className="btn btn-primary btn-lg">
              前往 主線任務 Week 2
            </Link>

            <Link to="/week3" className="btn btn-primary btn-lg">
              前往 主線任務 Week 3
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

// 路由位置
function App() {
  useEffect(() => {
    // 修改 html 標籤的 lang 屬性
    document.documentElement.lang = 'zh-TW';
    // 改標題
    document.title = "阿葆的 2025 React 作業集"; 
  }, []);
  return (
    <HashRouter>
      <Routes>
        {/* 當網址是 / 時，顯示 Home */}
        <Route path="/" element={<Home />} />
        
        {/* 當網址是 /week1 時，顯示 Week1 */}
        <Route path="/week1" element={<Week1 />} />
        <Route path="/week2" element={<Week2 />} />
        <Route path="/week3" element={<Week3 />} />
      </Routes>
    </HashRouter>
  );
}

export default App;