import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Week1 from './pages/week1'; // 引入剛剛寫好的 Week1 頁面

// 這是首頁元件 (Home)
function Home() {
  return (
    <div className="container mt-5">
      <div className="card text-center shadow-sm">
        <div className="card-header bg-primary text-white">
          React 作業集
        </div>
        <div className="card-body">
          <h5 className="card-title">歡迎來到作業首頁</h5>
          <p className="card-text">請點擊下方按鈕查看本週進度。</p>
          
          {/* 這裡使用 Link 來切換頁面，不要用 <a href> */}
          <Link to="/week1" className="btn btn-primary btn-lg">
            前往 Week 1 主線任務
          </Link>
        </div>
      </div>
    </div>
  );
}

// 這是主程式，負責管理路由
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