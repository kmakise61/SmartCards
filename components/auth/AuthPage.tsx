import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, ArrowRight, Loader2, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const AuthPage: React.FC = () => {
    const { loginWithGoogle, loginWithEmail, signupWithEmail, resetPassword } = useAuth();
    const { isDark, isCrescere } = useTheme();
    
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleGoogleLogin = async () => {
        setError('');
        setIsLoading(true);
        try {
            await loginWithGoogle();
        } catch (e: any) {
            setError(e.message.replace('Firebase: ', ''));
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsLoading(true);

        try {
            if (mode === 'login') {
                await loginWithEmail(email, password);
            } else if (mode === 'signup') {
                await signupWithEmail(email, password);
            } else if (mode === 'forgot') {
                await resetPassword(email);
                setSuccessMsg('Password reset link sent to your email.');
                setIsLoading(false);
                return;
            }
        } catch (e: any) {
            setError(e.message.replace('Firebase: ', ''));
            setIsLoading(false);
        }
    };

    const bgClass = isCrescere ? 'bg-black' : isDark ? 'bg-[#0A0F1C]' : 'bg-slate-50';
    const cardClass = isDark || isCrescere 
        ? 'bg-white/5 border-white/10 text-white' 
        : 'bg-white border-slate-200 text-slate-900 shadow-xl';
    
    const inputClass = `w-full p-4 pl-12 rounded-xl outline-none border transition-all ${
        isDark || isCrescere
            ? 'bg-black/20 border-white/10 text-white focus:border-accent/50 placeholder:text-white/20' 
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-accent/50 placeholder:text-slate-400'
    }`;

    return (
        <div className={`w-full h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden ${bgClass}`}>
            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-20 bg-accent animate-blob pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-10 bg-blue-600 animate-blob animation-delay-2000 pointer-events-none" />

            <div className={`relative z-10 w-full max-w-5xl h-full md:h-[600px] flex rounded-[2.5rem] border overflow-hidden backdrop-blur-xl shadow-2xl ${isDark || isCrescere ? 'border-white/10 bg-black/20' : 'border-white/50 bg-white/60'}`}>
                
                {/* Left Side - Brand (Hidden on mobile) */}
                <div className="hidden md:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-accent text-white">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 rounded-xl bg-white text-accent shadow-lg">
                                <GraduationCap size={24} />
                            </div>
                            <span className="text-xl font-black tracking-tight">PNLE SmartCards</span>
                        </div>
                        <h1 className="text-5xl font-black leading-[1.1] mb-6">
                            Master Your<br/>Board Exam.
                        </h1>
                        <p className="text-white/80 font-medium text-lg leading-relaxed max-w-sm">
                            The intelligent spaced-repetition platform designed specifically for future nurses.
                        </p>
                    </div>

                    <div className="relative z-10 flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-white/50" />
                        <div className="w-2 h-2 rounded-full bg-white/50" />
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className={`flex-1 flex flex-col items-center justify-center p-8 md:p-12 relative ${isDark || isCrescere ? 'bg-[#0B1121]/80' : 'bg-white/80'}`}>
                    
                    <div className="w-full max-w-sm space-y-8">
                        <div className="text-center">
                            <h2 className={`text-2xl font-black mb-2 ${isDark || isCrescere ? 'text-white' : 'text-slate-900'}`}>
                                {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                            </h2>
                            <p className={`text-sm ${isDark || isCrescere ? 'text-white/50' : 'text-slate-500'}`}>
                                {mode === 'login' ? 'Enter your credentials to continue.' : mode === 'signup' ? 'Start your journey to RN today.' : 'We will send you a recovery link.'}
                            </p>
                        </div>

                        {/* Google Button */}
                        {mode !== 'forgot' && (
                            <>
                                <button 
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                    className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-3 font-bold transition-all border ${
                                        isDark || isCrescere 
                                            ? 'bg-white text-black hover:bg-gray-200 border-transparent' 
                                            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                                    }`}
                                >
                                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
                                        <>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            Continue with Google
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center gap-4">
                                    <div className={`h-px flex-1 ${isDark || isCrescere ? 'bg-white/10' : 'bg-slate-200'}`} />
                                    <span className={`text-xs font-bold uppercase ${isDark || isCrescere ? 'text-white/30' : 'text-slate-400'}`}>Or continue with</span>
                                    <div className={`h-px flex-1 ${isDark || isCrescere ? 'bg-white/10' : 'bg-slate-200'}`} />
                                </div>
                            </>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {successMsg && (
                                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold flex items-center gap-2">
                                    <Check size={14} /> {successMsg}
                                </div>
                            )}
                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="relative group">
                                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark || isCrescere ? 'text-white/30 group-focus-within:text-accent' : 'text-slate-400 group-focus-within:text-accent'}`} size={20} />
                                    <input 
                                        type="email" 
                                        required
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                {mode !== 'forgot' && (
                                    <div className="relative group">
                                        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark || isCrescere ? 'text-white/30 group-focus-within:text-accent' : 'text-slate-400 group-focus-within:text-accent'}`} size={20} />
                                        <input 
                                            type="password" 
                                            required
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                )}
                            </div>

                            {mode === 'login' && (
                                <div className="flex justify-end">
                                    <button 
                                        type="button"
                                        onClick={() => setMode('forgot')}
                                        className={`text-xs font-bold hover:underline ${isDark || isCrescere ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 rounded-xl bg-accent text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-accent/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                                    <>
                                        {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Link'} <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="text-center">
                            {mode === 'login' ? (
                                <p className={`text-xs font-medium ${isDark || isCrescere ? 'text-white/50' : 'text-slate-500'}`}>
                                    Don't have an account? <button onClick={() => setMode('signup')} className="font-bold text-accent hover:underline">Sign up</button>
                                </p>
                            ) : (
                                <p className={`text-xs font-medium ${isDark || isCrescere ? 'text-white/50' : 'text-slate-500'}`}>
                                    Already have an account? <button onClick={() => setMode('login')} className="font-bold text-accent hover:underline">Sign in</button>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;