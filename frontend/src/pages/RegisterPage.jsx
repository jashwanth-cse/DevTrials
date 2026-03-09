import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-gray-50">

            {/* Decorative background blurs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>

            <div className="max-w-md w-full space-y-8 glass-panel p-10 relative z-10 bg-white/80">
                <div>
                    <div className="flex justify-center">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
                            <Shield className="text-white w-6 h-6" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link to="/" className="font-medium text-primary-600 hover:text-primary-500 flex items-center justify-center gap-1 mt-2">
                            <ArrowLeft className="w-4 h-4" /> Return to home
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="name" className="sr-only">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white"
                                placeholder="Full Name"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="sr-only">Phone Number</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white"
                                placeholder="Phone Number"
                            />
                        </div>
                        <div>
                            <label htmlFor="platform" className="sr-only">Delivery Platform</label>
                            <select
                                id="platform"
                                name="platform"
                                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white"
                            >
                                <option value="" disabled selected>Select Delivery Platform</option>
                                <option value="zomato">Zomato</option>
                                <option value="swiggy">Swiggy</option>
                                <option value="blinkit">Blinkit</option>
                                <option value="zepto">Zepto</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all shadow-md hover:shadow-xl"
                            onClick={() => alert("Registration flow would continue here.")}
                        >
                            Sign up & Get Assessed
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
