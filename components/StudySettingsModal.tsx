import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, Save, BrainCircuit, Layers, 
    Zap, Target, Info, Calculator, Clock, HelpCircle
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

interface StudySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const StudySettingsModal: React.FC<StudySettingsModalProps> = ({ isOpen, onClose }) => {
    const { preferences, updatePreferences, cards, stats } = useData();
    const { theme, isDark } = useTheme(); // theme is 'light' | 'dark' | 'midnight'
    const [localPrefs, setLocalPrefs] = useState(preferences);

    useEffect(() => {
        if (isOpen) setLocalPrefs(preferences);
    }, [isOpen, preferences]);

    // --- THEME TOKEN MAP ---
    const t = useMemo(() => {
        const config = {
            light: {
                overlay: 'bg-slate-900/20 backdrop-blur-sm',
                modal: 'bg-white ring-1 ring-slate-200 shadow-2xl',
                headerBorder: 'border-slate-100',
                textPrimary: 'text-slate-900',
                textSecondary: 'text-slate-500',
                textMuted: 'text-slate-400',
                cardBg: 'bg-slate-50 border-slate-200',
                cardBorder: 'border',
                inputBg: 'bg-white',
                inputBorder: 'border-slate-200',
                inputText: 'text-slate-900',
                divider: 'border-slate-100',
                chipBg: 'bg-slate-100',
                chipText: 'text-slate-600',
                highlightBg: 'bg-blue-50',
                highlightBorder: 'border-blue-100',
                highlightText: 'text-blue-900',
                footerBg: 'bg-slate-50',
                btnCancel: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
            },
            dark: { // Standard Dark Mode (High Contrast Fix)
                overlay: 'bg-black/60 backdrop-blur-md',
                modal: 'bg-[#1e293b] ring-1 ring-slate-700 shadow-2xl', // Slate-800
                headerBorder: 'border-slate-700',
                textPrimary: 'text-slate-50', // High contrast white
                textSecondary: 'text-slate-400',
                textMuted: 'text-slate-500',
                cardBg: 'bg-[#0f172a] border-slate-700', // Slate-900
                cardBorder: 'border',
                inputBg: 'bg-[#1e293b]', // Slate-800
                inputBorder: 'border-slate-600',
                inputText: 'text-white',
                divider: 'border-slate-700',
                chipBg: 'bg-slate-800',
                chipText: 'text-slate-300',
                highlightBg: 'bg-blue-900/20',
                highlightBorder: 'border-blue-500/20',
                highlightText: 'text-blue-100',
                footerBg: 'bg-[#0f172a]', // Slate-900
                btnCancel: 'text-slate-400 hover:bg-slate-800 hover:text-white',
            },
            midnight: { // Deep/OLED Mode
                overlay: 'bg-black/80 backdrop-blur-md',
                modal: 'bg-[#050508] ring-1 ring-white/10 shadow-2xl',
                headerBorder: 'border-white/5',
                textPrimary: 'text-white',
                textSecondary: 'text-white/50',
                textMuted: 'text-white/30',
                cardBg: 'bg-white/[0.03] border-white/5',
                cardBorder: 'border',
                inputBg: 'bg-white/5',
                inputBorder: 'border-white/10',
                inputText: 'text-white',
                divider: 'border-white/5',
                chipBg: 'bg-white/10',
                chipText: 'text-white/60',
                highlightBg: 'bg-blue-500/10',
                highlightBorder: 'border-blue-500/20',
                highlightText: 'text-blue-100',
                footerBg: 'bg-black/40',
                btnCancel: 'text-white/40 hover:bg-white/10 hover:text-white',
            }
        };
        return config[theme] || config.dark;
    }, [theme]);

    // --- LIVE PROJECTION LOGIC ---
    const projection = useMemo(() => {
        const now = new Date().toISOString();
        const today = now.split('T')[0];

        // 1. Total available in the "pool"
        // Reviews Due: Not New + Scheduled before or equal to now.
        const totalReviewsDue = cards.filter(c => c.status !== 'new' && c.nextReview && c.nextReview <= now).length;
        // New Available: All cards with status 'new'
        const totalNewAvailable = cards.filter(c => c.status === 'new').length;

        // 2. Daily Limits Progress
        const progressDate = stats.dailyProgress?.date === today ? stats.dailyProgress : { newStudied: 0, reviewStudied: 0 };
        const doneNew = progressDate.newStudied || 0;
        const doneReview = progressDate.reviewStudied || 0;

        // 3. Remaining Allowances
        const limitNew = Math.max(0, localPrefs.newCardsPerDay);
        const limitReview = Math.max(0, localPrefs.reviewCardsPerDay);

        const remainingNewAllowance = Math.max(0, limitNew - doneNew);
        const remainingReviewAllowance = Math.max(0, limitReview - doneReview);

        // 4. Cards Allowed Today (Intersection of Availability vs Limit)
        const allowedNew = Math.min(totalNewAvailable, remainingNewAllowance);
        const allowedReview = Math.min(totalReviewsDue, remainingReviewAllowance);
        const totalAllowedToday = allowedNew + allowedReview;

        // 5. Ignite Batch Logic (Per Session)
        const sessionSize = localPrefs.sessionSize;
        
        // Priority goes to Reviews first in study session generator. 
        // We cap the reviews by session size, then fill remaining space with new cards.
        const igniteReviews = Math.min(allowedReview, sessionSize);
        const igniteNew = Math.min(allowedNew, Math.max(0, sessionSize - igniteReviews));
        const igniteTotal = igniteReviews + igniteNew;

        return {
            totalReviewsDue,
            totalNewAvailable,
            remainingNewAllowance,
            remainingReviewAllowance,
            allowedNew,
            allowedReview,
            totalAllowedToday,
            igniteTotal,
            igniteReviews,
            igniteNew
        };
    }, [cards, stats, localPrefs]);

    const handleSave = () => {
        updatePreferences(localPrefs);
        onClose();
    };

    const handleInputChange = (field: keyof typeof localPrefs, value: number) => {
        if (isNaN(value) || value < 0) return;
        if (field === 'newCardsPerDay' && value > 500) value = 500;
        if (field === 'reviewCardsPerDay' && value > 2000) value = 2000;
        setLocalPrefs(p => ({ ...p, [field]: value }));
    };

    if (!isOpen) return null;

    const inputStyle = `w-full p-3 rounded-xl outline-none font-bold text-sm transition-all focus:ring-2 focus:ring-accent/20 focus:border-accent border ${t.inputBg} ${t.inputBorder} ${t.inputText}`;

    return createPortal(
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${t.overlay} animate-in fade-in duration-200`}>
            <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[2rem] overflow-hidden ${t.modal} animate-in zoom-in-95 duration-200`}>
                
                {/* Header */}
                <div className={`flex-none p-6 border-b flex items-center justify-between ${t.headerBorder}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                            <BrainCircuit size={20} />
                        </div>
                        <div>
                            <h2 className={`text-lg font-black uppercase tracking-tight ${t.textPrimary}`}>Algorithm Settings</h2>
                            <p className={`text-xs font-medium ${t.textSecondary}`}>Configure FSRS and Daily Limits</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-xl transition-all ${t.btnCancel}`}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                    
                    {/* 1. PROJECTION SUMMARY */}
                    <div className={`p-5 rounded-2xl border relative overflow-hidden ${t.highlightBg} ${t.highlightBorder}`}>
                        <div className="flex items-center gap-2 mb-4 relative z-10">
                            <Calculator size={16} className="text-blue-500" />
                            <h3 className={`text-xs font-black uppercase tracking-widest ${t.highlightText}`}>Today's Projection</h3>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 relative z-10">
                            {/* Total Due */}
                            <div className="flex flex-col group relative">
                                <div className="flex items-center gap-1">
                                    <span className={`text-[10px] font-bold uppercase opacity-60 ${t.highlightText}`}>Total Due</span>
                                    <HelpCircle size={10} className={`${t.highlightText} opacity-40`} />
                                </div>
                                <span className={`text-xl font-black ${t.textPrimary}`}>
                                    {projection.totalReviewsDue + projection.totalNewAvailable}
                                </span>
                                <span className={`text-[9px] opacity-60 ${t.textPrimary}`}>
                                    {projection.totalReviewsDue} Rev + {projection.totalNewAvailable} New
                                </span>
                                {/* Simple Tooltip via title attribute for now */}
                                <div className="absolute top-0 left-0 w-full h-full cursor-help" title="Total cards available in your decks that are either Due for review or are New (never studied)." />
                            </div>

                            {/* Cards Allowed Today */}
                            <div className="flex flex-col group relative">
                                <div className="flex items-center gap-1">
                                    <span className={`text-[10px] font-bold uppercase opacity-60 ${t.highlightText}`}>Allowed Today</span>
                                    <HelpCircle size={10} className={`${t.highlightText} opacity-40`} />
                                </div>
                                <span className={`text-xl font-black ${t.textPrimary}`}>
                                    {projection.totalAllowedToday}
                                </span>
                                <span className={`text-[9px] opacity-60 ${t.textPrimary}`}>
                                    Limit: {localPrefs.reviewCardsPerDay} Rev / {localPrefs.newCardsPerDay} New
                                </span>
                                <div className="absolute top-0 left-0 w-full h-full cursor-help" title="The actual number of cards you can study today based on your daily limits. If limits are reached, this number stops growing." />
                            </div>

                            {/* Ignite Batch */}
                            <div className={`flex flex-col pl-4 border-l ${isDark ? 'border-blue-500/20' : 'border-blue-200'} group relative`}>
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-bold uppercase opacity-60 text-accent">Ignite Batch</span>
                                    <HelpCircle size={10} className="text-accent opacity-40" />
                                </div>
                                <span className="text-xl font-black text-accent">
                                    {projection.igniteTotal}
                                </span>
                                <span className={`text-[9px] opacity-60 ${t.textPrimary}`}>
                                    Loads: {projection.igniteReviews} Rev + {projection.igniteNew} New
                                </span>
                                <div className="absolute top-0 left-0 w-full h-full cursor-help" title="The exact batch that will load when you click 'Ignite Session'. It respects your daily limits and batch size preference." />
                            </div>
                        </div>
                    </div>

                    {/* 2. DAILY WORKLOAD LIMITS */}
                    <div className={`p-5 rounded-2xl ${t.cardBg} ${t.cardBorder}`}>
                        <div className="flex items-center gap-2 mb-6">
                            <Layers size={16} className="text-accent" />
                            <h3 className={`text-xs font-black uppercase tracking-widest ${t.textPrimary}`}>Daily Workload Limits</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* New Cards */}
                            <div className="space-y-2">
                                <label className={`flex justify-between items-center text-xs font-bold ${t.textPrimary}`}>
                                    New Cards / Day
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${t.chipBg} ${t.chipText} ${t.divider}`}>
                                        Left: {projection.remainingNewAllowance}
                                    </span>
                                </label>
                                <input 
                                    type="number" 
                                    min="0" max="500"
                                    value={localPrefs.newCardsPerDay}
                                    onChange={(e) => handleInputChange('newCardsPerDay', parseInt(e.target.value))}
                                    className={inputStyle}
                                />
                                <p className={`text-[10px] leading-relaxed ${t.textSecondary}`}>
                                    Applies to <strong>never-seen cards</strong> only. Increasing this rapidly increases future review workload.
                                </p>
                            </div>

                            {/* Review Cards */}
                            <div className="space-y-2">
                                <label className={`flex justify-between items-center text-xs font-bold ${t.textPrimary}`}>
                                    Review Limit / Day
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${t.chipBg} ${t.chipText} ${t.divider}`}>
                                        Left: {projection.remainingReviewAllowance}
                                    </span>
                                </label>
                                <input 
                                    type="number" 
                                    min="0" max="2000"
                                    value={localPrefs.reviewCardsPerDay}
                                    onChange={(e) => handleInputChange('reviewCardsPerDay', parseInt(e.target.value))}
                                    className={inputStyle}
                                />
                                <p className={`text-[10px] leading-relaxed ${t.textSecondary}`}>
                                    Caps daily due cards. <strong>Overdue cards are prioritized</strong> first if the limit is too low.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 3. SESSION BATCHING */}
                    <div className={`p-5 rounded-2xl ${t.cardBg} ${t.cardBorder}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <Zap size={16} className="text-accent" />
                            <h3 className={`text-xs font-black uppercase tracking-widest ${t.textPrimary}`}>Ignite Session Batching</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className={`text-xs font-bold ${t.textSecondary}`}>Batch Size (Per Session Cap)</span>
                                <span className="text-sm font-black text-accent">{localPrefs.sessionSize} Cards</span>
                            </div>
                            <input 
                                type="range" min="10" max="100" step="5"
                                value={localPrefs.sessionSize}
                                onChange={(e) => handleInputChange('sessionSize', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-accent"
                            />
                            
                            <div className={`p-3 rounded-xl flex gap-3 border ${t.chipBg} ${t.divider}`}>
                                <Info size={16} className="text-accent shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className={`text-[10px] font-bold ${t.textPrimary}`}>How Ignite Works:</p>
                                    <p className={`text-[10px] leading-relaxed ${t.textSecondary}`}>
                                        Ignite loads a maximum of <strong>{localPrefs.sessionSize} cards</strong> per session. 
                                        Based on your daily limits, the next session will contain: <span className="text-accent font-bold">{projection.igniteReviews} Reviews</span> + <span className="text-accent font-bold">{projection.igniteNew} New</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. ALGORITHM TUNING */}
                    <div className={`p-5 rounded-2xl ${t.cardBg} ${t.cardBorder}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <Target size={16} className="text-accent" />
                            <h3 className={`text-xs font-black uppercase tracking-widest ${t.textPrimary}`}>Memory Algorithm</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className={`text-xs font-bold ${t.textPrimary}`}>Target Retention</label>
                                    <span className="text-xs font-black text-accent">{Math.round(localPrefs.targetRetention * 100)}%</span>
                                </div>
                                <input 
                                    type="range" min="75" max="95" step="1"
                                    value={localPrefs.targetRetention * 100}
                                    onChange={(e) => setLocalPrefs(p => ({ ...p, targetRetention: parseInt(e.target.value) / 100 }))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-accent"
                                />
                                <p className={`text-[10px] mt-2 ${t.textSecondary}`}>
                                    <strong>85% - 92%</strong> is recommended for PNLE prep. 
                                    <br/>Note: Higher retention = significantly more frequent reviews.
                                </p>
                            </div>

                            <div className={`flex items-center justify-between pt-4 border-t border-dashed ${t.divider}`}>
                                <div>
                                    <label className={`block text-xs font-bold ${t.textPrimary}`}>FSRS Fuzzing (Prevents Due-Date Bunching)</label>
                                    <p className={`text-[10px] ${t.textSecondary}`}>Adds small random offsets to intervals so cards don't all pile up on the same day.</p>
                                </div>
                                <button 
                                    onClick={() => setLocalPrefs(p => ({ ...p, enableFuzz: !p.enableFuzz }))}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${localPrefs.enableFuzz ? 'bg-accent' : 'bg-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${localPrefs.enableFuzz ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 5. PNLE OPTIMIZATION */}
                    <div className={`p-5 rounded-2xl border bg-accent/5 border-accent/20`}>
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={16} className="text-accent" />
                            <h3 className={`text-xs font-black uppercase tracking-widest ${t.textPrimary}`}>PNLE – August 2026 Optimization</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className={`block text-xs font-bold ${t.textPrimary}`}>High-Yield Mode</label>
                                    <p className={`text-[10px] ${t.textSecondary}`}>Prioritize "Board Favorite" & "Triage" tags.</p>
                                </div>
                                <button 
                                    onClick={() => setLocalPrefs(p => ({ ...p, highYieldMode: !p.highYieldMode }))}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${localPrefs.highYieldMode ? 'bg-accent' : 'bg-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${localPrefs.highYieldMode ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className={`text-xs font-bold ${t.textPrimary} flex items-center gap-2`}>Exam Countdown Intensity</label>
                                    <span className="text-xs font-bold text-accent">{localPrefs.examCountdownIntensity}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="100" step="10"
                                    value={localPrefs.examCountdownIntensity}
                                    onChange={(e) => setLocalPrefs(p => ({ ...p, examCountdownIntensity: parseInt(e.target.value) }))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-accent"
                                />
                                <p className={`text-[10px] mt-2 ${t.textSecondary}`}>
                                    Applies a <strong>{(1 - localPrefs.examCountdownIntensity / 100 * 0.2).toFixed(2)}x - 1.0x</strong> multiplier to intervals as the exam approaches to ensure peak retention.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className={`flex-none p-4 border-t flex justify-end gap-3 ${t.footerBg} ${t.headerBorder}`}>
                    <button onClick={onClose} className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${t.btnCancel}`}>
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-8 py-3 rounded-xl bg-accent text-white text-xs font-black uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
                        <Save size={14} /> Save Changes
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default StudySettingsModal;