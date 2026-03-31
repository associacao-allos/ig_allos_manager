import { useState } from 'react';
import { setCredentials } from '../lib/api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    setCredentials(username, password);

    try {
      const res = await fetch('/api/posts?limit=1', {
        headers: { Authorization: `Basic ${btoa(`${username}:${password}`)}` },
      });
      if (res.status === 401) {
        setError('Usuário ou senha incorretos');
        return;
      }
      onLogin(username);
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <form
        onSubmit={handleSubmit}
        className="bg-[#111] border border-[#222] rounded-xl p-8 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-white mb-1">Allos Editorial</h1>
        <p className="text-sm text-gray-500 mb-6">Calendário editorial do Instagram</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <label className="block text-sm text-gray-400 mb-1">Usuário</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm mb-4 focus:outline-none focus:border-teal-500"
          placeholder="victor ou arthur"
          required
        />

        <label className="block text-sm text-gray-400 mb-1">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm mb-6 focus:outline-none focus:border-teal-500"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
