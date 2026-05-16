"use client";

import { useState } from "react";

// ─── STEP CONSTANTS ───────────────────────────────────────────────
const STEP_AUTH = "auth";       // login / signup form
const STEP_OTP  = "otp";        // OTP verification
const STEP_ONBOARD = "onboard"; // exam target + year

export default function LoginPage() {
  const [mode, setMode]       = useState("login");   // "login" | "signup"
  const [step, setStep]       = useState(STEP_AUTH);
  const [phone, setPhone]     = useState("");
  const [otp, setOtp]         = useState(["", "", "", "", "", ""]);
  const [name, setName]       = useState("");
  const [exam, setExam]       = useState(null);      // "JEE" | "NEET"
  const [year, setYear]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear + i);

  // ── Handlers ────────────────────────────────────────────────────

  const handleSendOtp = () => {
    if (phone.length !== 10) { setError("Enter a valid 10-digit number"); return; }
    setError("");
    setLoading(true);
    // TODO: call Supabase phone auth here
    setTimeout(() => { setLoading(false); setStep(STEP_OTP); }, 800);
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
    if (!val && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
  };

  const handleVerifyOtp = () => {
    const code = otp.join("");
    if (code.length !== 6) { setError("Enter the full 6-digit OTP"); return; }
    setError("");
    setLoading(true);
    // TODO: call supabase.auth.verifyOtp({ phone, token: code, type: "sms" })
    setTimeout(() => {
      setLoading(false);
      if (mode === "signup") setStep(STEP_ONBOARD);
      else window.location.href = "/dashboard"; // login → go straight in
    }, 800);
  };

  const handleGoogleLogin = () => {
    // TODO: call supabase.auth.signInWithOAuth({ provider: "google" })
    alert("Google OAuth — wire up Supabase here");
  };

  const handleOnboard = () => {
    if (!exam || !year) { setError("Please select both exam and year"); return; }
    setError("");
    setLoading(true);
    // TODO: save to profiles table, then redirect
    setTimeout(() => { window.location.href = "/dashboard"; }, 600);
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-mono text-2xl font-black tracking-tight text-black dark:text-white">
            AI STUDY
          </span>
          <p className="text-xs text-gray-400 mt-1 tracking-widest uppercase">
            JEE · NEET Preparation
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">

          {/* ── STEP 1: AUTH ─────────────────────────────────────── */}
          {step === STEP_AUTH && (
            <div className="p-8">

              {/* Mode toggle */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-8">
                {["login", "signup"].map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(""); }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-150
                      ${mode === m
                        ? "bg-white dark:bg-gray-950 text-black dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                      }`}
                  >
                    {m === "login" ? "Log In" : "Sign Up"}
                  </button>
                ))}
              </div>

              <h2 className="text-xl font-black text-black dark:text-white mb-1">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                {mode === "login"
                  ? "Log in to continue your preparation."
                  : "Join thousands of JEE & NEET aspirants."}
              </p>

              {/* Name field — signup only */}
              {mode === "signup" && (
                <div className="mb-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aryan Mehta"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
                  />
                </div>
              )}

              {/* Phone number */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                  Phone Number
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-semibold text-gray-600 dark:text-gray-300 flex-shrink-0">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                    placeholder="98765 43210"
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-medium mb-4">{error}</p>}

              {/* Send OTP button */}
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-black hover:opacity-90 disabled:opacity-50 transition-all mb-4"
              >
                {loading ? "Sending OTP..." : `Continue with Phone →`}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                <span className="text-xs text-gray-400 font-medium">or</span>
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
              </div>

              {/* Google login */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
              >
                {/* Google SVG icon */}
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
                </svg>
                Continue with Google
              </button>

              <p className="text-center text-xs text-gray-400 mt-5">
                By continuing you agree to our{" "}
                <span className="underline cursor-pointer hover:text-black dark:hover:text-white">Terms</span>
                {" & "}
                <span className="underline cursor-pointer hover:text-black dark:hover:text-white">Privacy Policy</span>
              </p>
            </div>
          )}

          {/* ── STEP 2: OTP ──────────────────────────────────────── */}
          {step === STEP_OTP && (
            <div className="p-8">
              <button
                onClick={() => { setStep(STEP_AUTH); setOtp(["","","","","",""]); setError(""); }}
                className="text-xs font-semibold text-gray-400 hover:text-black dark:hover:text-white mb-6 flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-black text-black dark:text-white mb-1">
                  Check your phone
                </h2>
                <p className="text-sm text-gray-400">
                  We sent a 6-digit OTP to{" "}
                  <span className="text-black dark:text-white font-semibold">+91 {phone}</span>
                </p>
              </div>

              {/* OTP boxes */}
              <div className="flex gap-2 mb-6">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[idx] && idx > 0)
                        document.getElementById(`otp-${idx - 1}`)?.focus();
                    }}
                    className="flex-1 h-14 text-center text-xl font-black rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                ))}
              </div>

              {error && <p className="text-xs text-red-500 font-medium mb-4">{error}</p>}

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.join("").length !== 6}
                className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-black hover:opacity-90 disabled:opacity-40 transition-all mb-4"
              >
                {loading ? "Verifying..." : "Verify OTP →"}
              </button>

              <button
                onClick={handleSendOtp}
                className="w-full text-center text-xs text-gray-400 hover:text-black dark:hover:text-white transition-colors font-medium"
              >
                Didn't receive it? Resend OTP
              </button>
            </div>
          )}

          {/* ── STEP 3: ONBOARDING ───────────────────────────────── */}
          {step === STEP_ONBOARD && (
            <div className="p-8">
              <div className="text-3xl mb-4">🎯</div>
              <h2 className="text-xl font-black text-black dark:text-white mb-1">
                One last thing
              </h2>
              <p className="text-sm text-gray-400 mb-8">
                Tell us about your goal so we can personalise your experience.
              </p>

              {/* Exam target */}
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">
                  Target Exam
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["JEE", "NEET"].map((e) => (
                    <button
                      key={e}
                      onClick={() => setExam(e)}
                      className={`py-4 rounded-xl border-2 text-sm font-black transition-all duration-150
                        ${exam === e
                          ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black"
                          : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800"
                        }`}
                    >
                      {e === "JEE" ? "⚛ JEE" : "🏥 NEET"}
                      <div className="text-[10px] font-normal opacity-60 mt-0.5">
                        {e === "JEE" ? "Engineering" : "Medical"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target year */}
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">
                  Target Year
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {years.map((y) => (
                    <button
                      key={y}
                      onClick={() => setYear(y)}
                      className={`py-3 rounded-xl border-2 text-sm font-bold transition-all duration-150
                        ${year === y
                          ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black"
                          : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400 bg-gray-50 dark:bg-gray-800"
                        }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-medium mb-4">{error}</p>}

              <button
                onClick={handleOnboard}
                disabled={loading || !exam || !year}
                className="w-full py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black text-sm font-black hover:opacity-90 disabled:opacity-40 transition-all"
              >
                {loading ? "Setting up..." : "Start Preparing →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}