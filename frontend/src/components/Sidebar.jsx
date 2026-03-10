import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Shield,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/claims", label: "Claims", icon: FileText },
  { path: "/policy", label: "Policy", icon: Shield },
  { path: "/alerts", label: "Alerts", icon: Bell },
];

const Sidebar = ({ worker }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("gigcover_worker");
    navigate("/");
  };

  const initials = worker?.name
    ? worker.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "GW";

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-white fixed left-0 top-0 z-40 shadow-2xl">
      {/* Logo */}
      <div className="flex items-center gap-2 h-16 px-5 border-b border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl leading-none">G</span>
        </div>
        <span className="text-xl font-bold text-white">GigCover</span>
      </div>

      {/* Worker mini-profile */}
      <div className="px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">
              {worker?.name ?? "Worker"}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {worker?.platform ?? "—"} · {worker?.city ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              isActive(path)
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="flex-1">{label}</span>
            {isActive(path) && <ChevronRight className="w-4 h-4" />}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-gray-800 pt-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-all duration-150"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
