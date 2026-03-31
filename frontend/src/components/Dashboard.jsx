import { useState, useMemo } from 'react';
import { usePosts } from '../hooks/usePosts';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const PILAR_CONFIG = {
  casas: { label: 'Casas', color: '#8B5CF6' },
  educativo: { label: 'Educativo', color: '#3B82F6' },
  institucional: { label: 'Institucional', color: '#14B8A6' },
  bastidores: { label: 'Bastidores', color: '#F59E0B' },
  projeto_social: { label: 'Projeto Social', color: '#EC4899' },
  outro: { label: 'Outro', color: '#6B7280' },
};

const STATUS_CONFIG = {
  ideia: { label: 'Ideia', color: '#9CA3AF' },
  criando: { label: 'Criando', color: '#F59E0B' },
  aprovado: { label: 'Aprovado', color: '#3B82F6' },
  agendado: { label: 'Agendado', color: '#8B5CF6' },
  publicado: { label: 'Publicado', color: '#10B981' },
  cancelado: { label: 'Cancelado', color: '#EF4444' },
};

function StatCard({ label, value, color, sub }) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{ color: color || 'white' }}>{value}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  );
}

function BarChart({ data, maxValue }) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-28 text-right shrink-0">{item.label}</span>
          <div className="flex-1 h-6 bg-[#1a1a1a] rounded-md overflow-hidden">
            <div
              className="h-full rounded-md transition-all duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color,
                minWidth: item.value > 0 ? '2px' : '0',
              }}
            />
          </div>
          <span className="text-xs text-gray-500 w-6 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const { posts, loading } = usePosts({ mes: month + 1, ano: year });

  const stats = useMemo(() => {
    const total = posts.length;
    const publicados = posts.filter((p) => p.status === 'publicado').length;
    const cancelados = posts.filter((p) => p.status === 'cancelado').length;
    const ativos = total - cancelados;
    const pendentes = posts.filter((p) => ['ideia', 'criando', 'aprovado'].includes(p.status)).length;
    const agendados = posts.filter((p) => p.status === 'agendado').length;
    const semCaption = posts.filter((p) => !p.caption && p.status !== 'cancelado').length;
    const semCanva = posts.filter((p) => !p.link_canva && p.status !== 'cancelado').length;

    const byPilar = Object.entries(PILAR_CONFIG).map(([key, cfg]) => ({
      label: cfg.label,
      color: cfg.color,
      value: posts.filter((p) => p.pilar === key && p.status !== 'cancelado').length,
    }));

    const byStatus = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
      label: cfg.label,
      color: cfg.color,
      value: posts.filter((p) => p.status === key).length,
    }));

    return { total, publicados, cancelados, ativos, pendentes, agendados, semCaption, semCanva, byPilar, byStatus };
  }, [posts]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Month nav */}
      <div className="flex items-center justify-center gap-6 py-3 border-b border-[#222]">
        <button onClick={prevMonth} className="text-gray-400 hover:text-white p-1 transition-colors">←</button>
        <h2 className="text-lg font-semibold text-white min-w-[200px] text-center">
          {MONTHS[month]} {year}
        </h2>
        <button onClick={nextMonth} className="text-gray-400 hover:text-white p-1 transition-colors">→</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <span className="text-gray-500">Carregando...</span>
        </div>
      ) : (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total planejados" value={stats.ativos} color="#14B8A6" />
            <StatCard label="Publicados" value={stats.publicados} color="#10B981" sub={stats.ativos > 0 ? `${Math.round((stats.publicados / stats.ativos) * 100)}% do total` : ''} />
            <StatCard label="Pendentes" value={stats.pendentes} color="#F59E0B" sub="Ideia + Criando + Aprovado" />
            <StatCard label="Agendados" value={stats.agendados} color="#8B5CF6" />
          </div>

          {/* Warnings */}
          {(stats.semCaption > 0 || stats.semCanva > 0) && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <div className="text-xs text-amber-500 font-medium mb-2">Atenção</div>
              <div className="flex gap-6">
                {stats.semCaption > 0 && (
                  <div className="text-sm text-amber-400/80">
                    <span className="font-bold">{stats.semCaption}</span> post{stats.semCaption !== 1 ? 's' : ''} sem caption
                  </div>
                )}
                {stats.semCanva > 0 && (
                  <div className="text-sm text-amber-400/80">
                    <span className="font-bold">{stats.semCanva}</span> post{stats.semCanva !== 1 ? 's' : ''} sem link Canva
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Distribution by pilar */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Distribuicao por pilar</h3>
            <BarChart data={stats.byPilar} />
          </div>

          {/* Distribution by status */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Distribuicao por status</h3>
            <BarChart data={stats.byStatus} />
          </div>
        </div>
      )}
    </div>
  );
}
