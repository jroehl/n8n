import { DateTime } from 'luxon';

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

export function getTimeZoneOffset(date: DateTime): number {
  // Luxon automatically handles timezone offsets
  return date.offset / 60;
}

export function getIsoFormattedDay(date: DateTime): string {
  return date.toISODate()!;
}

export function getFirstAndLastTimeOfDay(date: DateTime): [DateTime, DateTime] {
  const firstTime = date.startOf('day');
  const lastTime = date.endOf('day');
  return [firstTime, lastTime];
}

export function getFirstAndLastDayOfMonth(date: DateTime): [DateTime, DateTime] {
  const firstDay = date.startOf('month');
  const lastDay = date.endOf('month').startOf('day');
  return [firstDay, lastDay];
}

export function getFirstAndLastDayOfYear(date: DateTime): [DateTime, DateTime] {
  const firstDay = date.startOf('year');
  const lastDay = date.endOf('year').startOf('day');
  return [firstDay, lastDay];
}

export function getFirstAndLastDayOfWeekWithinMonthAndYear(date: DateTime): [DateTime, DateTime] {
  // Luxon uses ISO weeks (Monday = 1, Sunday = 7)
  const startOfWeek = date.startOf('week');
  const endOfWeek = date.endOf('week').startOf('day');
  
  return [startOfWeek, endOfWeek];
}

// Helper function to convert JS Date to Luxon DateTime
export function dateToDateTime(date: Date): DateTime {
  return DateTime.fromJSDate(date);
}

// Helper function to convert Luxon DateTime to JS Date
export function dateTimeToDate(dateTime: DateTime): Date {
  return dateTime.toJSDate();
}

// Helper function to get weekday index (0 = Sunday, 6 = Saturday) for compatibility
export function getWeekdayIndex(date: DateTime): number {
  // Luxon: Monday = 1, Sunday = 7
  // JS Date: Sunday = 0, Monday = 1
  return date.weekday === 7 ? 0 : date.weekday;
}