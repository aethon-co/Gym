'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, User, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function AdminSignIn() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/Signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.token) {
        localStorage.setItem("adminToken", data.token);
        router.push("/home/newStudents");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-950 font-sans selection:bg-red-500/30">
      {/* Background gradients */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />

      {/* Grid Pattern overlay for texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6 py-10 sm:p-10 m-4 rounded-[2rem] bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_-10px_rgba(220,38,38,0.15)] isolation-auto">
        
        {/* Decorative top border highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-80" />

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-tr from-red-600 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30 transform transition-transform hover:scale-105 duration-500 ease-out">
            <Dumbbell className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
            Admin Portal
          </h2>
          <p className="text-gray-400 mt-3 text-sm font-medium tracking-wide">Secure access to gym management</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-8 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors duration-300">
                 <User className="w-5 h-5" />
               </div>
               <input
                 type="text"
                 placeholder="Admin Username"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="w-full pl-12 pr-4 py-4 bg-slate-950/50 text-white rounded-xl border border-white/5 focus:border-red-500/50 focus:bg-slate-900/80 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all duration-300 placeholder:text-gray-500"
                 required
               />
             </div>
          </div>
          
          <div className="space-y-1">
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors duration-300">
                 <Lock className="w-5 h-5" />
               </div>
               <input
                 type="password"
                 placeholder="Password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full pl-12 pr-4 py-4 bg-slate-950/50 text-white rounded-xl border border-white/5 focus:border-red-500/50 focus:bg-slate-900/80 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all duration-300 placeholder:text-gray-500"
                 required
               />
             </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-red-600 to-red-500 text-white py-4 px-6 rounded-xl font-semibold shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all duration-300 active:scale-[0.98] border border-red-500/50 disabled:opacity-70 disabled:pointer-events-none"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300 delay-75" />
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}