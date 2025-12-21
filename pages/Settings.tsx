import React from 'react';
import { UserSettings } from '../types';
import { LogOut } from 'lucide-react';

interface SettingsProps {
  user: UserSettings;
  onUpdateUser: (u: UserSettings) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onLogout }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Preferences</h2>
      
      <div className="glass-panel p-6 rounded-2xl space-y-8">
        {/* Learning Style */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Learning Style</h3>
          <p className="text-sm text-text-muted mb-4">
            We'll adapt the interface suggestions based on your preferred style.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {['visual', 'auditory', 'read-write', 'kinesthetic'].map(style => (
              <div 
                key={style}
                onClick={() => onUpdateUser({...user, learningStyle: style as any})}
                className={`
                  p-4 rounded-xl border-2 cursor-pointer capitalize text-center transition-all
                  ${user.learningStyle === style ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-white/5'}
                `}
              >
                {style}
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Accessibility</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <span>Reduce Motion</span>
               <button 
                 onClick={() => onUpdateUser({...user, accessibility: {...user.accessibility, reduceMotion: !user.accessibility.reduceMotion}})}
                 className={`w-12 h-6 rounded-full p-1 transition-colors ${user.accessibility.reduceMotion ? 'bg-primary' : 'bg-gray-600'}`}
               >
                 <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${user.accessibility.reduceMotion ? 'translate-x-6' : ''}`}></div>
               </button>
            </div>
            <div>
              <span className="block mb-2">Font Scale</span>
              <input 
                type="range" min="0.8" max="1.5" step="0.1"
                value={user.accessibility.fontScale}
                onChange={(e) => onUpdateUser({...user, accessibility: {...user.accessibility, fontScale: parseFloat(e.target.value)}})}
                className="w-full accent-primary"
              />
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="pt-6 border-t border-border space-y-4">
          <h3 className="text-lg font-semibold text-text-muted">Account</h3>
          
          <button className="w-full py-3 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white transition-all">
            Connect Supabase Account (Coming Soon)
          </button>

          <button 
            onClick={onLogout}
            className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
          >
            <LogOut size={18} className="mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;