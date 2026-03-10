import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  CloudRain,
  Thermometer,
  Wind,
  Car,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

const fmt = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const disruptionIcon = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("rain"))
    return <CloudRain className="w-5 h-5 text-blue-500" />;
  if (t.includes("heat"))
    return <Thermometer className="w-5 h-5 text-orange-500" />;
  if (t.includes("pollut")) return <Wind className="w-5 h-5 text-gray-500" />;
  if (t.includes("traffic")) return <Car className="w-5 h-5 text-yellow-500" />;
  return <AlertTriangle className="w-5 h-5 text-amber-500" />;
};

const claimStatusStyle = (status) =>
  ({
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    flagged: "bg-amber-100 text-amber-700 border-amber-200",
  })[status] ?? "bg-gray-100 text-gray-500 border-gray-200";

const AlertsPage = () => {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const { profile, policy, lastSimulation } = worker;

  // Build system alerts from data
  const systemAlerts = [];

  if (policy?.status === "confirmed") {
    systemAlerts.push({
      id: "policy-active",
      type: "success",
      icon: ShieldCheck,
      title: "Policy Active",
      msg: `Your policy ${policy.policyId} is active and monitoring disruptions in ${profile?.city}.`,
      time: policy.activatedAt,
    });
  } else {
    systemAlerts.push({
      id: "policy-pending",
      type: "warning",
      icon: Clock,
      title: "Policy Not Activated",
      msg: "Your policy has not been activated yet. Go to the Quote page to activate it.",
      time: policy?.createdAt,
    });
  }

  if (lastSimulation?.claimCreated) {
    const sim = lastSimulation;
    systemAlerts.push({
      id: "sim-disruption",
      type: "info",
      icon: disruptionIcon(sim.disruption?.disruptionType),
      useElement: true,
      title: `Disruption Detected: ${sim.disruption?.disruptionType}`,
      msg: `Severity score ${sim.disruption?.severityScore}. A claim was automatically created on your behalf.`,
      time: sim.claim?.createdAt,
    });

    if (sim.claim?.status === "approved") {
      systemAlerts.push({
        id: "sim-payout",
        type: "success",
        icon: CheckCircle,
        title: "Payout Initiated",
        msg: `₹${sim.claim?.payoutAmount} payout approved for claim ${sim.claim?.claimId}.`,
        time: sim.claim?.createdAt,
      });
    }

    if (sim.claim?.status === "flagged") {
      systemAlerts.push({
        id: "sim-flagged",
        type: "warning",
        icon: AlertTriangle,
        title: "Claim Under Review",
        msg: `Claim ${sim.claim?.claimId} was flagged for manual review. Fraud score: ${(sim.fraudCheck?.fraudProbability * 100 ?? 0).toFixed(0)}%.`,
        time: sim.claim?.createdAt,
      });
      if (sim.fraudCheck?.reasons?.length) {
        systemAlerts.push({
          id: "sim-fraud-reasons",
          type: "danger",
          icon: XCircle,
          title: "Fraud Check Flags",
          msg: sim.fraudCheck.reasons.join(" · "),
          time: sim.claim?.createdAt,
        });
      }
    }
  }

  const alertStyle = (type) =>
    ({
      success: {
        bar: "bg-green-500",
        pill: "bg-green-50 border-green-200",
        icon: "text-green-500",
      },
      info: {
        bar: "bg-blue-500",
        pill: "bg-blue-50 border-blue-200",
        icon: "text-blue-500",
      },
      warning: {
        bar: "bg-amber-500",
        pill: "bg-amber-50 border-amber-200",
        icon: "text-amber-500",
      },
      danger: {
        bar: "bg-red-500",
        pill: "bg-red-50 border-red-200",
        icon: "text-red-500",
      },
    })[type] ?? {
      bar: "bg-gray-400",
      pill: "bg-gray-50 border-gray-200",
      icon: "text-gray-500",
    };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        worker={{
          name: profile?.name,
          platform: profile?.platform,
          city: profile?.city,
        }}
      />

      <div className="flex-1 ml-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Alerts &amp; Notifications
            </h1>
            <p className="text-xs text-gray-400">
              Your policy and disruption activity
            </p>
          </div>
          {systemAlerts.length > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              <Bell className="w-3.5 h-3.5" />
              {systemAlerts.length} alert{systemAlerts.length !== 1 ? "s" : ""}
            </span>
          )}
        </header>

        <div className="p-6 max-w-3xl mx-auto space-y-6">
          {/* System alerts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-gray-800">System Alerts</h3>
            </div>
            {systemAlerts.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-400">
                No alerts yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {systemAlerts.map((alert) => {
                  const s = alertStyle(alert.type);
                  const IconComponent = alert.useElement ? null : alert.icon;
                  return (
                    <div
                      key={alert.id}
                      className="flex gap-4 px-5 py-4 hover:bg-gray-50 transition"
                    >
                      <div
                        className={`w-1 rounded-full self-stretch ${s.bar} shrink-0`}
                      />
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${s.pill}`}
                      >
                        {alert.useElement ? (
                          alert.icon
                        ) : (
                          <IconComponent className={`w-5 h-5 ${s.icon}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">
                          {alert.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {alert.msg}
                        </p>
                        {alert.time && (
                          <p className="text-xs text-gray-400 mt-1">
                            {fmt(alert.time)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Live disruption conditions (if last simulation exists) */}
          {lastSimulation?.weatherConditions && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-500" />
                Last Monitored Conditions · {profile?.city}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    icon: CloudRain,
                    label: "Rainfall",
                    value: `${lastSimulation.weatherConditions.rainfall} mm`,
                    color: "bg-blue-50 border-blue-200 text-blue-700",
                  },
                  {
                    icon: Thermometer,
                    label: "Temperature",
                    value: `${lastSimulation.weatherConditions.temperature}°C`,
                    color: "bg-orange-50 border-orange-200 text-orange-700",
                  },
                  {
                    icon: Wind,
                    label: "AQI",
                    value: lastSimulation.weatherConditions.aqi,
                    color: "bg-gray-50 border-gray-200 text-gray-700",
                  },
                  {
                    icon: Car,
                    label: "Traffic",
                    value:
                      (
                        lastSimulation.weatherConditions.trafficIndex * 100
                      ).toFixed(0) + "%",
                    color: "bg-yellow-50 border-yellow-200 text-yellow-700",
                  },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div
                    key={label}
                    className={`rounded-xl p-3 border ${color} flex flex-col gap-1`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-medium opacity-80">
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </div>
                    <p className="text-lg font-black">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent claims as an alert feed */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Claim Activity</h3>
              <Link
                to="/claims"
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {loading ? (
              <div className="text-center py-8 text-sm text-gray-400">
                Loading…
              </div>
            ) : claims.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">
                No claims yet. Simulate a disruption from your Policy page.
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {claims.slice(0, 8).map((c) => (
                  <div
                    key={c.claimId}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      {disruptionIcon(c.disruptionType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {c.disruptionType}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {c.claimId}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${claimStatusStyle(c.status)}`}
                      >
                        {c.status?.charAt(0).toUpperCase() + c.status?.slice(1)}
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fmt(c.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
