import WeekCard from '../components/WeekCard';

const weeksData = [
  { id: 'week1', title: 'Week 1', path: '/week1', description: '基礎元件' },
  { id: 'week2', title: 'Week 2', path: '/week2', description: 'API 串接' },
  { id: 'week3', title: 'Week 3', path: '/week3', description: '登入驗證' },
  { id: 'week4', title: 'Week 4', path: '/week4', description: '元件化' },
  { id: 'week5', title: 'Week 5', path: '/week5', description: '前台購物車系統' },
  { id: 'week5-admin', title: 'Week 5 (後台)', path: '/week5/admin', description: '後台管理介面' },
  // Week 6
  { id: 'week6', title: 'Week 6 (交易所)', path: '/week6', description: '前台購物車系統' },
  { id: 'week6-admin', title: 'Week 6 (後台)', path: '/week6/admin', description: '後台管理介面 (進階)' },
  // Week 7
  { id: 'week7', title: 'Week 7 (Redux)', path: '/week7', description: '全域狀態管理 (交易所)' },
  { id: 'week7-admin', title: 'Week 7 (後台)', path: '/week7/admin', description: 'Redux 通知系統與後台' },
];

export default function Home() {
  return (
    <div className="container py-5">
      <h1 className="text-center mb-5">React 作品實戰作業集</h1>
      <div className="row g-4">
        {weeksData.map(week => <WeekCard key={week.id} {...week} />)}
      </div>
    </div>
  );
}