import { Bell, Search, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 lg:h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar - Responsive */}
      <div className="flex items-center gap-2 lg:gap-4 bg-slate-800/50 px-3 lg:px-4 py-2 rounded-xl lg:rounded-2xl w-full max-w-md">
        <Search size={18} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent border-none focus:outline-none text-slate-200 text-sm lg:text-base w-full placeholder:text-slate-500"
        />
      </div>

      {/* Right Side - Notifications & Profile */}
      <div className="flex items-center gap-3 lg:gap-6">
        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 lg:gap-4 pl-3 lg:pl-6 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white truncate max-w-[120px]">
              {user?.name}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              {user?.role}
            </p>
          </div>
          <div className="w-8 lg:w-10 h-8 lg:h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 flex-shrink-0">
            {user?.name?.charAt(0) || <User size={18} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
