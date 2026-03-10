import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Calendar,
  IndianRupee,
  BarChart2,
  CheckCircle,
  Clock,
  MapPin,
  Briefcase,
  User,
  CloudRain,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

const PolicyPage = () => {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("gigcover_worker");
    if (!stored) {
      navigate("/register");
      return;
    }
    setWorker(JSON.parse(stored));
  }, [navigate]);

  if (!worker) return null;

  const { profile, policy } = worker;

  const handleCopy = () => {
    navigator.clipboard.writeText(policy?.policyId ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const riskColor =
    policy?.riskCategory === "High"
      ? "text-red-600 bg-red-50 border-red-200"
      : policy?.riskCategory === "Medium"
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : "text-green-600 bg-green-50 border-green-200";

  const riskBarWidth = policy?.riskScore
    ? `${Math.round(policy.riskScore * 100)}%`
    : "0%";

  const riskBarColor =
    policy?.riskCategory === "High"
      ? "bg-red-500"
      : policy?.riskCategory === "Medium"
        ? "bg-amber-400"
        : "bg-green-500";

  const fmt = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "—";

  const DetailRow = ({ icon: Icon, label, value, mono = false }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <span
        className={`text-sm font-semibold text-gray-800 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );

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
            <h1 className="text-lg font-bold text-gray-900">My Policy</h1>
            <p className="text-xs text-gray-400">
              Your active GigCover insurance plan
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              policy?.status === "confirmed"
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-gray-100 text-gray-500 border-gray-200"
            }`}
          >
            {policy?.status === "confirmed" ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" /> Active
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" /> Pending
              </>
            )}
          </span>
        </header>

        <div className="p-6 max-w-3xl mx-auto space-y-6">
          {/* Hero policy card */}
          <div className="rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">
                    Policy Holder
                  </p>
                  <h2 className="text-2xl font-black">
                    {profile?.name ?? "—"}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {profile?.platform} · {profile?.city}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-blue-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                    Weekly Premium
                  </p>
                  <p className="text-2xl font-black">
                    ₹{policy?.weeklyPremium ?? "—"}
                  </p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                    Daily Coverage
                  </p>
                  <p className="text-2xl font-black">
                    ₹{policy?.coverageAmount ?? "—"}
                  </p>
                </div>
              </div>

              {/* Policy ID row */}
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Policy ID</p>
                  <p className="font-mono text-sm text-white">
                    {policy?.policyId ?? "—"}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-gray-300 transition-all"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* Risk indicator */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-500" />
              AI Risk Assessment
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Risk Score</span>
              <span
                className={`text-sm font-bold px-2 py-0.5 rounded-full border ${riskColor}`}
              >
                {policy?.riskCategory ?? "—"}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-1">
              <div
                className={`h-3 rounded-full transition-all ${riskBarColor}`}
                style={{ width: riskBarWidth }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Low Risk</span>
              <span className="font-bold text-gray-700">{riskBarWidth}</span>
              <span>High Risk</span>
            </div>
          </div>

          {/* Policy details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              Policy Details
            </h3>
            <DetailRow icon={User} label="Name" value={profile?.name ?? "—"} />
            <DetailRow
              icon={MapPin}
              label="City"
              value={profile?.city ?? "—"}
            />
            <DetailRow
              icon={Briefcase}
              label="Platform"
              value={profile?.platform ?? "—"}
            />
            <DetailRow
              icon={IndianRupee}
              label="Daily Income"
              value={profile?.dailyIncome ? `₹${profile.dailyIncome}` : "—"}
            />
            <DetailRow
              icon={Calendar}
              label="Created"
              value={fmt(policy?.createdAt)}
            />
            <DetailRow
              icon={CheckCircle}
              label="Activated"
              value={fmt(policy?.activatedAt)}
            />
            <DetailRow
              icon={ShieldCheck}
              label="Zone Type"
              value={profile?.zoneType ?? "—"}
            />
          </div>

          {/* What's covered */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">What's Covered</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: "🌧️",
                  label: "Heavy Rainfall",
                  desc: "Auto-payout on >80mm/hr",
                },
                {
                  icon: "🌡️",
                  label: "Heatwave",
                  desc: "Auto-payout above 42°C",
                },
                {
                  icon: "💨",
                  label: "Air Pollution",
                  desc: "Triggered at AQI > 350",
                },
                {
                  icon: "🚗",
                  label: "Traffic Jam",
                  desc: "Extreme congestion events",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <span className="text-xl leading-none mt-0.5">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            <Link
              to="/claims"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
            >
              View My Claims <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPage;
