import { useState } from 'react';
import { isLoggedIn, logout, getUser } from './lib/api';
import Login from './components/Login';
import Calendar from './components/Calendar';
import PostList from './components/PostList';
import Dashboard from './components/Dashboard';

const TABS = [
  { id: 'calendario', label: 'Calendario' },
  { id: 'lista', label: 'Lista' },
  { id: 'dashboard', label: 'Dashboard' },
];

function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [activeTab, setActiveTab] = useState('calendario');

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs px-3 py-1 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-3">{getUser()}</span>
          <button
            onClick={() => {
              logout();
              setLoggedIn(false);
            }}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
      {activeTab === 'calendario' && <Calendar />}
      {activeTab === 'lista' && <PostList />}
      {activeTab === 'dashboard' && <Dashboard />}
    </div>
  );
}

export default App;
