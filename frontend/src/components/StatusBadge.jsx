const STATUS_CONFIG = {
  ideia: { label: 'Ideia', color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.15)' },
  criando: { label: 'Criando', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  aprovado: { label: 'Aprovado', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
  agendado: { label: 'Agendado', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },
  publicado: { label: 'Publicado', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  cancelado: { label: 'Cancelado', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.ideia;
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {config.label}
    </span>
  );
}
