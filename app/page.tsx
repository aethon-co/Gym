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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans selection:bg-red-500/20">
      <div className="w-full max-w-md px-6 py-10 sm:p-10 m-4 rounded-[2rem] bg-slate-900 border border-white/10 shadow-xl">

        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
            <Dumbbell className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">
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
                 className="w-full pl-12 pr-4 py-4 bg-slate-950 text-white rounded-xl border border-white/10 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-colors placeholder:text-gray-500"
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
                 className="w-full pl-12 pr-4 py-4 bg-slate-950 text-white rounded-xl border border-white/10 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-colors placeholder:text-gray-500"
                 required
               />
             </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-4 px-6 rounded-xl font-semibold border border-red-500/60 transition-colors active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
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