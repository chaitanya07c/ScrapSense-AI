import React, { useState } from 'react';
import { Bot, BarChart3, Users, DollarSign, Package, PieChart, LogOut, Search, Bell, Moon, Sun } from 'lucide-react';
import LoginPage from './components/LoginPage';
import { useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import SuppliersModule from './components/SuppliersModule';
import PurchasesModule from './components/PurchasesModule';
import AiAssistantModule from './components/AiAssistantModule';
import ReportsModule from './components/ReportsModule';
import { Toaster } from 'react-hot-toast';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <Toaster position="top-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl' }} />
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 overflow-hidden font-sans">
        
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Package className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">
              ScrapSense AI
            </h1>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-2">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
              { id: 'reports', icon: PieChart, label: 'Reports & Analytics' },
              { id: 'ai-assistant', icon: Bot, label: 'AI Assistant' },
              { id: 'suppliers', icon: Users, label: 'Suppliers' },
              { id: 'purchases', icon: DollarSign, label: 'Purchases' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (activeTab !== item.id) {
                    setIsLoadingTab(true);
                    setActiveTab(item.id);
                    setTimeout(() => setIsLoadingTab(false), 400); // 400ms skeleton flash
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button 
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-900/50 relative">
          
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-8 py-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-6">
              {/* Optional Logo for smaller screens or Top Nav consistency */}
              <div className="hidden lg:flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-md">
                  <Package className="text-white w-5 h-5" />
                </div>
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">
                  ScrapSense AI
                </h1>
              </div>
              <h2 className="text-xl font-bold capitalize text-slate-800 dark:text-slate-100 hidden md:block border-l border-slate-300 dark:border-slate-700 pl-6">
                {activeTab.replace('-', ' ')}
              </h2>
            </div>
            
            <div className="flex items-center gap-3 md:gap-5">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search suppliers, orders..."
                  className="bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 rounded-full pl-9 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Hindsight Memory Indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold border border-emerald-200/50 dark:border-emerald-800/30">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                Hindsight Active
              </div>

              {/* Theme Toggle */}
              <button onClick={toggleDarkMode} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-white dark:border-slate-800 shadow-md"></div>
                <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          <main className="p-8">
            {isLoadingTab ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                  <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'reports' && <ReportsModule />}
                {activeTab === 'suppliers' && <SuppliersModule />}
                {activeTab === 'ai-assistant' && <AiAssistantModule />}
                {activeTab === 'purchases' && <PurchasesModule />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
