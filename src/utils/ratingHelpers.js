import { RATING_PERFORMANCE, RATING_FLAG } from '../constants/enums.js';

/** Map percentage to performance band (industrial default bands) */
export function performanceFromPercentage(percentage) {
  if (percentage >= 90) return 'excellent';
  if (percentage >= 80) return 'very_good';
  if (percentage >= 70) return 'good';
  if (percentage >= 60) return 'satisfactory';
  if (percentage >= 40) return 'needs_improvement';
  return 'unsatisfactory';
}

/** Auto-flag from performance for parent/teacher dashboards */
export function flagFromPerformance(performance) {
  switch (performance) {
    case 'excellent':
    case 'very_good':
      return 'excellence';
    case 'good':
    case 'satisfactory':
      return 'on_track';
    case 'needs_improvement':
      return 'improvement_needed';
    case 'unsatisfactory':
      return 'concern';
    default:
      return 'normal';
  }
}

export function validateRatingPayload(data) {
  if (data.score > data.maxScore) {
    throw new Error('score cannot exceed maxScore');
  }
  if (data.performance && !RATING_PERFORMANCE.includes(data.performance)) {
    throw new Error('invalid performance');
  }
  if (data.flag && !RATING_FLAG.includes(data.flag)) {
    throw new Error('invalid flag');
  }
}

export function normalizeRatedDate(dateInput) {
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  return d;
}
