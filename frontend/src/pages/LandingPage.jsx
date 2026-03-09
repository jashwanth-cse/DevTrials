import React from 'react';
import { ArrowRight, ShieldCheck, Zap, CloudLightning, BadgeIndianRupee, Activity, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative pt-24 pb-32 overflow-hidden sm:pt-32 sm:pb-40 lg:pb-48">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-accent-200 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8 mt-12 border border-primary-100 shadow-sm animate-fade-in-up">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                        </span>
                        Instant parameteric payouts active
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight max-w-4xl mx-auto">
                        Protect Your Gig Income From <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">Weather Disruptions</span>
                    </h1>
                    <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Gig workers lose income due to heavy rain, extreme pollution, and curfews. GigCover provides instant, AI-calculated parametric insurance with automatic payouts.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group transform hover:-translate-y-1">
                            Get Covered Now
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 text-lg font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center">
                            Learn more
                        </a>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="py-24 bg-gray-50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How it works</h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">Simple, transparent, and completely automated. No tedious claim forms.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary-200 via-accent-200 to-primary-200 -z-10"></div>

                        {[
                            {
                                step: 1,
                                title: "Sign up as delivery partner",
                                desc: "Register in under 2 minutes verifying your gig platform profile.",
                                icon: <CheckCircle2 className="w-8 h-8 text-primary-600" />
                            },
                            {
                                step: 2,
                                title: "AI calculates weekly premium",
                                desc: "Our model analyzes historical disruptions & your area to set a custom micro-premium.",
                                icon: <Activity className="w-8 h-8 text-accent-600" />
                            },
                            {
                                step: 3,
                                title: "Automatic payout during disruptions",
                                desc: "When rain, pollution or curfews hit thresholds, payouts trigger instantly to your wallet.",
                                icon: <Zap className="w-8 h-8 text-primary-600" />
                            }
                        ].map((item) => (
                            <div key={item.step} className="relative flex flex-col items-center text-center group cursor-default">
                                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-gray-100 shadow-xl flex items-center justify-center mb-6 relative z-10 group-hover:-translate-y-2 transition-transform duration-300">
                                    {item.icon}
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-sm shadow-md">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Highlights Section */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                        <div className="max-w-xl">
                            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">We've reengineered insurance for the modern gig worker.</h2>
                            <p className="text-xl text-gray-500 leading-relaxed">Traditional insurance doesn't cover income loss from daily disruptions. We use big data and parametric models to fill that gap perfectly.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "AI Risk Assessment",
                                description: "Dynamic pricing accurately reflects hyper-local weather and civic indices.",
                                icon: <Activity className="w-10 h-10 text-white" />,
                                bg: "from-blue-500 to-primary-600"
                            },
                            {
                                title: "Parametric Claim Automation",
                                description: "No claim forms or human adjusters. If the trigger occurs, you get paid automatically.",
                                icon: <ShieldCheck className="w-10 h-10 text-white" />,
                                bg: "from-purple-500 to-accent-600"
                            },
                            {
                                title: "Instant Weekly Coverage",
                                description: "Pay premiums weekly out of earnings. Coverage starts without long waiting periods.",
                                icon: <BadgeIndianRupee className="w-10 h-10 text-white" />,
                                bg: "from-teal-400 to-teal-600"
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="p-8 rounded-3xl border border-gray-100 bg-white hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.bg} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-500 text-lg leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA section */}
            <section className="py-20 relative overflow-hidden bg-gray-900 rounded-b-none mb-0">
                <div className="absolute inset-0 opacity-10 bg-[url('https://api.dicebear.com/7.x/shapes/svg?seed=GigCover')] bg-cover"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Stop letting weather dictate your earnings.</h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Join thousands of delivery partners protecting their weekly income with GigCover.</p>
                    <Link to="/register" className="inline-flex px-8 py-4 text-lg font-bold text-gray-900 bg-white hover:bg-gray-100 rounded-full shadow-xl transition-all items-center justify-center transform hover:scale-105">
                        Get Covered Today
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
