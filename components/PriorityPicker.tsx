
import React from 'react';
import { Category } from '../types';

interface Props {
  selected: Category[];
  onToggle: (cat: Category) => void;
}

const PriorityPicker: React.FC<Props> = ({ selected, onToggle }) => {
  const options = [
    Category.AI_STRATEGY,
    Category.AGENTIC_AI,
    Category.DATA_ANALYTICS,
    Category.CHANGE_MGMT,
    Category.INFRASTRUCTURE,
    Category.HUMAN_CENTRIC
  ];

  return (
    <div className="bg-slate-900 p-6 rounded-2xl mb-8 border border-slate-800">
      <h2 className="text-xl font-bold mb-2">Set Your Focus</h2>
      <p className="text-sm text-slate-400 mb-6">We'll highlight sessions that match your priorities.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map(cat => {
          const isActive = selected.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => onToggle(cat)}
              className={`text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                isActive 
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                : 'border-slate-800 bg-slate-800/50 text-slate-400'
              }`}
            >
              <div className="text-sm font-semibold">{cat}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PriorityPicker;
