
import { Session, Category, UserPreferences, RecommendationType } from './types';

export const parseTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

export const formatTimeRange = (start: string, end: string): string => {
  return `${start} – ${end}`;
};

export const getRecommendation = (session: Session, prefs: UserPreferences): RecommendationType => {
  if (session.type === 'Break') return 'optional';
  
  const hasPriorityMatch = session.categories.some(cat => prefs.priorities.includes(cat));
  const isHighRelevance = session.relevance >= 4;

  if (hasPriorityMatch && session.relevance === 5) return 'must-attend';
  if (hasPriorityMatch || isHighRelevance) return 'optional';
  return 'skip';
};

export const checkConflict = (session: Session, savedSessions: Session[]): Session | null => {
  const start = parseTime(session.startTime);
  const end = parseTime(session.endTime);

  for (const saved of savedSessions) {
    if (saved.id === session.id || saved.day !== session.day) continue;
    const sStart = parseTime(saved.startTime);
    const sEnd = parseTime(saved.endTime);

    // Overlap check
    if (start < sEnd && end > sStart) {
      return saved;
    }
  }
  return null;
};

// Simulate time logic for Feb 4-5, 2026
// For testing/offline purposes, we allow a "current day/time" state
export const getCurrentConferenceTime = (simulatedDate?: Date) => {
  const now = simulatedDate || new Date();
  const day1 = new Date('2026-02-04').toDateString();
  const day2 = new Date('2026-02-05').toDateString();
  const today = now.toDateString();

  let day = 1;
  if (today === day2) day = 2;
  else if (today === day1) day = 1;
  else day = 1; // Default to Day 1 for demo

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  return { day, time: `${hours}:${minutes}` };
};
