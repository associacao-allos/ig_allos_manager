import { useState, useMemo, useRef } from 'react';
import { usePosts } from '../hooks/usePosts';
import { api } from '../lib/api';
import PostCard from './PostCard';
import PostForm from './PostForm';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [editingPost, setEditingPost] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [defaultDate, setDefaultDate] = useState(null);

  const { posts, loading, refresh } = usePosts({ mes: month + 1, ano: year });
  const dragPostRef = useRef(null);
  const [dropTarget, setDropTarget] = useState(null);

  const postsByDay = useMemo(() => {
    const map = {};
    posts.forEach((p) => {
      const d = new Date(p.data_planejada).getDate();
      if (!map[d]) map[d] = [];
      map[d].push(p);
    });
    return map;
  }, [posts]);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  function handleDragStart(post) {
    dragPostRef.current = post;
  }

  function handleDragOver(e, day) {
    e.preventDefault();
    setDropTarget(day);
  }

  function handleDragLeave() {
    setDropTarget(null);
  }

  async function handleDrop(e, day) {
    e.preventDefault();
    setDropTarget(null);
    const post = dragPostRef.current;
    dragPostRef.current = null;
    if (!post) return;

    const oldDate = new Date(post.data_planejada);
    const oldDay = oldDate.getDate();
    if (oldDay === day && oldDate.getMonth() === month && oldDate.getFullYear() === year) return;

    const newDate = new Date(year, month, day, oldDate.getHours(), oldDate.getMinutes());
    try {
      await api.updatePost(post.id, { data_planejada: newDate.toISOString() });
      refresh();
    } catch {
      // silently fail — user can retry
    }
  }

  function handleDayClick(day) {
    const date = new Date(year, month, day, 10, 0);
    setDefaultDate(date.toISOString());
    setEditingPost(null);
    setShowForm(true);
  }

  function handlePostClick(post) {
    setEditingPost(post);
    setDefaultDate(null);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingPost(null);
    setDefaultDate(null);
  }

  function handleFormSave() {
    handleFormClose();
    refresh();
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayDate = today.getDate();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="bg-[#0a0a0a] min-h-[100px]" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayPosts = postsByDay[day] || [];
    const isToday = isCurrentMonth && day === todayDate;

    const isDrop = dropTarget === day;
    cells.push(
      <div
        key={day}
        className={`bg-[#111] border min-h-[100px] p-1 hover:bg-[#151515] transition-colors cursor-pointer ${
          isDrop ? 'border-teal-500/50 bg-teal-500/5' : 'border-[#1a1a1a]'
        }`}
        onClick={() => handleDayClick(day)}
        onDragOver={(e) => handleDragOver(e, day)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, day)}
      >
        <div className="flex items-center justify-between mb-1">
          <span
            className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
              isToday ? 'bg-teal-600 text-white' : 'text-gray-500'
            }`}
          >
            {day}
          </span>
          {dayPosts.length > 0 && (
            <span className="text-[10px] text-gray-600">{dayPosts.length}</span>
          )}
        </div>
        <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
          {dayPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onClick={handlePostClick}
              draggable
              onDragStart={() => handleDragStart(post)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">Allos Editorial</h1>
          <span className="text-xs text-gray-600 hidden sm:inline">Calendário Instagram</span>
        </div>
        <button
          onClick={() => {
            setEditingPost(null);
            setDefaultDate(new Date().toISOString());
            setShowForm(true);
          }}
          className="bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          + Novo Post
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-center gap-6 py-3 border-b border-[#222]">
        <button onClick={prevMonth} className="text-gray-400 hover:text-white p-1 transition-colors">
          ←
        </button>
        <h2 className="text-lg font-semibold text-white min-w-[200px] text-center">
          {MONTHS[month]} {year}
        </h2>
        <button onClick={nextMonth} className="text-gray-400 hover:text-white p-1 transition-colors">
          →
        </button>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 p-4 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <span className="text-gray-500">Carregando...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-xs text-gray-600 font-medium py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-[#1a1a1a] rounded-lg overflow-hidden">
              {cells}
            </div>
          </>
        )}
      </div>

      {/* Post form modal */}
      {showForm && (
        <PostForm
          post={editingPost}
          defaultDate={defaultDate}
          onSave={handleFormSave}
          onDelete={handleFormSave}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
