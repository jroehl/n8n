export type Day = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export const DAYS: readonly Day[] = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
] as const;

export function getTimeZoneOffset(date: Date): number {
  return date.getTimezoneOffset() / 60;
}

export function getIsoFormattedDay(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getFirstAndLastTimeOfDay(date: Date): [Date, Date] {
  const firstTime = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0, 0, 0, 0
  );
  const lastTime = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23, 59, 59, 999
  );
  return [firstTime, lastTime];
}

export function getFirstAndLastDayOfMonth(date: Date): [Date, Date] {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return [firstDay, lastDay];
}

export function getFirstAndLastDayOfYear(date: Date): [Date, Date] {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const lastDay = new Date(date.getFullYear(), 11, 31);
  return [firstDay, lastDay];
}

export function getFirstAndLastDayOfWeekWithinMonthAndYear(date: Date): [Date, Date] {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate the start of the week (Monday)
  const startOfWeek = new Date(date);
  const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  
  // Calculate the end of the week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return [startOfWeek, endOfWeek];
}