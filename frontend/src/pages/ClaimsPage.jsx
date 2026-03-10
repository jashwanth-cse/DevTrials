import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  IndianRupee,
  CloudRain,
  Thermometer,
  Wind,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  approved: {
    cls: "bg-green-100 text-green-700 border-green-200",
    label: "Approved",
  },
  rejected: {
    cls: "bg-red-100 text-red-700 border-red-200",
    label: "Rejected",
  },
  pending: {
    cls: "bg-yellow-100 text-yellow-700 border-yellow-200",
    label: "Pending",
  },
  flagged: {
    cls: "bg-amber-100 text-amber-700 border-amber-200",
    label: "Flagged",
  },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] ?? {
    cls: "bg-gray-100 text-gray-600 border-gray-200",
    label: status,
  };
  const Icon =
    status === "approved"
      ? CheckCircle
      : status === "rejected"
        ? XCircle
        : status === "flagged"
          ? AlertTriangle
          : Clock;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {s.label}
    </span>
  );
};

const fmt = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const eventIcon = (type) => {
  if (!type) return <FileText className="w-4 h-4 text-gray-400" />;
  const t = type.toLowerCase();
  if (t.includes("rain"))
    return <CloudRain className="w-4 h-4 text-blue-500" />;
  if (t.includes("heat"))
    return <Thermometer className="w-4 h-4 text-orange-500" />;
  if (t.includes("pollut")) return <Wind className="w-4 h-4 text-gray-500" />;
  return <FileText className="w-4 h-4 text-gray-400" />;
};

// ─────────────────────────────────────────────────────────────────────────────

const ClaimsPage = () => {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("gigcover_worker");
    if (!stored) {
      navigate("/register");
      return;
    }
    setWorker(JSON.parse(stored));
  }, [navigate]);

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

  if (!worker) return null;

  const filtered = claims.filter((c) => {
    const matchStatus = filter === "all" || c.status === filter;
    const matchSearch =
      !search ||
      c.disruptionType?.toLowerCase().includes(search.toLowerCase()) ||
      c.claimId?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalApprovedPayout = claims
    .filter((c) => c.status === "approved")
    .reduce((s, c) => s + c.payoutAmount, 0);

  const statCards = [
    {
      label: "Total Claims",
      val: claims.length,
      color: "text-gray-800",
      bg: "bg-gray-50",
    },
    {
      label: "Approved",
      val: claims.filter((c) => c.status === "approved").length,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "Pending",
      val: claims.filter((c) => c.status === "pending").length,
      color: "text-yellow-700",
      bg: "bg-yellow-50",
    },
    {
      label: "Total Payout",
      val: `₹${totalApprovedPayout}`,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        worker={{
          name: worker.profile?.name,
          platform: worker.profile?.platform,
          city: worker.profile?.city,
        }}
      />

      <div className="flex-1 ml-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Claims History</h1>
            <p className="text-xs text-gray-400">
              All claims linked to your policy
            </p>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s) => (
              <div
                key={s.label}
                className={`rounded-2xl border border-gray-100 shadow-sm p-4 ${s.bg}`}
              >
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  {s.label}
                </p>
                <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* Filters + search */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-gray-100">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Search by type or claim ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {/* Status filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-gray-400" />
                {["all", "approved", "pending", "flagged", "rejected"].map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filter === f
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-14 text-sm text-gray-400">
                Loading claims…
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-14">
                <FileText className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">
                  {claims.length === 0
                    ? "No claims yet. Simulate a disruption from the Policy page."
                    : "No claims match your filter."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-5 py-3 text-left">Date</th>
                      <th className="px-5 py-3 text-left">Claim ID</th>
                      <th className="px-5 py-3 text-left">Disruption Type</th>
                      <th className="px-5 py-3 text-left">Severity</th>
                      <th className="px-5 py-3 text-left">Status</th>
                      <th className="px-5 py-3 text-right">Payout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((c) => (
                      <tr
                        key={c.claimId}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                          {fmt(c.createdAt)}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-gray-600">
                          {c.claimId}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            {eventIcon(c.disruptionType)}
                            <span className="font-medium text-gray-800">
                              {c.disruptionType}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          {c.severityScore?.toFixed(2)}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span
                            className={`font-bold ${c.status === "approved" ? "text-green-600" : "text-gray-400"}`}
                          >
                            {c.status === "approved"
                              ? `₹${c.payoutAmount}`
                              : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer summary */}
            {filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                <span>
                  {filtered.length} claim{filtered.length !== 1 ? "s" : ""}{" "}
                  shown
                </span>
                <span>
                  Total approved payout:{" "}
                  <span className="font-bold text-green-600">
                    ₹{totalApprovedPayout}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Fraud warnings (if any flagged claims) */}
          {claims.filter((c) => c.status === "flagged").length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-amber-800">
                  Flagged Claims — Pending Review
                </h3>
              </div>
              <div className="space-y-3">
                {claims
                  .filter((c) => c.status === "flagged")
                  .map((c) => (
                    <div
                      key={c.claimId}
                      className="bg-white border border-amber-100 rounded-xl p-3 text-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {c.claimId}
                          </p>
                          <p className="text-gray-500">
                            {c.disruptionType} · {fmt(c.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-amber-700 font-semibold">
                            Fraud Score: {c.fraudProbability?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {c.fraudReasons?.length > 0 && (
                        <ul className="mt-2 space-y-0.5">
                          {c.fraudReasons.map((r, i) => (
                            <li key={i} className="text-xs text-amber-700">
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
        </div>
      </div>
    </div>
  );
};

export default ClaimsPage;
