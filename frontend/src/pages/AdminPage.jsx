import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Users,
  Shield,
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  CloudRain,
  Thermometer,
  Wind,
  BarChart3,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const StatusBadge = ({ status }) => {
  const map = {
    approved: {
      cls: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle,
    },
    rejected: { cls: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
    pending: {
      cls: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: Clock,
    },
    flagged: {
      cls: "bg-amber-100 text-amber-700 border-amber-200",
      icon: AlertTriangle,
    },
  };
  const s = map[status] ?? {
    cls: "bg-gray-100 text-gray-600 border-gray-200",
    icon: FileText,
  };
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}
    >
      <Icon className="w-3 h-3" />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  color = "blue",
  suffix = "",
}) => {
  const palette = {
    blue: { bg: "from-blue-600 to-blue-500", text: "text-blue-100" },
    green: { bg: "from-green-600 to-green-500", text: "text-green-100" },
    amber: { bg: "from-amber-500 to-amber-400", text: "text-amber-100" },
    purple: { bg: "from-purple-600 to-purple-500", text: "text-purple-100" },
    red: { bg: "from-red-600 to-red-500", text: "text-red-100" },
  };
  const p = palette[color] ?? palette.blue;
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${p.bg} p-5 shadow-lg text-white`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className={`text-sm font-medium ${p.text}`}>{label}</p>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-black tracking-tight">
        {value}
        {suffix}
      </p>
    </div>
  );
};

/** Simple horizontal bar chart using pure CSS */
const CityBarChart = ({ claims }) => {
  const cityMap = {};
  claims.forEach((c) => {
    const city = c.policy?.city ?? "Unknown";
    cityMap[city] =
      (cityMap[city] ?? 0) + (c.status === "approved" ? c.payoutAmount : 0);
  });
  const entries = Object.entries(cityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const max = entries[0]?.[1] ?? 1;

  return (
    <div className="space-y-3">
      {entries.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">
          No payouts yet. Simulate disruptions to generate data.
        </p>
      )}
      {entries.map(([city, amount]) => (
        <div key={city} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-20 truncate">{city}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
              style={{ width: `${Math.round((amount / max) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-gray-700 w-16 text-right">
            ₹{amount}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("claims"); // "claims" | "policies"
  const [processing, setProcessing] = useState({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c, p] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/stats"),
        axios.get("http://localhost:5000/api/admin/claims"),
        axios.get("http://localhost:5000/api/admin/policies"),
      ]);
      setStats(s.data);
      setClaims(c.data);
      setPolicies(p.data);
    } catch {
      // show error gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleAction = async (claimId, action) => {
    setProcessing((p) => ({ ...p, [claimId]: action }));
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/claims/${claimId}/${action}`,
      );
      setClaims((prev) =>
        prev.map((c) =>
          c.claimId === claimId
            ? {
                ...c,
                status: action === "approve" ? "approved" : "rejected",
                reviewedAt: new Date().toISOString(),
              }
            : c,
        ),
      );
      // Refresh stats
      const s = await axios.get("http://localhost:5000/api/admin/stats");
      setStats(s.data);
    } catch {
      alert("Action failed. Please try again.");
    } finally {
      setProcessing((p) => {
        const n = { ...p };
        delete n[claimId];
        return n;
      });
    }
  };

  const fraudClaims = claims.filter((c) => c.fraudProbability > 0.5);
  const pendingClaims = claims.filter(
    (c) => c.status === "pending" || c.status === "flagged",
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-400">
              GigCover Operations Dashboard
            </p>
          </div>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Workers"
            value={stats?.totalWorkers ?? "—"}
            icon={Users}
            color="blue"
          />
          <StatCard
            label="Active Policies"
            value={stats?.activePolicies ?? "—"}
            icon={Shield}
            color="green"
          />
          <StatCard
            label="Claims Today"
            value={stats?.claimsToday ?? "—"}
            icon={FileText}
            color="purple"
          />
          <StatCard
            label="Total Payout"
            value={stats ? `₹${stats.totalPayout}` : "—"}
            icon={IndianRupee}
            color="amber"
          />
          <StatCard
            label="Fraud Flagged"
            value={stats?.fraudFlagged ?? "—"}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        {/* Fraud Alerts */}
        {fraudClaims.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-red-800">
                Fraud Alerts — {fraudClaims.length} suspicious claims
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {fraudClaims.map((c) => (
                <div
                  key={c.claimId}
                  className="bg-white border border-red-100 rounded-xl p-3"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm text-gray-800">
                      {c.policy?.workerName ?? "Unknown"}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {c.claimId} · {c.disruptionType}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-red-500"
                          style={{
                            width: `${Math.round(c.fraudProbability * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-red-600">
                        {(c.fraudProbability * 100).toFixed(0)}%
                      </span>
                    </div>
                    {c.status !== "approved" && c.status !== "rejected" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAction(c.claimId, "approve")}
                          disabled={!!processing[c.claimId]}
                          className="px-2 py-0.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                        >
                          {processing[c.claimId] === "approve"
                            ? "…"
                            : "Approve"}
                        </button>
                        <button
                          onClick={() => handleAction(c.claimId, "reject")}
                          disabled={!!processing[c.claimId]}
                          className="px-2 py-0.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
                        >
                          {processing[c.claimId] === "reject" ? "…" : "Reject"}
                        </button>
                      </div>
                    )}
                  </div>
                  {c.fraudReasons?.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5">
                      {c.fraudReasons.map((r, i) => (
                        <li key={i} className="text-xs text-red-600">
                          • {r}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Claims / Policies panel */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {[
                ["claims", "Claims"],
                ["policies", "Policies"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
                    tab === key
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                  {key === "claims" && claims.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 text-xs">
                      {claims.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-16 text-sm text-gray-400">
                Loading…
              </div>
            ) : tab === "claims" ? (
              <>
                {claims.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="w-10 h-10 mx-auto text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400">No claims yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                          <th className="px-4 py-3 text-left">Worker</th>
                          <th className="px-4 py-3 text-left">City</th>
                          <th className="px-4 py-3 text-left">Event</th>
                          <th className="px-4 py-3 text-left">Amount</th>
                          <th className="px-4 py-3 text-left">Fraud %</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {claims.map((c) => (
                          <tr key={c.claimId} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5 font-medium text-gray-800">
                              {c.policy?.workerName ?? "—"}
                            </td>
                            <td className="px-4 py-2.5 text-gray-500">
                              {c.policy?.city ?? "—"}
                            </td>
                            <td className="px-4 py-2.5 text-gray-700">
                              {c.disruptionType}
                            </td>
                            <td className="px-4 py-2.5 font-bold text-gray-800">
                              ₹{c.payoutAmount}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`font-bold ${c.fraudProbability > 0.5 ? "text-red-600" : "text-green-600"}`}
                              >
                                {(c.fraudProbability * 100).toFixed(0)}%
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <StatusBadge status={c.status} />
                            </td>
                            <td className="px-4 py-2.5">
                              {c.status === "pending" ||
                              c.status === "flagged" ? (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() =>
                                      handleAction(c.claimId, "approve")
                                    }
                                    disabled={!!processing[c.claimId]}
                                    className="px-2 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50 transition"
                                  >
                                    {processing[c.claimId] === "approve"
                                      ? "…"
                                      : "✓"}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleAction(c.claimId, "reject")
                                    }
                                    disabled={!!processing[c.claimId]}
                                    className="px-2 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 transition"
                                  >
                                    {processing[c.claimId] === "reject"
                                      ? "…"
                                      : "✗"}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  {c.reviewedAt ? fmt(c.reviewedAt) : "—"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              /* Policies tab */
              <>
                {policies.length === 0 ? (
                  <div className="text-center py-16">
                    <Shield className="w-10 h-10 mx-auto text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400">No policies yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                          <th className="px-4 py-3 text-left">Worker</th>
                          <th className="px-4 py-3 text-left">City</th>
                          <th className="px-4 py-3 text-left">Platform</th>
                          <th className="px-4 py-3 text-left">Premium/wk</th>
                          <th className="px-4 py-3 text-left">Risk</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {policies.map((p) => (
                          <tr key={p.policyId} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5 font-medium text-gray-800">
                              {p.workerName}
                            </td>
                            <td className="px-4 py-2.5 text-gray-500">
                              {p.city}
                            </td>
                            <td className="px-4 py-2.5 text-gray-500">
                              {p.platform}
                            </td>
                            <td className="px-4 py-2.5 font-bold text-gray-800">
                              ₹{p.weeklyPremium}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`text-xs font-bold ${
                                  p.riskCategory === "High"
                                    ? "text-red-600"
                                    : p.riskCategory === "Medium"
                                      ? "text-amber-600"
                                      : "text-green-600"
                                }`}
                              >
                                {p.riskCategory}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  p.status === "confirmed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-gray-400 text-xs">
                              {fmt(p.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {/* Payout by city */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Payout by City
              </h3>
              <CityBarChart claims={claims} />
            </div>

            {/* Pending queue */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                Pending Review
                {pendingClaims.length > 0 && (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                    {pendingClaims.length}
                  </span>
                )}
              </h3>
              {pendingClaims.length === 0 ? (
                <p className="text-sm text-gray-400">No pending claims.</p>
              ) : (
                <div className="space-y-2">
                  {pendingClaims.slice(0, 6).map((c) => (
                    <div
                      key={c.claimId}
                      className="flex items-center justify-between text-sm border border-gray-100 rounded-xl px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {c.policy?.workerName ?? "—"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {c.disruptionType} · ₹{c.payoutAmount}
                        </p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
