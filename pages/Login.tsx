import React, { useState } from 'react';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onLogin: (isGuest?: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, signUp, signInWithProvider, loginAsGuest } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
        if (isRegister) {
            const { error } = await signUp(email, password);
            if (error) throw error;
            alert("Check your email for the confirmation link!");
        } else {
            const { error } = await signIn(email); 
            if (error) throw error;
        }
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'discord') => {
    setLoading(true);
    setError(null);
    try {
        const { error } = await signInWithProvider(provider);
        if (error) throw error;
    } catch (err: any) {
        setError(err.message);
        setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setLoading(true);
    // Simulate brief network delay for realism
    setTimeout(() => {
        loginAsGuest();
        setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-background transition-colors duration-500 z-0"></div>
      
      {/* Aurora Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary rounded-full blur-[120px] animate-blob mix-blend-screen opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen opacity-40"></div>

      {/* Main Card */}
      <div className="w-full max-w-5xl h-[720px] md:h-[650px] glass-panel rounded-3xl overflow-hidden flex shadow-2xl relative z-10 border border-white/20 ring-1 ring-white/10">
        
        {/* Left Side (Visuals) - Hidden on Mobile */}
        <div className="hidden md:flex w-1/2 bg-white/5 backdrop-blur-md relative flex-col justify-between p-12 border-r border-white/10">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg shadow-primary/30 ring-1 ring-white/20">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-white drop-shadow-sm">
              Master the PNLE.
            </h1>
            <p className="text-text-muted text-lg max-w-xs leading-relaxed">
              Spaced repetition, question banks, and analytics designed for nursing excellence.
            </p>
          </div>
          
          {/* Guest Mode CTA on Left Panel */}
          <div className="relative z-10">
              <p className="text-sm text-white/60 mb-2 font-medium uppercase tracking-wider">Just passing through?</p>
              <button 
                onClick={handleGuestLogin}
                className="flex items-center text-white font-semibold group hover:text-accent transition-colors"
              >
                 <span className="border-b border-transparent group-hover:border-accent transition-colors">Try Guest Mode</span>
                 <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-surface/50 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl font-bold mb-2 text-text-main">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-text-muted mb-6">Enter your details to access your smart cards.</p>
            
            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="group">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-text-muted/50"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-input pl-10 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-text-muted/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-hover text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isRegister ? 'Create Account' : 'Sign In with Email'}
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-border"></div>
                <span className="px-3 text-xs uppercase text-text-muted font-bold tracking-wider">Or continue with</span>
                <div className="flex-1 border-t border-border"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleOAuth('google')}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-slate-700 hover:bg-gray-50 border border-gray-200 shadow-sm transition-all active:scale-95 font-medium"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                </button>
                <button 
                   onClick={() => handleOAuth('discord')}
                   className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-sm transition-all active:scale-95 font-medium"
                >
                   <svg width="20" height="20" viewBox="0 0 127 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.07 72.07 0 0 0-3.36 6.83 97.96 97.96 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.15 105.15 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.74 105.74 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2.03a75.75 75.75 0 0 0 62.96 0c.87.71 1.76 1.39 2.66 2.03a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.25-51.11-13.5-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74c6.37 0 11.53 5.75 11.45 12.74.08 7-5.08 12.69-11.45 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.45-12.74c6.35 0 11.53 5.75 11.43 12.74 0 7-5.08 12.69-11.43 12.69Z" fill="#fff"/>
                   </svg>
                   Discord
                </button>
            </div>
            
             <p className="mt-8 text-center text-sm text-text-muted">
              {isRegister ? "Already have an account?" : "Don't have an account?"}
              <button 
                onClick={() => setIsRegister(!isRegister)}
                className="ml-1 text-primary hover:text-primary-hover font-medium hover:underline transition-all"
              >
                {isRegister ? 'Log in' : 'Sign up'}
              </button>
            </p>
            
            {/* Mobile Guest Button */}
            <div className="md:hidden mt-8 pt-6 border-t border-border/50 text-center">
                <button 
                    onClick={handleGuestLogin}
                    className="text-sm font-medium text-text-muted hover:text-primary transition-colors"
                >
                    Or try <span className="underline">Guest Mode</span>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;