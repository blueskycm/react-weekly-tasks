export default function Footer() {
  return (
    <footer className="bg-light text-center py-4 mt-5">
      <div className="container">
        <p className="mb-0 text-secondary">
          &copy; {new Date().getFullYear()} React 作品實戰冬季班 - Week 5 作業
        </p>
      </div>
    </footer>
  );
}