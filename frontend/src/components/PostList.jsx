import { useState, useMemo } from 'react';
import { usePosts } from '../hooks/usePosts';
import PilarTag from './PilarTag';
import StatusBadge from './StatusBadge';
import PostForm from './PostForm';

const TIPOS = ['carrossel', 'reels', 'stories', 'estatico'];
const PILARES = ['casas', 'educativo', 'institucional', 'bastidores', 'projeto_social', 'outro'];
const STATUSES = ['ideia', 'criando', 'aprovado', 'agendado', 'publicado', 'cancelado'];
const CRIADORES = ['victor', 'arthur'];

const TIPO_ICONS = {
  carrossel: '📑',
  reels: '🎬',
  stories: '📱',
  estatico: '🖼️',
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function PostList() {
  const [filters, setFilters] = useState({ status: '', pilar: '', tipo: '', criado_por: '' });
  const [editingPost, setEditingPost] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { posts, loading, refresh } = usePosts({});

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (filters.status && p.status !== filters.status) return false;
      if (filters.pilar && p.pilar !== filters.pilar) return false;
      if (filters.tipo && p.tipo !== filters.tipo) return false;
      if (filters.criado_por && p.criado_por !== filters.criado_por) return false;
      return true;
    });
  }, [posts, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => new Date(a.data_planejada) - new Date(b.data_planejada));
  }, [filtered]);

  function handleFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function clearFilters() {
    setFilters({ status: '', pilar: '', tipo: '', criado_por: '' });
  }

  function handlePostClick(post) {
    setEditingPost(post);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingPost(null);
  }

  function handleFormSave() {
    handleFormClose();
    refresh();
  }

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-[#222]">
        <select
          value={filters.status}
          onChange={(e) => handleFilter('status', e.target.value)}
          className="bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-teal-500"
        >
          <option value="">Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <select
          value={filters.pilar}
          onChange={(e) => handleFilter('pilar', e.target.value)}
          className="bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-teal-500"
        >
          <option value="">Pilar</option>
          {PILARES.map((p) => (
            <option key={p} value={p}>{p.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
          ))}
        </select>

        <select
          value={filters.tipo}
          onChange={(e) => handleFilter('tipo', e.target.value)}
          className="bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-teal-500"
        >
          <option value="">Tipo</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>

        <select
          value={filters.criado_por}
          onChange={(e) => handleFilter('criado_por', e.target.value)}
          className="bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-teal-500"
        >
          <option value="">Criado por</option>
          {CRIADORES.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Limpar filtros
          </button>
        )}

        <span className="text-xs text-gray-600 ml-auto">
          {sorted.length} post{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <span className="text-gray-500">Carregando...</span>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <span className="text-gray-500">Nenhum post encontrado</span>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-[#222]">
                <th className="pb-2 pr-3 font-medium">Data</th>
                <th className="pb-2 pr-3 font-medium">Tipo</th>
                <th className="pb-2 pr-3 font-medium">Titulo</th>
                <th className="pb-2 pr-3 font-medium">Pilar</th>
                <th className="pb-2 pr-3 font-medium">Status</th>
                <th className="pb-2 pr-3 font-medium">Autor</th>
                <th className="pb-2 font-medium">Info</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((post) => {
                const missingCaption = !post.caption;
                const missingCanva = !post.link_canva;
                const hasWarning = missingCaption || missingCanva;

                return (
                  <tr
                    key={post.id}
                    onClick={() => handlePostClick(post)}
                    className={`border-b border-[#1a1a1a] hover:bg-[#151515] cursor-pointer transition-colors ${
                      post.status === 'cancelado' ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="py-2.5 pr-3 text-sm text-gray-300 whitespace-nowrap">
                      <div>{formatDate(post.data_planejada)}</div>
                      <div className="text-xs text-gray-600">{formatTime(post.data_planejada)}</div>
                    </td>
                    <td className="py-2.5 pr-3 text-sm">
                      <span title={post.tipo}>{TIPO_ICONS[post.tipo] || '📌'}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-sm text-white font-medium max-w-[250px] truncate">
                      {post.titulo}
                    </td>
                    <td className="py-2.5 pr-3">
                      <PilarTag pilar={post.pilar} />
                    </td>
                    <td className="py-2.5 pr-3">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="py-2.5 pr-3 text-sm text-gray-400 capitalize">
                      {post.criado_por}
                    </td>
                    <td className="py-2.5 text-sm">
                      {hasWarning && post.status !== 'cancelado' && post.status !== 'publicado' && (
                        <div className="flex items-center gap-1.5">
                          {missingCaption && (
                            <span className="text-amber-500/80 text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded" title="Sem caption">
                              sem caption
                            </span>
                          )}
                          {missingCanva && (
                            <span className="text-amber-500/80 text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded" title="Sem link Canva">
                              sem canva
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <PostForm
          post={editingPost}
          onSave={handleFormSave}
          onDelete={handleFormSave}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
