import { useEffect, useLayoutEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Week1 from './pages/week1/week1';
import Week2 from './pages/week2/week2';
import Week3 from './pages/week3/week3';
import Week4 from './pages/week4/week4';

// Home 元件
function Home() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">React 作品實戰作業集</h1>
        <p className="lead text-muted-dark">2025 冬季班 - 阿葆的學習歷程</p>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0 hover-shadow">
            <div className="card-body">
              <h5 className="card-title fw-bold text-primary">Week 1</h5>
              <h6 className="card-subtitle mb-2 text-white-50">從函式拆解認識設計模式</h6>
              <p className="card-text">
                熟悉 React 基礎環境，建立第一個元件，學習如何使用 map 渲染列表資料。
              </p>
              <Link to="/week1" className="btn btn-outline-primary w-100 stretched-link">
                查看作業
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title fw-bold text-primary">Week 2</h5>
              <h6 className="card-subtitle mb-2 text-white-50">RESTful API 串接</h6>
              <p className="card-text">
                深入了解 useState 與 useEffect，實作產品列表的狀態切換與互動邏輯。
              </p>
              <Link to="/week2" className="btn btn-outline-primary w-100 stretched-link">
                查看作業
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title fw-bold text-primary">Week 3</h5>
              <h6 className="card-subtitle mb-2 text-white-50">熟練 React.js</h6>
              <p className="card-text">
                實作後台登入系統，串接 RESTful API 進行 CRUD（增刪改查）操作與 Token 管理。
              </p>
              <Link to="/week3" className="btn btn-outline-primary w-100 stretched-link">
                查看作業
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title fw-bold text-primary">Week 4</h5>
              <h6 className="card-subtitle mb-2 text-white-50">元件化</h6>
              <p className="card-text">
                實作後台頁面 Modal 以及分頁改成元件，使用 import module 來引入元件。
              </p>
              <Link to="/week4" className="btn btn-outline-primary w-100 stretched-link">
                查看作業
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 路由位置
function App() {
  // 偵測系統主題，使用 useLayoutEffect 以確保在畫面渲染前就執行，避免閃白
  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    // 設定主題的函式
    const applyTheme = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-bs-theme', newTheme);
    };
    applyTheme(mediaQuery);
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, []);

  return (
    <HashRouter>
      <Routes>
        {/* 當網址是 / 時，顯示 Home */}
        <Route path="/" element={<Home />} />
        
        <Route path="/week1" element={<Week1 />} />
        <Route path="/week2" element={<Week2 />} />
        <Route path="/week3" element={<Week3 />} />
        <Route path="/week4" element={<Week4 />} />
      </Routes>
    </HashRouter>
  );
}

export default App;