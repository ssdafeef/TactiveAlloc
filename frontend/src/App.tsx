import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NewBooking from "./pages/NewBooking";
import Fleet from "./pages/Fleet";
import ConflictLog from "./pages/ConflictLog";
import OverridePanel from "./pages/OverridePanel";
import Login from "./components/Login";

function App() {
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  if (!token) {
    return <Login theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} onLogin={(r) => { setRole(r); setToken(localStorage.getItem('token')); }} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} role={role} onLogout={() => { localStorage.clear(); setToken(null); }} />}> 
          <Route index element={<Dashboard />} />
          <Route path="book" element={<NewBooking />} />
          <Route path="fleet" element={<Fleet />} />
          <Route path="conflicts" element={<ConflictLog />} />
          <Route path="overrides" element={<OverridePanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
