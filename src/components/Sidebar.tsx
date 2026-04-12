import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Video, BookOpen, LineChart, Settings, PlusCircle, HelpCircle, Brain } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutGrid },
    { name: 'Interviews', path: '/mode-selector', icon: Video },
    { name: 'Company Mocks', path: '/mocks', icon: BookOpen },
    { name: 'Library', path: '/library', icon: BookOpen },
    { name: 'History', path: '/history', icon: LineChart },
    { name: 'Settings', path: '/profile', icon: Settings },
  ];

  return (
    <aside className="h-screen w-64 border-r border-white/5 bg-[#060e20] flex flex-col p-4 gap-2 shrink-0 hidden md:flex sticky top-0">
      <div className="flex items-center gap-3 px-2 py-6">
        <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
          <Brain className="text-primary w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-black text-blue-100 leading-none">AI Interviewer</h1>
          <p className="text-[10px] uppercase tracking-widest text-[#8c909f] font-bold mt-1">Intelligent Atmosphere</p>
        </div>
      </div>
      
      <nav className="flex-1 mt-4 space-y-1">
        {navItems.map((item) => {
          const isActive = path === item.path || path.startsWith(item.path + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-sans text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? 'text-blue-400 bg-primary/10' 
                  : 'text-[#8c909f] hover:text-white hover:bg-surface-1'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-white/5">
        <Link to="/mode-selector" className="w-full py-3 px-4 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          <PlusCircle className="w-5 h-5" />
          <span>Start Practice</span>
        </Link>
        <a className="flex items-center gap-3 px-4 py-3 mt-4 text-[#8c909f] hover:text-primary font-sans text-xs uppercase font-bold tracking-widest transition-colors duration-200" href="#">
          <HelpCircle className="w-4 h-4" />
          <span>Help Center</span>
        </a>
      </div>
    </aside>
  );
}
