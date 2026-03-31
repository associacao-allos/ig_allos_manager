import PilarTag, { pilarColor } from './PilarTag';
import StatusBadge from './StatusBadge';

const TIPO_ICONS = {
  carrossel: '📑',
  reels: '🎬',
  stories: '📱',
  estatico: '🖼️',
};

export default function PostCard({ post, onClick, draggable, onDragStart }) {
  const borderColor = pilarColor(post.pilar);
  const opacity = post.status === 'cancelado' ? 'opacity-50' : '';
  const isActive = post.status !== 'cancelado' && post.status !== 'publicado';
  const missingCaption = !post.caption && isActive;
  const missingCanva = !post.link_canva && isActive;
  const hasWarning = missingCaption || missingCanva;

  return (
    <button
      onClick={() => onClick(post)}
      draggable={draggable}
      onDragStart={onDragStart}
      className={`w-full text-left bg-[#1a1a1a] hover:bg-[#222] rounded-lg p-2 border-l-2 transition-colors cursor-pointer ${opacity}`}
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs">{TIPO_ICONS[post.tipo] || '📌'}</span>
        <span className="text-xs text-white font-medium truncate flex-1">{post.titulo}</span>
        {hasWarning && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"
            title={[missingCaption && 'Sem caption', missingCanva && 'Sem link Canva'].filter(Boolean).join(', ')}
          />
        )}
      </div>
      <div className="flex items-center gap-1">
        <StatusBadge status={post.status} />
      </div>
    </button>
  );
}
