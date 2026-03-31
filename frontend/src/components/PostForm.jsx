import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { getUser } from '../lib/api';

const TIPOS = ['carrossel', 'reels', 'stories', 'estatico'];
const PILARES = ['casas', 'educativo', 'institucional', 'bastidores', 'projeto_social', 'outro'];
const STATUSES = ['ideia', 'criando', 'aprovado', 'agendado', 'publicado', 'cancelado'];

function toLocalDatetime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function PostForm({ post, defaultDate, onSave, onDelete, onClose }) {
  const isEditing = !!post;

  const [form, setForm] = useState({
    titulo: '',
    tipo: 'carrossel',
    pilar: 'casas',
    caption: '',
    link_canva: '',
    data_planejada: '',
    status: 'ideia',
    criado_por: getUser() || 'victor',
    notas: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (post) {
      setForm({
        titulo: post.titulo || '',
        tipo: post.tipo || 'carrossel',
        pilar: post.pilar || 'casas',
        caption: post.caption || '',
        link_canva: post.link_canva || '',
        data_planejada: toLocalDatetime(post.data_planejada),
        status: post.status || 'ideia',
        criado_por: post.criado_por || getUser() || 'victor',
        notas: post.notas || '',
      });
    } else if (defaultDate) {
      setForm((f) => ({ ...f, data_planejada: toLocalDatetime(defaultDate) }));
    }
  }, [post, defaultDate]);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const data = {
      ...form,
      data_planejada: new Date(form.data_planejada).toISOString(),
      caption: form.caption || null,
      link_canva: form.link_canva || null,
      notas: form.notas || null,
    };

    try {
      if (isEditing) {
        await api.updatePost(post.id, data);
      } else {
        await api.createPost(data);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Deletar este post?')) return;
    try {
      await api.deletePost(post.id);
      onSave();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-[#222] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#222]">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? 'Editar Post' : 'Novo Post'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Título *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tipo *</label>
              <select
                value={form.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Pilar *</label>
              <select
                value={form.pilar}
                onChange={(e) => handleChange('pilar', e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
              >
                {PILARES.map((p) => (
                  <option key={p} value={p}>
                    {p.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Caption</label>
            <textarea
              value={form.caption}
              onChange={(e) => handleChange('caption', e.target.value)}
              rows={5}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500 resize-y"
              placeholder="Texto do post..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Link do Canva</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.link_canva}
                onChange={(e) => handleChange('link_canva', e.target.value)}
                className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
                placeholder="https://www.canva.com/design/..."
              />
              {form.link_canva && (
                <a
                  href={form.link_canva}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-teal-400 text-sm hover:bg-[#222] transition-colors"
                >
                  Abrir
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Data planejada *</label>
              <input
                type="datetime-local"
                value={form.data_planejada}
                onChange={(e) => handleChange('data_planejada', e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Notas</label>
            <textarea
              value={form.notas}
              onChange={(e) => handleChange('notas', e.target.value)}
              rows={2}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500 resize-y"
              placeholder="Observações internas..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Post'}
            </button>
            {isEditing && post.status !== 'publicado' && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium rounded-lg px-4 py-2 text-sm transition-colors"
              >
                Deletar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
