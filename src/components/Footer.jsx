export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-light py-4 mt-5 border-top">
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 text-secondary small">

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-dark">v1.0.0</span>
            <span>&copy; {new Date().getFullYear()} Modern Web Apps. All rights reserved.</span>
          </div>

          <div>
            <a
              href="https://github.com/blueskycm/react-weekly-tasks"
              target="_blank"
              rel="noreferrer"
              className="text-secondary text-decoration-none"
            >
              GitHub Source Code
            </a>
          </div>

          <button
            onClick={scrollToTop}
            className="btn btn-link btn-sm text-secondary text-decoration-none p-0 border-0"
            type="button"
          >
            Back to top ↑
          </button>

        </div>
      </div>
    </footer>
  );
}