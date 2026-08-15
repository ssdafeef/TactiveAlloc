import { useState } from 'react';
import axios from 'axios';
import { Loader2, Construction, Moon, Sun } from 'lucide-react';

export default function Login({ theme, onToggleTheme, onLogin }: { theme: 'light' | 'dark', onToggleTheme: () => void, onLogin: (role: string) => void }) {
  const [username, setUsername] = useState('manager1');
  const [password, setPassword] = useState('pass123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const res = await axios.post('http://localhost:8000/api/auth/login', formData);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role);
      onLogin(res.data.role);
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 transition-colors duration-300 dark:bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(249,145,0,0.12),transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.1),transparent_22%)]" />

      <div className="relative w-full max-w-md animate-soft-rise">
        <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-industrial-400/30 via-orange-200/0 to-blue-400/20 blur-xl" />

        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/80 p-8 shadow-2xl shadow-slate-200/60 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/50">
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-industrial-400 hover:text-industrial-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-industrial-500 dark:hover:text-industrial-400"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-industrial-100 to-orange-200 text-industrial-600 shadow-md shadow-industrial-500/20 dark:from-industrial-900/40 dark:to-orange-900/20 dark:text-industrial-400">
              <Construction className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tactive<span className="font-medium text-slate-500 dark:text-slate-400">Alloc</span></h1>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Sign in with manager1 / pass123 or engineer1 / pass123</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-industrial-400 focus:ring-4 focus:ring-industrial-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-industrial-400 focus:ring-4 focus:ring-industrial-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                placeholder="Enter password"
                required
              />
            </div>

            {error && <p className="text-center text-sm font-medium text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-industrial-500 to-orange-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-industrial-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-industrial-500/35 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
