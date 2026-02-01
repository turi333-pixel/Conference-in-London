
import React from 'react';
import { Session, Category, UserPreferences, RecommendationType } from '../types';
import { getRecommendation, formatTimeRange, checkConflict } from '../utils';

interface Props {
  session: Session;
  prefs: UserPreferences;
  onToggleSave: (id: string) => void;
  savedSessions: Session[];
}

const SessionCard: React.FC<Props> = ({ session, prefs, onToggleSave, savedSessions }) => {
  const rec = getRecommendation(session, prefs);
  const isSaved = prefs.savedSessions.includes(session.id);
  const conflict = checkConflict(session, savedSessions);
  const isConflictWarning = conflict && !isSaved;

  const getRecStyles = (type: RecommendationType) => {
    switch (type) {
      case 'must-attend': return 'border-orange-500 bg-orange-500/10 text-orange-400';
      case 'optional': return 'border-blue-500 bg-blue-500/10 text-blue-400';
      case 'skip': return 'border-slate-700 bg-slate-900/50 text-slate-500';
    }
  };

  const getRelevanceStars = (count: number) => {
    return '⭐'.repeat(count);
  };

  return (
    <div 
      className={`relative p-4 mb-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
        isSaved ? 'border-emerald-500 bg-emerald-500/5' : getRecStyles(rec)
      } ${isConflictWarning ? 'ring-2 ring-red-500/50' : ''}`}
      onClick={() => onToggleSave(session.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold uppercase tracking-wider opacity-80">
          {formatTimeRange(session.startTime, session.endTime)} • {session.venue}
        </span>
        <div className="flex items-center gap-2">
           {session.isCoLocated && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold uppercase">Co-Located</span>
           )}
           <span className="text-sm">{getRelevanceStars(session.relevance)}</span>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-1 leading-tight group-hover:text-white transition-colors">
        {session.title}
      </h3>
      
      {session.speakers.length > 0 && (
        <p className="text-sm text-slate-400 mb-3 italic">
          {session.speakers.join(' + ')}
        </p>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {session.categories.map(cat => (
          <span key={cat} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {cat}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-2">
           {rec === 'must-attend' && (
             <span className="text-[10px] font-black uppercase text-orange-500 animate-pulse">🔥 Must Attend</span>
           )}
           {isSaved && (
             <span className="text-[10px] font-black uppercase text-emerald-500">✓ Saved to Agenda</span>
           )}
        </div>
        <button 
          className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-colors ${
            isSaved 
            ? 'bg-emerald-500 border-emerald-500 text-white' 
            : 'border-current hover:bg-white/10'
          }`}
        >
          {isSaved ? 'Remove' : 'Add to Agenda'}
        </button>
      </div>

      {isConflictWarning && (
        <div className="mt-3 p-2 bg-red-500/20 border border-red-500/50 rounded text-[10px] text-red-200">
          ⚠️ Conflicts with: {conflict.title} ({conflict.startTime})
        </div>
      )}
    </div>
  );
};

export default SessionCard;
