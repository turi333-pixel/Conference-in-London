
import React, { useState, useEffect, useMemo } from 'react';
import { AGENDA } from './agendaData';
import { Session, Category, UserPreferences, SessionType } from './types';
import { getCurrentConferenceTime, parseTime, getRecommendation } from './utils';
import SessionCard from './components/SessionCard';
import PriorityPicker from './components/PriorityPicker';

const App: React.FC = () => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [view, setView] = useState<'timeline' | 'agenda' | 'recap' | 'settings'>('timeline');
  const [filter, setFilter] = useState<'all' | 'ai-heavy' | 'technical' | 'panels'>('all');
  
  // Simulated time for demo purposes (default: starting morning of Day 1)
  const [simulatedTime, setSimulatedTime] = useState<string>('09:00');
  
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('dtx_prefs');
    return saved ? JSON.parse(saved) : {
      priorities: [Category.AI_STRATEGY, Category.AGENTIC_AI],
      savedSessions: [],
      completedSessions: []
    };
  });

  useEffect(() => {
    localStorage.setItem('dtx_prefs', JSON.stringify(prefs));
  }, [prefs]);

  const togglePriority = (cat: Category) => {
    setPrefs(prev => ({
      ...prev,
      priorities: prev.priorities.includes(cat)
        ? prev.priorities.filter(c => c !== cat)
        : [...prev.priorities, cat]
    }));
  };

  const toggleSaveSession = (id: string) => {
    setPrefs(prev => ({
      ...prev,
      savedSessions: prev.savedSessions.includes(id)
        ? prev.savedSessions.filter(sid => sid !== id)
        : [...prev.savedSessions, id]
    }));
  };

  const savedSessionsData = useMemo(() => 
    AGENDA.filter(s => prefs.savedSessions.includes(s.id)), 
    [prefs.savedSessions]
  );

  const filteredAgenda = useMemo(() => {
    return AGENDA.filter(s => {
      if (s.day !== activeDay) return false;
      if (filter === 'ai-heavy') return s.relevance >= 4;
      if (filter === 'technical') return s.categories.includes(Category.INFRASTRUCTURE) || s.categories.includes(Category.DATA_ANALYTICS);
      if (filter === 'panels') return s.type === SessionType.PANEL;
      return true;
    });
  }, [activeDay, filter]);

  const findWhatNext = () => {
    const nowMinutes = parseTime(simulatedTime);
    const potential = AGENDA.filter(s => {
      const start = parseTime(s.startTime);
      return s.day === activeDay && start >= nowMinutes;
    }).sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));

    const recommended = potential.find(s => getRecommendation(s, prefs) === 'must-attend');
    return recommended || potential[0];
  };

  const whatNext = findWhatNext();

  const renderTimeline = () => (
    <div className="px-4 pb-24">
      {/* Integrated Next Recommendation Spotlight */}
      {whatNext && filter === 'all' && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Smart Recommendation</span>
            </div>
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className="text-white font-bold leading-tight mb-1">{whatNext.title}</h4>
                <p className="text-xs text-slate-400">{whatNext.startTime} • {whatNext.venue}</p>
              </div>
              <button 
                onClick={() => toggleSaveSession(whatNext.id)}
                className={`flex-shrink-0 text-[10px] font-black py-1.5 px-4 rounded-lg transition-all ${
                  prefs.savedSessions.includes(whatNext.id)
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                }`}
              >
                {prefs.savedSessions.includes(whatNext.id) ? 'SAVED' : 'ADD TO AGENDA'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 sticky top-0 py-4 bg-slate-950/90 backdrop-blur z-20 overflow-x-auto scroll-hide">
        <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${filter === 'all' ? 'bg-indigo-600 border-indigo-600' : 'border-slate-700 text-slate-400'}`}>All</button>
        <button onClick={() => setFilter('ai-heavy')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${filter === 'ai-heavy' ? 'bg-indigo-600 border-indigo-600' : 'border-slate-700 text-slate-400'}`}>🔥 AI Heavy</button>
        <button onClick={() => setFilter('panels')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${filter === 'panels' ? 'bg-indigo-600 border-indigo-600' : 'border-slate-700 text-slate-400'}`}>🎙️ Panels</button>
        <button onClick={() => setFilter('technical')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${filter === 'technical' ? 'bg-indigo-600 border-indigo-600' : 'border-slate-700 text-slate-400'}`}>⚙️ Technical</button>
      </div>

      {filteredAgenda.map(session => (
        <SessionCard 
          key={session.id} 
          session={session} 
          prefs={prefs} 
          onToggleSave={toggleSaveSession}
          savedSessions={savedSessionsData}
        />
      ))}
    </div>
  );

  const renderAgenda = () => (
    <div className="px-4 pb-24">
      <h2 className="text-2xl font-bold mb-6">Your Agenda</h2>
      {savedSessionsData.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 border-dashed">
          <p className="text-slate-500 mb-4">You haven't saved any sessions yet.</p>
          <button onClick={() => setView('timeline')} className="text-indigo-400 font-bold border-b border-indigo-400">Explore Timeline</button>
        </div>
      ) : (
        savedSessionsData.sort((a,b) => {
          if (a.day !== b.day) return a.day - b.day;
          return parseTime(a.startTime) - parseTime(b.startTime);
        }).map(session => (
          <div key={session.id} className="relative mb-8">
             <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-emerald-500/30"></div>
             <div className="pl-4">
                <span className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase mb-1 block">Day {session.day} • {session.startTime}</span>
                <SessionCard 
                  session={session} 
                  prefs={prefs} 
                  onToggleSave={toggleSaveSession}
                  savedSessions={savedSessionsData}
                />
             </div>
          </div>
        ))
      )}
    </div>
  );

  const renderRecap = () => {
    const daySessions = AGENDA.filter(s => s.day === activeDay);
    const highValueSessions = daySessions.filter(s => s.relevance === 5);
    const attendedHighValue = highValueSessions.filter(s => prefs.savedSessions.includes(s.id));
    const missedHighValue = highValueSessions.filter(s => !prefs.savedSessions.includes(s.id));

    return (
      <div className="px-4 pb-24">
        <h2 className="text-2xl font-bold mb-2">Day {activeDay} Recap</h2>
        <p className="text-slate-400 mb-8">Summary of high-value AI sessions today.</p>

        <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-3xl mb-6">
           <h3 className="font-bold text-emerald-400 mb-4">Completed Must-Attends</h3>
           {attendedHighValue.length > 0 ? (
             <ul className="space-y-3">
               {attendedHighValue.map(s => <li key={s.id} className="text-sm">✅ {s.title}</li>)}
             </ul>
           ) : (
             <p className="text-sm text-slate-500 italic">No high-value sessions saved for today.</p>
           )}
        </div>

        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-3xl">
           <h3 className="font-bold text-red-400 mb-4">Missed High-Value Opportunities</h3>
           {missedHighValue.length > 0 ? (
             <ul className="space-y-3">
               {missedHighValue.map(s => <li key={s.id} className="text-sm">⚠️ {s.title}</li>)}
             </ul>
           ) : (
             <p className="text-sm text-slate-500 italic">You hit all the key sessions! Great job.</p>
           )}
        </div>

        <div className="mt-8 text-center">
           <p className="text-sm text-slate-500 mb-4">Ready for Day {activeDay === 1 ? 2 : 'Finished'}?</p>
           {activeDay === 1 && (
             <button onClick={() => setActiveDay(2)} className="bg-indigo-600 px-8 py-3 rounded-2xl font-bold">Prepare for Day 2</button>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-slate-950 min-h-screen relative shadow-2xl overflow-x-hidden">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 uppercase">DTX LONDON</h1>
            <p className="text-[10px] font-bold tracking-[.3em] text-slate-500 uppercase">Olympia • Feb 2026</p>
          </div>
          <button 
            onClick={() => setView('settings')}
            className={`p-2 rounded-full border transition-all ${view === 'settings' ? 'bg-white border-white text-black' : 'border-slate-800 text-slate-500'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>
        </div>

        {view === 'timeline' && (
          <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
            <button 
              onClick={() => setActiveDay(1)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeDay === 1 ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}
            >
              DAY 1 (4 Feb)
            </button>
            <button 
              onClick={() => setActiveDay(2)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${activeDay === 2 ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}
            >
              DAY 2 (5 Feb)
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="min-h-[70vh]">
        {view === 'timeline' && renderTimeline()}
        {view === 'agenda' && renderAgenda()}
        {view === 'recap' && renderRecap()}
        {view === 'settings' && (
          <div className="px-6">
            <PriorityPicker selected={prefs.priorities} onToggle={togglePriority} />
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 mb-8">
               <h3 className="font-bold mb-4">Simulate Time (App Preview)</h3>
               <input 
                  type="time" 
                  value={simulatedTime} 
                  onChange={(e) => setSimulatedTime(e.target.value)}
                  className="bg-slate-800 text-white p-3 rounded-xl w-full border border-slate-700 outline-none focus:border-indigo-500"
               />
               <p className="text-[10px] text-slate-500 mt-2">Adjust to see "Smart Recommendation" card update in real-time.</p>
            </div>
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-950/95 backdrop-blur-md border-t border-slate-800 flex justify-around items-center h-20 px-6 z-50">
        <button 
          onClick={() => setView('timeline')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'timeline' ? 'text-indigo-500' : 'text-slate-500'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <span className="text-[10px] font-bold uppercase">Timeline</span>
        </button>
        <button 
          onClick={() => setView('agenda')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'agenda' ? 'text-emerald-500' : 'text-slate-500'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
          <span className="text-[10px] font-bold uppercase">Agenda</span>
        </button>
        <button 
          onClick={() => setView('recap')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'recap' ? 'text-orange-500' : 'text-slate-500'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          <span className="text-[10px] font-bold uppercase">Recap</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
