import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Toast from './components/Toast';

function App() {
  useEffect(() => {
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
    <>
      <Toast />
      <Outlet />
    </>
  );
}

export default App;