import PilarTag, { pilarColor } from './PilarTag';
import StatusBadge from './StatusBadge';

const TIPO_ICONS = {
  carrossel: '📑',
  reels: '🎬',
  stories: '📱',
  estatico: '🖼️',
};

export default function PostCard({ post, onClick }) {
  const borderColor = pilarColor(post.pilar);
  const opacity = post.status === 'cancelado' ? 'opacity-50' : '';

  return (
    <button
      onClick={() => onClick(post)}
      className={`w-full text-left bg-[#1a1a1a] hover:bg-[#222] rounded-lg p-2 border-l-2 transition-colors cursor-pointer ${opacity}`}
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs">{TIPO_ICONS[post.tipo] || '📌'}</span>
        <span className="text-xs text-white font-medium truncate">{post.titulo}</span>
      </div>
      <div className="flex items-center gap-1">
        <StatusBadge status={post.status} />
      </div>
    </button>
  );
}
