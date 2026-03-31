const PILAR_CONFIG = {
  casas: { label: 'Casas', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },
  educativo: { label: 'Educativo', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
  institucional: { label: 'Institucional', color: '#14B8A6', bg: 'rgba(20, 184, 166, 0.15)' },
  bastidores: { label: 'Bastidores', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  projeto_social: { label: 'Projeto Social', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.15)' },
  outro: { label: 'Outro', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.15)' },
};

export function pilarColor(pilar) {
  return PILAR_CONFIG[pilar]?.color || '#6B7280';
}

export default function PilarTag({ pilar }) {
  const config = PILAR_CONFIG[pilar] || PILAR_CONFIG.outro;
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {config.label}
    </span>
  );
}
