import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ShieldCheck,
  ArrowRight,
  Home,
  CloudLightning,
  BadgeIndianRupee,
  CheckCircle,
  Loader2,
  CloudRain,
  Zap,
  IndianRupee,
} from "lucide-react";

const PremiumPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const premiumData = location.state?.premiumData;
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [activateError, setActivateError] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [simError, setSimError] = useState(null);

  useEffect(() => {
    // Redirect if no data is present (e.g. user navigated directly to this URL)
    if (!premiumData) {
      navigate("/register");
    }
  }, [premiumData, navigate]);

  if (!premiumData) return null; // Prevent rendering during redirect

  const saveToLocalStorage = (overrides = {}) => {
    const existing = JSON.parse(
      localStorage.getItem("gigcover_worker") ?? "{}",
    );
    const updated = {
      profile: {
        name: premiumData.workerName,
        city: premiumData.city,
        platform: premiumData.platform,
        dailyIncome: premiumData.dailyIncome,
        zoneType: premiumData.zoneType,
      },
      policy: {
        policyId: premiumData.policyId,
        riskScore: premiumData.riskScore,
        riskCategory: premiumData.riskCategory,
        weeklyPremium: premiumData.weeklyPremium,
        coverageAmount: premiumData.dailyCoverage,
        status: "confirmed",
        createdAt: existing.policy?.createdAt ?? new Date().toISOString(),
        activatedAt: new Date().toISOString(),
      },
      lastSimulation: existing.lastSimulation ?? null,
      ...overrides,
    };
    localStorage.setItem("gigcover_worker", JSON.stringify(updated));
  };

  const handleSimulateDisruption = async () => {
    if (simulating) return;
    setSimulating(true);
    setSimError(null);
    setSimulationResult(null);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/simulate-disruption",
        { policyId: premiumData.policyId },
      );
      setSimulationResult(response.data);
      // Persist last simulation for dashboard display
      const existing = JSON.parse(
        localStorage.getItem("gigcover_worker") ?? "{}",
      );
      if (existing.profile) {
        saveToLocalStorage({ lastSimulation: response.data });
      }
    } catch (err) {
      setSimError("Simulation failed. Make sure both servers are running.");
    } finally {
      setSimulating(false);
    }
  };

  const handleActivate = async () => {
    if (activated || activating) return;
    setActivating(true);
    setActivateError(null);
    try {
      await axios.patch(
        `http://localhost:5000/api/policy/${premiumData.policyId}/activate`,
      );
      saveToLocalStorage();
      setActivated(true);
    } catch (err) {
      setActivateError("Failed to activate policy. Please try again.");
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-gray-50 overflow-hidden pt-24">
      {/* Decorative background vectors */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>

      <div className="w-full max-w-2xl z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6 border-4 border-white shadow-lg">
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Your Custom Coverage
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Based on your profile, our AI has calculated the optimal protective
            premium for your gig income.
          </p>
        </div>

        {/* Results Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://api.dicebear.com/7.x/shapes/svg?seed=GigCoverRisk')] bg-cover"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left">
              <div>
                <p className="text-gray-400 font-medium tracking-wide text-sm uppercase mb-1">
                  Policy Quote for
                </p>
                <h2 className="text-3xl font-bold">{premiumData.workerName}</h2>
                <p className="text-gray-400 mt-2 text-sm">
                  Policy ID:{" "}
                  <span className="text-white font-mono">
                    {premiumData.policyId}
                  </span>
                </p>
                {premiumData.riskScore && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium border border-blue-500/30">
                      AI Risk Score:{" "}
                      {premiumData.riskScore.toFixed
                        ? premiumData.riskScore.toFixed(2)
                        : premiumData.riskScore}
                    </div>
                    {premiumData.riskCategory && (
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                          premiumData.riskCategory === "High"
                            ? "bg-red-500/20 text-red-300 border-red-500/30"
                            : premiumData.riskCategory === "Medium"
                              ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                              : "bg-green-500/20 text-green-300 border-green-500/30"
                        }`}
                      >
                        {premiumData.riskCategory} Risk
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 md:mt-0 text-right">
                <p className="text-gray-400 font-medium tracking-wide text-sm uppercase mb-1">
                  Weekly Premium
                </p>
                <div className="flex items-end justify-center md:justify-end gap-1">
                  <span className="text-5xl font-black text-white">
                    ₹{premiumData.weeklyPremium}
                  </span>
                  <span className="text-gray-400 mb-1">/ wk</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <CloudLightning className="w-5 h-5 text-accent-500 mr-2" />
              Coverage Benefits
            </h3>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-start">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 shrink-0">
                  <BadgeIndianRupee className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    ₹{premiumData.dailyCoverage} Daily Payout
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Automatically deposited if heavy rain or civic curfews hit
                    your working zone.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-start">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Zero Claim Forms
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Parametric triggers mean we monitor the index and pay out
                    automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Disruption Simulation Panel ── */}
            <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Parametric Insurance Demo
              </h3>

              {simulationResult ? (
                simulationResult.claimCreated ? (
                  <div className="space-y-3">
                    {/* Scenario banner */}
                    {simulationResult.weatherConditions?.scenario && (
                      <div className="rounded-lg bg-blue-100 border border-blue-200 px-3 py-2 text-xs text-blue-800 font-medium">
                        📍 {simulationResult.weatherConditions.scenario}
                      </div>
                    )}

                    {/* Live weather readings */}
                    {simulationResult.weatherConditions && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-white border border-blue-100 rounded-full px-2.5 py-1 text-gray-700 font-medium">
                          🌧 {simulationResult.weatherConditions.rainfall} mm
                        </span>
                        <span className="bg-white border border-orange-100 rounded-full px-2.5 py-1 text-gray-700 font-medium">
                          🌡 {simulationResult.weatherConditions.temperature}°C
                        </span>
                        <span className="bg-white border border-gray-200 rounded-full px-2.5 py-1 text-gray-700 font-medium">
                          💨 AQI {simulationResult.weatherConditions.aqi}
                        </span>
                        <span className="bg-white border border-gray-200 rounded-full px-2.5 py-1 text-gray-700 font-medium">
                          🚗 Traffic{" "}
                          {simulationResult.weatherConditions.trafficIndex}
                        </span>
                      </div>
                    )}

                    {/* Claim status banner */}
                    {simulationResult.claim.status === "flagged" ? (
                      <div className="flex items-center gap-2 text-amber-700 font-semibold">
                        <Zap className="w-5 h-5 text-amber-500" />
                        Claim Flagged for Manual Review
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-700 font-semibold">
                        <CheckCircle className="w-5 h-5" />
                        Claim Auto-Created — No forms needed!
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white rounded-xl p-3 border border-green-100">
                        <p className="text-gray-500 text-xs uppercase mb-1">
                          Disruption Type
                        </p>
                        <p className="font-bold text-gray-800 flex items-center gap-1">
                          <CloudRain className="w-4 h-4 text-blue-500" />
                          {simulationResult.disruption.disruptionType}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-green-100">
                        <p className="text-gray-500 text-xs uppercase mb-1">
                          Severity Score
                        </p>
                        <p className="font-bold text-gray-800">
                          {simulationResult.disruption.severityScore}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-green-100">
                        <p className="text-gray-500 text-xs uppercase mb-1">
                          Claim ID
                        </p>
                        <p className="font-mono text-xs text-gray-700 break-all">
                          {simulationResult.claim.claimId}
                        </p>
                      </div>
                      <div
                        className={`rounded-xl p-3 border ${
                          simulationResult.claim.status === "flagged"
                            ? "bg-amber-50 border-amber-200"
                            : "bg-green-50 border-green-200"
                        }`}
                      >
                        <p className="text-gray-500 text-xs uppercase mb-1">
                          Auto Payout
                        </p>
                        <p
                          className={`font-black text-lg flex items-center ${
                            simulationResult.claim.status === "flagged"
                              ? "text-amber-600"
                              : "text-green-700"
                          }`}
                        >
                          <IndianRupee className="w-4 h-4" />
                          {simulationResult.claim.payoutAmount}
                        </p>
                      </div>
                    </div>
                    {/* Fraud check result */}
                    <div
                      className={`rounded-xl p-3 border text-sm ${
                        simulationResult.fraudCheck?.fraudDetected
                          ? "bg-amber-50 border-amber-200"
                          : "bg-green-50 border-green-200"
                      }`}
                    >
                      <p className="font-semibold text-xs uppercase mb-1 text-gray-500">
                        Fraud Check
                      </p>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-bold ${
                            simulationResult.fraudCheck?.fraudDetected
                              ? "text-amber-700"
                              : "text-green-700"
                          }`}
                        >
                          {simulationResult.fraudCheck?.fraudDetected
                            ? "⚠ Flagged for Review"
                            : "✓ Cleared — Payout Approved"}
                        </span>
                        <span className="text-xs text-gray-500">
                          Score:{" "}
                          <strong>
                            {simulationResult.fraudCheck?.fraudProbability ?? 0}
                          </strong>
                        </span>
                      </div>
                      {simulationResult.fraudCheck?.fraudReasons?.length >
                        0 && (
                        <ul className="mt-1 space-y-0.5">
                          {simulationResult.fraudCheck.fraudReasons.map(
                            (r, i) => (
                              <li key={i} className="text-xs text-amber-700">
                                • {r}
                              </li>
                            ),
                          )}
                        </ul>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 italic">
                      {simulationResult.disruption.reason}
                    </p>
                  </div>
                ) : (
                  <p className="text-yellow-700 text-sm">
                    {simulationResult.message}
                  </p>
                )
              ) : (
                <>
                  <p className="text-sm text-blue-700 mb-3">
                    Simulate a <strong>heavy rain event</strong> (120mm) to see
                    parametric insurance in action — AI detects disruption and
                    instantly creates a claim.
                  </p>
                  {simError && (
                    <p className="mb-2 text-xs text-red-600">{simError}</p>
                  )}
                  <button
                    onClick={handleSimulateDisruption}
                    disabled={simulating}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {simulating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CloudRain className="w-4 h-4" />
                    )}
                    {simulating ? "Simulating..." : "Simulate Rain Disruption"}
                  </button>
                </>
              )}
            </div>

            {activateError && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {activateError}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              {activated ? (
                <>
                  <div className="flex-1 flex items-center justify-center py-4 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-green-600 to-green-500 shadow-md gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Policy Activated!
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex-1 flex items-center justify-center py-4 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-blue-500 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all gap-2"
                  >
                    Go to Dashboard <ArrowRight className="w-5 h-5" />
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleActivate}
                  disabled={activating}
                  className="flex-1 w-full flex items-center justify-center py-4 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {activating ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />{" "}
                      Activating...
                    </>
                  ) : (
                    <>
                      Activate Policy <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
              )}
              <Link
                to="/"
                className="w-full sm:w-auto flex items-center justify-center py-4 px-6 rounded-xl text-gray-700 font-bold bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Home className="mr-2 w-5 h-5" />
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
