import React, { useState } from "react";
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  Building2,
  UserCircle2,
  MapPin,
  Map,
  Wallet,
  Truck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    platform: "",
    dailyIncome: "",
    zoneType: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep === 1 && formData.name && formData.city) {
      setCurrentStep(2);
      setError(null);
    } else if (currentStep === 1) {
      setError("Please fill out all fields to continue.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.platform || !formData.dailyIncome || !formData.zoneType) {
      setError("Please fill out all fields to calculate your premium.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/risk-assessment",
        formData,
      );
      if (response.data && response.data.weeklyPremium !== undefined) {
        // Pass data via route state
        const premiumData = {
          workerName: formData.name,
          city: formData.city,
          platform: formData.platform,
          dailyIncome: formData.dailyIncome,
          zoneType: formData.zoneType,
          policyId: response.data.policyId,
          riskScore: response.data.riskScore,
          riskCategory: response.data.riskCategory,
          weeklyPremium: response.data.weeklyPremium,
          dailyCoverage: response.data.coverageAmount,
        };
        navigate("/premium", { state: { premiumData } });
      } else {
        setError("Assessment failed to return expected data format.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Error during risk assessment:", err);
      setError(
        "Failed to connect to the risk assessment server. Make sure the backend and AI service are running.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-gray-50 overflow-hidden pt-24">
      {/* Decorative background vectors */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-accent-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-xl z-10">
        <div className="text-center mb-10">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors mb-4 bg-white/50 backdrop-blur pb-1 px-3 rounded-full border border-gray-200 py-1.5"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-xl shadow-primary-500/20">
              <Shield className="text-white w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Onboard to GigCover
          </h1>
          <p className="mt-2 text-gray-500">
            Tell us about your work to get a custom, AI-calculated weekly
            premium.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
          {/* Progress Bar Container */}
          <div className="mb-8 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
            <div
              className={`absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500 -translate-y-1/2 rounded-full transition-all duration-500`}
              style={{ width: currentStep === 1 ? "50%" : "100%" }}
            ></div>
            <div className="relative flex justify-between items-center z-10 mt-[-14px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow transition-colors duration-300 ${currentStep >= 1 ? "bg-primary-600 text-white" : "bg-white text-gray-400 border border-gray-200"}`}
              >
                1
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow transition-colors duration-300 ${currentStep === 2 ? "bg-accent-600 text-white" : "bg-white text-gray-400 border border-gray-200"}`}
              >
                2
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium flex items-start">
              <span className="block">{error}</span>
            </div>
          )}

          <form onSubmit={currentStep === 1 ? handleNext : handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Personal Details
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Enter your basic verification information.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserCircle2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-colors"
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Primary City of Operation
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-colors"
                      placeholder="e.g. Mumbai, Bangalore"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center py-4 px-4 rounded-xl text-white font-bold bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all shadow-md hover:shadow-lg"
                  >
                    Continue to Work Details
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Work Profile
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    This helps our AI assess your risk accurately.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="platform"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Delivery Platform
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Truck className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="platform"
                      name="platform"
                      value={formData.platform}
                      onChange={handleInputChange}
                      className="block w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-colors appearance-none"
                      required
                    >
                      <option value="" disabled>
                        Select your primary platform
                      </option>
                      <option value="swiggy">Swiggy</option>
                      <option value="zomato">Zomato</option>
                      <option value="amazon">Amazon Flex</option>
                      <option value="zepto">Zepto</option>
                      <option value="blinkit">Blinkit</option>
                      <option value="other">Other App</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="dailyIncome"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Average Daily Income (INR)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold">₹</span>
                    </div>
                    <input
                      type="number"
                      name="dailyIncome"
                      id="dailyIncome"
                      min="100"
                      value={formData.dailyIncome}
                      onChange={handleInputChange}
                      className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-colors"
                      placeholder="e.g. 800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="zoneType"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Working Zone Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label
                      className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center transition-all ${formData.zoneType === "urban" ? "border-primary-500 bg-primary-50" : "border-gray-100 hover:border-gray-200 bg-white"}`}
                    >
                      <input
                        type="radio"
                        name="zoneType"
                        value="urban"
                        className="hidden"
                        onChange={handleInputChange}
                        required
                      />
                      <Building2
                        className={`w-8 h-8 mb-2 ${formData.zoneType === "urban" ? "text-primary-600" : "text-gray-400"}`}
                      />
                      <span
                        className={`font-semibold ${formData.zoneType === "urban" ? "text-primary-900" : "text-gray-600"}`}
                      >
                        Urban
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        High Traffic
                      </span>
                    </label>

                    <label
                      className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center transition-all ${formData.zoneType === "semi-urban" ? "border-primary-500 bg-primary-50" : "border-gray-100 hover:border-gray-200 bg-white"}`}
                    >
                      <input
                        type="radio"
                        name="zoneType"
                        value="semi-urban"
                        className="hidden"
                        onChange={handleInputChange}
                        required
                      />
                      <Map
                        className={`w-8 h-8 mb-2 ${formData.zoneType === "semi-urban" ? "text-primary-600" : "text-gray-400"}`}
                      />
                      <span
                        className={`font-semibold ${formData.zoneType === "semi-urban" ? "text-primary-900" : "text-gray-600"}`}
                      >
                        Semi-Urban
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Med Traffic
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-4 px-4 rounded-xl text-gray-700 font-bold bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] flex justify-center py-4 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Analyzing Risk...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Calculate My Weekly Premium
                        <Wallet className="ml-2 w-5 h-5" />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Secure notice */}
          <div className="mt-8 flex items-center justify-center text-xs text-gray-400 font-medium">
            <Shield className="w-4 h-4 mr-1 text-gray-400" />
            <span>Data protected and encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
