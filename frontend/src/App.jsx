import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import PremiumPage from "./pages/PremiumPage";
import DashboardPage from "./pages/DashboardPage";
import ClaimsPage from "./pages/ClaimsPage";
import PolicyPage from "./pages/PolicyPage";
import AlertsPage from "./pages/AlertsPage";
import AdminPage from "./pages/AdminPage";

const DASHBOARD_PATHS = [
  "/dashboard",
  "/claims",
  "/policy",
  "/alerts",
  "/admin",
];

function AppShell() {
  const location = useLocation();
  const isDashboard = DASHBOARD_PATHS.some((p) =>
    location.pathname.startsWith(p),
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      {!isDashboard && (
        <header className="fixed w-full top-0 z-50 glass-panel !rounded-none !border-x-0 !border-t-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl leading-none">
                  G
                </span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                GigCover
              </span>
            </div>
            <nav className="hidden md:flex gap-8">
              <a
                href="#how-it-works"
                className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                How it works
              </a>
              <a
                href="#features"
                className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                Features
              </a>
              <Link
                to="/register"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign In
              </Link>
            </nav>
            <div className="flex items-center">
              <Link
                to="/register"
                className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Get Covered
              </Link>
            </div>
          </div>
        </header>
      )}

      <main className={isDashboard ? "" : "flex-grow pt-16"}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/claims" element={<ClaimsPage />} />
          <Route path="/policy" element={<PolicyPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>

      {!isDashboard && (
        <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
            <p>
              &copy; {new Date().getFullYear()} GigCover Parametric Insurance.
              All rights reserved.
            </p>
            <p className="mt-2">Built with AI-powered risk assessment.</p>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
