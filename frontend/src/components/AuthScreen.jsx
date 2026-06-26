import React, { useState } from 'react';

const AuthScreen = ({ onAuthSuccess, onBackToLanding }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Success
      if (data.success && data.user) {
        onAuthSuccess(data.user);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-[#1D1D1F] font-sans flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-b from-[#FFFFFF] to-[#F5F5F7] px-4">
      {/* Background Grid Lines and Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      
      {/* Back button */}
      <button 
        onClick={onBackToLanding}
        className="absolute top-6 left-6 font-mono text-[9px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
      >
        ← Back to Home
      </button>

      {/* Main card */}
      <div className="relative w-full max-w-md bg-white/70 border border-black/5 rounded-3xl p-8 md:p-10 shadow-glow backdrop-blur-lg space-y-8 animate-fadeIn">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 mb-2">
            <h1 className="text-lg font-black tracking-widest font-syne uppercase text-black">
              Dhanda.ai
            </h1>
            <span className="text-[7px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-black text-white">
              OS
            </span>
          </div>
          <h2 className="text-2xl font-bold font-outfit text-black tracking-tight">
            {isRegister ? 'Create Merchant Account' : 'Sign in to Dhanda OS'}
          </h2>
          <p className="text-xs text-gray-400">
            {isRegister 
              ? 'Join Noida\'s premier autonomous B2B Kirana syndicate.'
              : 'Enter your credentials to manage your store swarm agents.'
            }
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-black/5 rounded-full p-1 border border-black/5">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
              !isRegister 
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-400 hover:text-black'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
              isRegister 
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-400 hover:text-black'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-500 text-xs font-mono text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1 text-left">
            <label className="text-[9px] uppercase font-bold text-gray-400 font-mono tracking-wider block">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. ramesh_grocery"
              className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-black font-semibold text-black transition-all"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-[9px] uppercase font-bold text-gray-400 font-mono tracking-wider block">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#F5F5F7] border border-black/5 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-black font-mono text-black transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-black hover:bg-black/90 text-white font-extrabold rounded-xl transition-all uppercase tracking-widest text-xs shadow-md shadow-black/10 transform active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Access Dashboard'}
          </button>
        </form>

        {/* Help Tip */}
        <div className="pt-2 border-t border-black/5 text-[9px] text-gray-400 font-mono text-center">
          Secure multi-tenant environment. Passwords hashed with SHA-256.
        </div>

      </div>
    </div>
  );
};

export default AuthScreen;
