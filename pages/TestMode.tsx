import React, { useState } from 'react';
import { Question } from '../types';
import { Timer, AlertTriangle, Check, X } from 'lucide-react';

interface TestModeProps {
  questions: Question[];
}

const TestMode: React.FC<TestModeProps> = ({ questions }) => {
  const [activeTab, setActiveTab] = useState<'setup' | 'quiz' | 'results'>('setup');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [showRationale, setShowRationale] = useState(false);

  // Setup state
  const [config, setConfig] = useState({
    count: 10,
    categories: ['Fundamentals'],
    mode: 'timed'
  });

  const startQuiz = () => {
    setActiveTab('quiz');
    setCurrentQIndex(0);
    setScore(0);
    setSelectedOptions([]);
    setShowRationale(false);
  };

  const currentQ = questions[currentQIndex % questions.length]; // Modulo for mock demo

  const handleOptionClick = (idx: number) => {
    if (showRationale) return; // Prevent changing after submit

    if (currentQ.type === 'mcq') {
      setSelectedOptions([idx]);
    } else {
      // SATA logic
      if (selectedOptions.includes(idx)) {
        setSelectedOptions(selectedOptions.filter(i => i !== idx));
      } else {
        setSelectedOptions([...selectedOptions, idx]);
      }
    }
  };

  const handleSubmitAnswer = () => {
    setShowRationale(true);
    
    // Simple grading logic
    const isCorrect = 
      selectedOptions.length === currentQ.correctIndices.length &&
      selectedOptions.every(val => currentQ.correctIndices.includes(val));
    
    if (isCorrect) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQIndex < config.count - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOptions([]);
      setShowRationale(false);
    } else {
      setActiveTab('results');
    }
  };

  // Render Setup
  if (activeTab === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <h2 className="text-3xl font-bold">Generate Question Bank</h2>
        
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Subject Areas</label>
            <div className="flex flex-wrap gap-2">
              {['Fundamentals', 'Med-Surg', 'OB', 'Pedia', 'Psych'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setConfig({...config, categories: [cat]})} // Mock single select for now
                  className={`px-4 py-2 rounded-xl text-sm border transition-all ${config.categories.includes(cat) ? 'bg-primary text-white border-primary' : 'border-border hover:bg-white/5'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium mb-2">Number of Questions</label>
             <input 
               type="range" min="5" max="50" step="5" 
               value={config.count}
               onChange={(e) => setConfig({...config, count: parseInt(e.target.value)})}
               className="w-full accent-primary"
             />
             <div className="text-right text-sm text-text-muted mt-1">{config.count} Questions</div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-border">
            <div className="flex items-center">
              <Timer className="mr-3 text-accent" />
              <div>
                <div className="font-medium">Timed Mode</div>
                <div className="text-xs text-text-muted">Simulate actual exam pressure (1.5m per item)</div>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${config.mode === 'timed' ? 'bg-primary' : 'bg-gray-600'}`} onClick={() => setConfig({...config, mode: config.mode === 'timed' ? 'untimed' : 'timed'})}>
               <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${config.mode === 'timed' ? 'translate-x-6' : ''}`}></div>
            </div>
          </div>

          <button onClick={startQuiz} className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]">
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  // Render Results
  if (activeTab === 'results') {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-6 rounded-full bg-surface border-4 border-primary mb-6">
          <span className="text-4xl font-bold">{Math.round((score / config.count) * 100)}%</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Exam Completed</h2>
        <p className="text-text-muted mb-8">You got {score} out of {config.count} correct.</p>
        <button onClick={() => setActiveTab('setup')} className="btn-primary bg-primary text-white px-6 py-2 rounded-xl">Back to Generator</button>
      </div>
    );
  }

  // Render Quiz
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-mono text-text-muted">Question {currentQIndex + 1} of {config.count}</span>
        {config.mode === 'timed' && (
          <div className="flex items-center text-red-400 text-sm font-mono bg-red-500/10 px-3 py-1 rounded-lg">
            <Timer size={14} className="mr-2" />
            14:32
          </div>
        )}
      </div>

      <div className="glass-panel p-8 rounded-2xl mb-6">
        <div className="flex items-start mb-6">
          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold mr-3 mt-1">{currentQ.category}</span>
          <h3 className="text-xl font-medium leading-relaxed">{currentQ.text}</h3>
        </div>

        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOptions.includes(idx);
            const isCorrect = currentQ.correctIndices.includes(idx);
            
            let borderClass = 'border-border';
            let bgClass = 'hover:bg-white/5';

            if (showRationale) {
              if (isCorrect) {
                borderClass = 'border-green-500';
                bgClass = 'bg-green-500/10';
              } else if (isSelected && !isCorrect) {
                borderClass = 'border-red-500';
                bgClass = 'bg-red-500/10';
              }
            } else if (isSelected) {
              borderClass = 'border-primary';
              bgClass = 'bg-primary/10';
            }

            return (
              <div 
                key={idx}
                onClick={() => handleOptionClick(idx)}
                className={`
                  p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center
                  ${borderClass} ${bgClass}
                `}
              >
                <div className={`
                  w-6 h-6 rounded-full border flex items-center justify-center mr-4
                  ${isSelected ? 'bg-primary border-primary text-white' : 'border-text-muted'}
                `}>
                  {showRationale && isCorrect ? <Check size={14} /> : showRationale && isSelected && !isCorrect ? <X size={14} /> : String.fromCharCode(65 + idx)}
                </div>
                <span>{opt}</span>
              </div>
            );
          })}
        </div>
      </div>

      {showRationale && (
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-accent mb-6 bg-accent/5 animate-in fade-in slide-in-from-bottom-4">
          <h4 className="font-bold text-accent mb-2 flex items-center">
            <AlertTriangle size={18} className="mr-2" />
            Rationale
          </h4>
          <p className="text-text-muted leading-relaxed">{currentQ.rationale}</p>
        </div>
      )}

      <div className="flex justify-end">
        {!showRationale ? (
          <button 
            onClick={handleSubmitAnswer}
            disabled={selectedOptions.length === 0}
            className="bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-all"
          >
            Submit Answer
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center"
          >
            Next Question
            <ArrowRightIcon className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

const ArrowRightIcon = ({className}:{className?: string}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);

export default TestMode;
