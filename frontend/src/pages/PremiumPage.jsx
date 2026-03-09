import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Home, CloudLightning, BadgeIndianRupee } from 'lucide-react';

const PremiumPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const premiumData = location.state?.premiumData;

    useEffect(() => {
        // Redirect if no data is present (e.g. user navigated directly to this URL)
        if (!premiumData) {
            navigate('/register');
        }
    }, [premiumData, navigate]);

    if (!premiumData) return null; // Prevent rendering during redirect

    return (
        <div className="min-h-[90vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-gray-50 overflow-hidden pt-24">
            {/* Decorative background vectors */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>

            <div className="w-full max-w-2xl z-10 animate-fade-in-up">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6 border-4 border-white shadow-lg">
                        <ShieldCheck className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your Custom Coverage</h1>
                    <p className="mt-3 text-lg text-gray-500">
                        Based on your profile, our AI has calculated the optimal protective premium for your gig income.
                    </p>
                </div>

                {/* Results Card */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://api.dicebear.com/7.x/shapes/svg?seed=GigCoverRisk')] bg-cover"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left">
                            <div>
                                <p className="text-gray-400 font-medium tracking-wide text-sm uppercase mb-1">Policy Quote for</p>
                                <h2 className="text-3xl font-bold">{premiumData.workerName}</h2>
                                <p className="text-gray-400 mt-2 text-sm">Policy ID: <span className="text-white font-mono">{premiumData.policyId}</span></p>
                                {premiumData.riskScore && (
                                    <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium border border-blue-500/30">
                                        AI Risk Score: {premiumData.riskScore.toFixed(2)}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 md:mt-0 text-right">
                                <p className="text-gray-400 font-medium tracking-wide text-sm uppercase mb-1">Weekly Premium</p>
                                <div className="flex items-end justify-center md:justify-end gap-1">
                                    <span className="text-5xl font-black text-white">₹{premiumData.weeklyPremium}</span>
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
                                    <h4 className="font-semibold text-gray-900">₹{premiumData.dailyCoverage} Daily Payout</h4>
                                    <p className="text-sm text-gray-500 mt-1">Automatically deposited if heavy rain or civic curfews hit your working zone.</p>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-start">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4 shrink-0">
                                    <ShieldCheck className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Zero Claim Forms</h4>
                                    <p className="text-sm text-gray-500 mt-1">Parametric triggers mean we monitor the index and pay out automatically.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="flex-1 w-full flex items-center justify-center py-4 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5">
                                Activate Policy
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                            <Link to="/" className="w-full sm:w-auto flex items-center justify-center py-4 px-6 rounded-xl text-gray-700 font-bold bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
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
