import { useState } from 'react';
import { isLoggedIn, logout, getUser } from './lib/api';
import Login from './components/Login';
import Calendar from './components/Calendar';

function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Top bar with user info */}
      <div className="flex items-center justify-end px-6 py-2 border-b border-[#1a1a1a]">
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
      <Calendar />
    </div>
  );
}

export default App;
