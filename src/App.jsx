import { useEffect, useLayoutEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Week1 from './pages/week1/week1';
import Week2 from './pages/week2/week2';
import Week3 from './pages/week3/week3';
import Week4 from './pages/week4/week4';
import WeekCard from './components/WeekCard';

// 卡片資料陣列
const weeksData = [
  {
    id: 'week1',
    title: 'Week 1',
    subtitle: '從函式拆解認識設計模式',
    description: '熟悉 React 基礎環境，建立第一個元件，學習如何使用 map 渲染列表資料。',
    path: '/week1'
  },
  {
    id: 'week2',
    title: 'Week 2',
    subtitle: 'RESTful API 串接',
    description: '深入了解 useState 與 useEffect，實作產品列表的狀態切換與互動邏輯。',
    path: '/week2'
  },
  {
    id: 'week3',
    title: 'Week 3',
    subtitle: '熟練 React.js',
    description: '實作後台登入系統，串接 RESTful API 進行 CRUD（增刪改查）操作與 Token 管理。',
    path: '/week3'
  },
  {
    id: 'week4',
    title: 'Week 4',
    subtitle: '元件化',
    description: '實作後台頁面 Modal 以及分頁改成元件，使用 import module 來引入元件。',
    path: '/week4'
  }
];

// Home 元件
function Home() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">React 作品實戰作業集</h1>
        <p className="lead text-body-secondary">2025 冬季班 - 阿葆的學習歷程</p>
      </div>

      <div className="row g-4">
        {weeksData.map((week) => (
          <WeekCard
            key={week.id}
            title={week.title}
            subtitle={week.subtitle}
            description={week.description}
            path={week.path}
          />
        ))}
      </div>
    </div>
  );
}

// 路由位置
function App() {
  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
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