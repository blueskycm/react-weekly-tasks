import WeekCard from '../components/WeekCard';

const weeksData = [
  { id: 'final', title: '🌟 最終專案 (前台)', path: '/final', description: '阿葆的 POE2 秘密商場', tagText: '進入商場' },
  { id: 'final-admin', title: '🌟 最終專案 (後台)', path: '/final/admin', description: '商場後台管理系統', tagText: '進入後台' },
];

export default function Home() {
  return (
    <div className="container py-5">
      <h1 className="text-center mb-5">React 作品實戰 - 最終專案</h1>
      <div className="row justify-content-center g-4">
        {weeksData.map(week => <WeekCard key={week.id} {...week} />)}
      </div>
    </div>
  );
}