import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ShieldCheck,
  CloudRain,
  Thermometer,
  Wind,
  Car,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Bell,
  TrendingUp,
  Zap,
  IndianRupee,
  MapPin,
  Briefcase,
  User,
  RefreshCw,
  Activity,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

// ── Helpers ───────────────────────────────────────────────────────────────────

const riskColor = (cat) =>
  cat === "High"
    ? "text-red-600 bg-red-50 border-red-200"
    : cat === "Medium"
      ? "text-yellow-600 bg-yellow-50 border-yellow-200"
      : "text-green-600 bg-green-50 border-green-200";

const riskBarColor = (cat) =>
  cat === "High"
    ? "bg-red-500"
    : cat === "Medium"
      ? "bg-yellow-400"
      : "bg-green-500";

const statusStyle = (status) => {
  const map = {
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    flagged: "bg-amber-100 text-amber-700 border-amber-200",
  };
  return map[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
};

const StatusIcon = ({ status }) => {
  if (status === "approved") return <CheckCircle className="w-3.5 h-3.5" />;
  if (status === "rejected") return <XCircle className="w-3.5 h-3.5" />;
  if (status === "flagged") return <AlertTriangle className="w-3.5 h-3.5" />;
  return <Clock className="w-3.5 h-3.5" />;
};

const fmt = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// ── Mini bar chart (CSS) ──────────────────────────────────────────────────────
const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-t-sm bg-blue-500 transition-all"
            style={{ height: `${(d.value / max) * 52}px` }}
          />
          <span className="text-[10px] text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Condition pill ────────────────────────────────────────────────────────────
const ConditionPill = ({ icon: Icon, label, value, color }) => (
  <div
    className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${color} text-sm font-medium`}
  >
    <Icon className="w-4 h-4 shrink-0" />
    <span className="text-gray-500 text-xs">{label}</span>
    <span className="font-bold ml-auto">{value}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loadingClaims, setLoading] = useState(true);
  const [notifications, setNotifs] = useState([]);

  // Live environment data state
  const [liveEnv, setLiveEnv] = useState(null);
  const [liveEnvLoading, setLiveEnvLoading] = useState(false);
  const [liveEnvError, setLiveEnvError] = useState(null);
  const [liveEnvUpdatedAt, setLiveEnvUpdatedAt] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);

  // Load worker from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("gigcover_worker");
    if (!stored) {
      navigate("/register");
      return;
    }
    const data = JSON.parse(stored);
    setWorker(data);

    // Build notifications from latest simulation result
    const notifs = [];
    if (data.lastSimulation) {
      const sim = data.lastSimulation;
      if (sim.claimCreated) {
        notifs.push({
          type: "info",
          msg: `${sim.disruption?.disruptionType} detected in ${data.profile?.city}.`,
        });
        notifs.push({
          type: "success",
          msg: `Claim triggered automatically — ${sim.claim?.claimId}.`,
        });
        if (sim.claim?.status === "approved")
          notifs.push({
            type: "success",
            msg: `Payout ₹${sim.claim?.payoutAmount} initiated.`,
          });
        if (sim.claim?.status === "flagged")
          notifs.push({
            type: "warning",
            msg: `Claim flagged for review. Fraud score: ${sim.fraudCheck?.fraudProbability}.`,
          });
      }
    }
    setNotifs(notifs);
  }, [navigate]);

  // Fetch worker's claims
  useEffect(() => {
    if (!worker?.policy?.policyId) {
      setLoading(false);
      return;
    }
    axios
      .get(`http://localhost:5000/api/worker/claims/${worker.policy.policyId}`)
      .then((r) => setClaims(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [worker]);

  // Fetch live environment data from backend
  const fetchLiveEnv = async (city) => {
    if (!city) return;
    setLiveEnvLoading(true);
    setLiveEnvError(null);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/environment-data?city=${encodeURIComponent(city)}`,
      );
      setLiveEnv(data);
      setLiveEnvUpdatedAt(new Date());
      setAiAnalysis(null); // reset stale AI result on refresh
    } catch {
      setLiveEnvError("Could not fetch live data.");
    } finally {
      setLiveEnvLoading(false);
    }
  };

  // Auto-refresh live environment data every 30s
  useEffect(() => {
    if (!worker?.profile?.city) return;
    fetchLiveEnv(worker.profile.city);
    const interval = setInterval(
      () => fetchLiveEnv(worker.profile.city),
      30_000,
    );
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worker?.profile?.city]);

  // Run AI disruption analysis on current live data
  const runAiAnalysis = async () => {
    if (!liveEnv) return;
    setAiAnalysisLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:8000/detect-disruption",
        {
          city: liveEnv.city,
          rainfall: liveEnv.rainfall,
          temperature: liveEnv.temperature,
          aqi: liveEnv.aqi,
          trafficIndex: liveEnv.trafficIndex,
          curfewActive: false,
        },
      );
      setAiAnalysis(data);
    } catch {
      setAiAnalysis({ error: "AI service unavailable." });
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  if (!worker) return null;

  const { profile, policy, lastSimulation } = worker;

  const totalCompensation = claims
    .filter((c) => c.status === "approved")
    .reduce((sum, c) => sum + c.payoutAmount, 0);

  const riskPct = policy?.riskScore ? Math.round(policy.riskScore * 100) : 0;

  // Last 5 week claim chart
  const chartData = [
    { label: "W-4", value: 0 },
    { label: "W-3", value: 0 },
    { label: "W-2", value: 0 },
    {
      label: "W-1",
      value: claims.filter((c) => c.status === "approved").length,
    },
    { label: "Now", value: totalCompensation },
  ];

  const weather = lastSimulation?.weatherConditions;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        worker={{
          name: profile?.name,
          platform: profile?.platform,
          city: profile?.city,
        }}
      />

      {/* Main content */}
      <div className="flex-1 ml-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Worker Dashboard
            </h1>
            <p className="text-xs text-gray-400">
              GigCover Parametric Insurance
            </p>
          </div>
          <div className="flex items-center gap-3">
            {notifications.length > 0 && (
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              </div>
            )}
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {profile?.name?.[0] ?? "W"}
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* ── Notifications ── */}
          {notifications.length > 0 && (
            <div className="space-y-2">
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
                    n.type === "success"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : n.type === "warning"
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-blue-50 border-blue-200 text-blue-800"
                  }`}
                >
                  {n.type === "success" ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : n.type === "warning" ? (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  ) : (
                    <Bell className="w-4 h-4 shrink-0" />
                  )}
                  {n.msg}
                </div>
              ))}
            </div>
          )}

          {/* ── Top row: Profile + Policy + Risk ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                  {profile?.name?.[0] ?? "W"}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">{profile?.name}</h2>
                  <p className="text-xs text-gray-400">
                    Gig Worker · {policy?.city}
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>
                    {policy?.city} · {profile?.zoneType}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span>{profile?.platform}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <IndianRupee className="w-4 h-4 text-gray-400" />
                  <span>Avg Income ₹{profile?.dailyIncome}/day</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-mono text-xs">{policy?.policyId}</span>
                </div>
              </div>
            </div>

            {/* Policy Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-sm p-5 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  Policy Details
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                    policy?.status === "confirmed"
                      ? "bg-green-500/20 text-green-300 border-green-500/30"
                      : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                  }`}
                >
                  {policy?.status === "confirmed" ? "✓ Active" : "Pending"}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-gray-400 text-sm">Weekly Premium</span>
                  <span className="text-2xl font-black text-white">
                    ₹{policy?.weeklyPremium}
                    <span className="text-sm text-gray-400 font-normal">
                      /wk
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Coverage Amount</span>
                  <span className="font-bold text-white">
                    ₹{policy?.coverageAmount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Platform</span>
                  <span className="font-semibold text-white">
                    {profile?.platform}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Zone</span>
                  <span className="font-semibold text-white">
                    {profile?.zoneType}
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Indicator */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Risk Indicator
              </h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Risk Score</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${riskColor(policy?.riskCategory)}`}
                >
                  {policy?.riskCategory ?? "—"} Risk
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${riskBarColor(policy?.riskCategory)}`}
                  style={{ width: `${riskPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-4">
                <span>0</span>
                <span className="font-mono font-bold text-gray-700">
                  {policy?.riskScore?.toFixed(2)}
                </span>
                <span>1.0</span>
              </div>

              {/* Claim stats mini */}
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  {
                    label: "Total",
                    val: claims.length,
                    color: "text-gray-800",
                  },
                  {
                    label: "Approved",
                    val: claims.filter((c) => c.status === "approved").length,
                    color: "text-green-600",
                  },
                  {
                    label: "Flagged",
                    val: claims.filter((c) => c.status === "flagged").length,
                    color: "text-amber-600",
                  },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-xl py-2">
                    <p className={`text-lg font-black ${s.color}`}>{s.val}</p>
                    <p className="text-[10px] text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Mid row: Disruption monitor + Claims summary + Payout chart ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Disruption Monitor */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 flex-1">
                  Disruption Monitor
                </h3>
                {/* Source badge */}
                {liveEnv && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      liveEnv.source === "live"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : liveEnv.source === "partial"
                          ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                          : "bg-gray-100 border-gray-200 text-gray-500"
                    }`}
                  >
                    {liveEnv.source === "live"
                      ? "● LIVE"
                      : liveEnv.source === "partial"
                        ? "◑ PARTIAL"
                        : "○ CACHED"}
                  </span>
                )}
                {/* Manual refresh */}
                <button
                  onClick={() => fetchLiveEnv(profile?.city)}
                  disabled={liveEnvLoading}
                  title="Refresh now"
                  className="p-1 rounded-lg hover:bg-gray-100 transition disabled:opacity-40"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-gray-400 ${liveEnvLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              {/* Last updated */}
              {liveEnvUpdatedAt && (
                <p className="text-[10px] text-gray-400 mb-3">
                  Updated{" "}
                  {liveEnvUpdatedAt.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                  {" · "}auto-refreshes every 30s
                </p>
              )}

              {/* Loading skeleton */}
              {liveEnvLoading && !liveEnv && (
                <div className="space-y-2 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-xl" />
                  ))}
                </div>
              )}

              {/* Error state — fall back to sim data if available */}
              {liveEnvError && !liveEnv && (
                <p className="text-xs text-red-500 mb-2">{liveEnvError}</p>
              )}

              {/* Condition pills — prefer live data, fall back to lastSimulation */}
              {(liveEnv || weather) && !liveEnvLoading && (
                <div className="space-y-2">
                  {liveEnv?.scenario && (
                    <div className="text-xs text-gray-500 mb-3 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                      📍 {liveEnv.scenario}
                    </div>
                  )}
                  {!liveEnv && weather?.scenario && (
                    <div className="text-xs text-gray-500 mb-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      📍 {weather.scenario}{" "}
                      <span className="text-gray-400">(simulation)</span>
                    </div>
                  )}
                  <ConditionPill
                    icon={CloudRain}
                    label="Rainfall"
                    value={`${(liveEnv ?? weather).rainfall} mm`}
                    color="bg-blue-50 border-blue-200 text-blue-800"
                  />
                  <ConditionPill
                    icon={Thermometer}
                    label="Temperature"
                    value={`${(liveEnv ?? weather).temperature}°C`}
                    color="bg-orange-50 border-orange-200 text-orange-800"
                  />
                  <ConditionPill
                    icon={Wind}
                    label="AQI"
                    value={(liveEnv ?? weather).aqi}
                    color="bg-gray-50 border-gray-200 text-gray-800"
                  />
                  <ConditionPill
                    icon={Car}
                    label="Traffic"
                    value={(liveEnv ?? weather).trafficIndex}
                    color="bg-purple-50 border-purple-200 text-purple-800"
                  />
                </div>
              )}

              {/* Empty state */}
              {!liveEnv && !weather && !liveEnvLoading && (
                <div className="text-center py-6 text-sm text-gray-400">
                  <CloudRain className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  No data yet.
                  <br />
                  <Link
                    to="/policy"
                    className="text-blue-500 hover:underline text-xs mt-1 inline-block"
                  >
                    Run a simulation from Policy page →
                  </Link>
                </div>
              )}

              {/* AI Analyse button */}
              {(liveEnv || weather) && !liveEnvLoading && (
                <button
                  onClick={runAiAnalysis}
                  disabled={aiAnalysisLoading}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl py-2 transition"
                >
                  <Activity className="w-3.5 h-3.5" />
                  {aiAnalysisLoading ? "Analysing…" : "AI Disruption Analysis"}
                </button>
              )}

              {/* AI Analysis result */}
              {aiAnalysis && !aiAnalysis.error && (
                <div
                  className={`mt-3 rounded-xl border p-3 text-xs space-y-1 ${
                    aiAnalysis.disruptionDetected
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-green-50 border-green-200 text-green-800"
                  }`}
                >
                  <p className="font-bold">
                    {aiAnalysis.disruptionDetected
                      ? `⚠ ${aiAnalysis.disruptionType}`
                      : "✓ No Major Disruption Detected"}
                  </p>
                  {aiAnalysis.reason && (
                    <p className="text-[11px] opacity-80">
                      {aiAnalysis.reason}
                    </p>
                  )}
                  {aiAnalysis.severityScore !== undefined && (
                    <p>
                      Severity:{" "}
                      <span className="font-semibold">
                        {Math.round(aiAnalysis.severityScore * 100)}%
                      </span>
                    </p>
                  )}
                  {aiAnalysis.triggerPayout && (
                    <p className="font-semibold text-red-700">
                      → Payout threshold met. Go to Policy to file a claim.
                    </p>
                  )}
                </div>
              )}
              {aiAnalysis?.error && (
                <p className="mt-2 text-xs text-red-500">{aiAnalysis.error}</p>
              )}
            </div>

            {/* Claim Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Claim Statistics</h3>
              <div className="space-y-3">
                {[
                  {
                    label: "Total Claims",
                    val: claims.length,
                    icon: FileText,
                    color: "text-gray-700",
                    bg: "bg-gray-100",
                  },
                  {
                    label: "Approved",
                    val: claims.filter((c) => c.status === "approved").length,
                    icon: CheckCircle,
                    color: "text-green-700",
                    bg: "bg-green-100",
                  },
                  {
                    label: "Flagged / Rejected",
                    val: claims.filter((c) =>
                      ["flagged", "rejected"].includes(c.status),
                    ).length,
                    icon: XCircle,
                    color: "text-red-700",
                    bg: "bg-red-100",
                  },
                  {
                    label: "Total Compensation",
                    val: `₹${totalCompensation}`,
                    icon: IndianRupee,
                    color: "text-blue-700",
                    bg: "bg-blue-100",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}
                    >
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <span className="text-sm text-gray-600 flex-1">
                      {stat.label}
                    </span>
                    <span className={`text-sm font-bold ${stat.color}`}>
                      {stat.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payout Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-900">Payout Trend</h3>
              </div>
              <MiniBarChart data={chartData} />
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                <span>Lifetime payout</span>
                <span className="font-bold text-green-600">
                  ₹{totalCompensation}
                </span>
              </div>
            </div>
          </div>

          {/* ── Recent Claims Table ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Recent Claims</h3>
              <Link
                to="/claims"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                View all →
              </Link>
            </div>
            {loadingClaims ? (
              <div className="text-center py-10 text-sm text-gray-400">
                Loading…
              </div>
            ) : claims.length === 0 ? (
              <div className="text-center py-10">
                <ShieldCheck className="w-10 h-10 mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">
                  No claims yet. Simulate a disruption to see one here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-5 py-3 text-left">Date</th>
                      <th className="px-5 py-3 text-left">Disruption Type</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-right">Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {claims.slice(0, 5).map((c) => (
                      <tr
                        key={c.claimId}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                          {fmt(c.createdAt)}
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-800">
                          {c.disruptionType}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyle(c.status)}`}
                          >
                            <StatusIcon status={c.status} />
                            {c.status.charAt(0).toUpperCase() +
                              c.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-gray-800">
                          ₹{c.payoutAmount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Activity Timeline ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Activity Timeline</h3>
            {claims.length === 0 && !policy?.createdAt ? (
              <p className="text-sm text-gray-400">No activity yet.</p>
            ) : (
              <ol className="relative border-l border-gray-200 space-y-4 ml-3">
                {policy?.createdAt && (
                  <li className="ml-4">
                    <span className="absolute -left-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                    <p className="text-xs text-gray-400">
                      {fmt(policy.createdAt)}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      Policy Created
                    </p>
                    <p className="text-xs text-gray-500">{policy.policyId}</p>
                  </li>
                )}
                {policy?.activatedAt && (
                  <li className="ml-4">
                    <span className="absolute -left-1.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    <p className="text-xs text-gray-400">
                      {fmt(policy.activatedAt)}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      Policy Activated
                    </p>
                    <p className="text-xs text-gray-500">
                      Coverage of ₹{policy.coverageAmount} confirmed
                    </p>
                  </li>
                )}
                {claims.map((c) => (
                  <li key={c.claimId} className="ml-4">
                    <span
                      className={`absolute -left-1.5 w-3 h-3 rounded-full border-2 border-white ${
                        c.status === "approved"
                          ? "bg-green-400"
                          : c.status === "flagged"
                            ? "bg-amber-400"
                            : "bg-gray-300"
                      }`}
                    />
                    <p className="text-xs text-gray-400">{fmt(c.createdAt)}</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {c.status === "approved"
                        ? "Claim Approved"
                        : c.status === "flagged"
                          ? "Claim Flagged"
                          : "Claim Filed"}
                      {" — "}
                      {c.disruptionType}
                    </p>
                    <p className="text-xs text-gray-500">
                      Payout ₹{c.payoutAmount}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
