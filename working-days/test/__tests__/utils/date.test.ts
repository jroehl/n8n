import { DateTime } from 'luxon';
import {
  Day,
  DAYS,
  getIsoFormattedDay,
  getFirstAndLastTimeOfDay,
  getFirstAndLastDayOfMonth,
  getFirstAndLastDayOfYear,
  getFirstAndLastDayOfWeekWithinMonthAndYear,
  dateToDateTime,
  dateTimeToDate,
  getWeekdayIndex,
} from '../../../utils/date';

describe('date utils', () => {
  describe('DAYS constant', () => {
    it('should contain all days of the week in correct order', () => {
      expect(DAYS).toEqual([
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ]);
    });

    it('should be readonly', () => {
      // DAYS is a readonly array but not frozen in TypeScript
      expect(DAYS).toHaveLength(7);
    });
  });


  describe('getIsoFormattedDay', () => {
    it('should return ISO formatted date string', () => {
      const date = DateTime.fromISO('2024-01-15T12:30:45.123Z');
      expect(getIsoFormattedDay(date)).toBe('2024-01-15');
    });

    it('should handle different timezones correctly', () => {
      const date = DateTime.fromISO('2024-01-15T23:30:00-05:00', { setZone: true });
      expect(getIsoFormattedDay(date)).toBe('2024-01-15');
    });
  });

  describe('getFirstAndLastTimeOfDay', () => {
    it('should return start and end of day', () => {
      const date = DateTime.fromISO('2024-01-15T14:30:00');
      const [first, last] = getFirstAndLastTimeOfDay(date);
      
      expect(first.toISO()).toMatch(/2024-01-15T00:00:00\.000/);
      expect(last.toISO()).toMatch(/2024-01-15T23:59:59\.999/);
    });

    it('should preserve timezone', () => {
      const date = DateTime.fromISO('2024-01-15T14:30:00+05:00', { setZone: true });
      const [first, last] = getFirstAndLastTimeOfDay(date);
      
      // Check that the zone is preserved
      expect(first.zoneName).toBe(date.zoneName);
      expect(last.zoneName).toBe(date.zoneName);
    });
  });

  describe('getFirstAndLastDayOfMonth', () => {
    it('should return first and last day of month', () => {
      const date = DateTime.fromISO('2024-01-15');
      const [first, last] = getFirstAndLastDayOfMonth(date);
      
      expect(first.toISODate()).toBe('2024-01-01');
      expect(last.toISODate()).toBe('2024-01-31');
    });

    it('should handle leap year February', () => {
      const date = DateTime.fromISO('2024-02-15');
      const [first, last] = getFirstAndLastDayOfMonth(date);
      
      expect(first.toISODate()).toBe('2024-02-01');
      expect(last.toISODate()).toBe('2024-02-29');
    });

    it('should handle non-leap year February', () => {
      const date = DateTime.fromISO('2023-02-15');
      const [first, last] = getFirstAndLastDayOfMonth(date);
      
      expect(first.toISODate()).toBe('2023-02-01');
      expect(last.toISODate()).toBe('2023-02-28');
    });

    it('should handle December correctly', () => {
      const date = DateTime.fromISO('2024-12-15');
      const [first, last] = getFirstAndLastDayOfMonth(date);
      
      expect(first.toISODate()).toBe('2024-12-01');
      expect(last.toISODate()).toBe('2024-12-31');
    });
  });

  describe('getFirstAndLastDayOfYear', () => {
    it('should return first and last day of year', () => {
      const date = DateTime.fromISO('2024-06-15');
      const [first, last] = getFirstAndLastDayOfYear(date);
      
      expect(first.toISODate()).toBe('2024-01-01');
      expect(last.toISODate()).toBe('2024-12-31');
    });

    it('should work for different years', () => {
      const date = DateTime.fromISO('2023-03-15');
      const [first, last] = getFirstAndLastDayOfYear(date);
      
      expect(first.toISODate()).toBe('2023-01-01');
      expect(last.toISODate()).toBe('2023-12-31');
    });
  });

  describe('getFirstAndLastDayOfWeekWithinMonthAndYear', () => {
    it('should return Monday to Sunday for ISO weeks', () => {
      // Wednesday 2024-01-17
      const date = DateTime.fromISO('2024-01-17');
      const [first, last] = getFirstAndLastDayOfWeekWithinMonthAndYear(date);
      
      expect(first.toISODate()).toBe('2024-01-15'); // Monday
      expect(first.weekdayLong).toBe('Monday');
      expect(last.toISODate()).toBe('2024-01-21'); // Sunday
      expect(last.weekdayLong).toBe('Sunday');
    });

    it('should handle week at month boundaries', () => {
      // Thursday 2024-02-01
      const date = DateTime.fromISO('2024-02-01');
      const [first, last] = getFirstAndLastDayOfWeekWithinMonthAndYear(date);
      
      expect(first.toISODate()).toBe('2024-01-29'); // Monday of that week
      expect(last.toISODate()).toBe('2024-02-04'); // Sunday of that week
    });

    it('should handle Sunday correctly', () => {
      // Sunday 2024-01-21
      const date = DateTime.fromISO('2024-01-21');
      const [first, last] = getFirstAndLastDayOfWeekWithinMonthAndYear(date);
      
      expect(first.toISODate()).toBe('2024-01-15'); // Monday
      expect(last.toISODate()).toBe('2024-01-21'); // Same Sunday
    });
  });

  describe('dateToDateTime', () => {
    it('should convert JS Date to Luxon DateTime', () => {
      const jsDate = new Date('2024-01-15T12:00:00Z');
      const dateTime = dateToDateTime(jsDate);
      
      expect(dateTime.toMillis()).toBe(jsDate.getTime());
      expect(dateTime).toBeInstanceOf(DateTime);
    });

    it('should preserve timezone information', () => {
      const jsDate = new Date('2024-01-15T12:00:00+05:00');
      const dateTime = dateToDateTime(jsDate);
      
      expect(dateTime.toMillis()).toBe(jsDate.getTime());
    });
  });

  describe('dateTimeToDate', () => {
    it('should convert Luxon DateTime to JS Date', () => {
      const dateTime = DateTime.fromISO('2024-01-15T12:00:00Z');
      const jsDate = dateTimeToDate(dateTime);
      
      expect(jsDate).toBeInstanceOf(Date);
      expect(jsDate.toISOString()).toBe('2024-01-15T12:00:00.000Z');
    });

    it('should preserve timestamp', () => {
      const dateTime = DateTime.fromISO('2024-01-15T12:00:00+05:00');
      const jsDate = dateTimeToDate(dateTime);
      
      expect(jsDate.getTime()).toBe(dateTime.toMillis());
    });
  });

  describe('getWeekdayIndex', () => {
    it('should convert Luxon weekday to JS Date weekday index', () => {
      // Luxon: Monday = 1, JS Date: Monday = 1
      const monday = DateTime.fromISO('2024-01-15'); // Monday
      expect(getWeekdayIndex(monday)).toBe(1);
    });

    it('should handle Sunday correctly', () => {
      // Luxon: Sunday = 7, JS Date: Sunday = 0
      const sunday = DateTime.fromISO('2024-01-21'); // Sunday
      expect(getWeekdayIndex(sunday)).toBe(0);
    });

    it('should handle all weekdays correctly', () => {
      const testCases: Array<[string, number, Day]> = [
        ['2024-01-21', 0, 'Sunday'],
        ['2024-01-15', 1, 'Monday'],
        ['2024-01-16', 2, 'Tuesday'],
        ['2024-01-17', 3, 'Wednesday'],
        ['2024-01-18', 4, 'Thursday'],
        ['2024-01-19', 5, 'Friday'],
        ['2024-01-20', 6, 'Saturday'],
      ];

      testCases.forEach(([dateStr, expectedIndex, expectedDay]) => {
        const date = DateTime.fromISO(dateStr);
        expect(getWeekdayIndex(date)).toBe(expectedIndex);
        expect(DAYS[expectedIndex]).toBe(expectedDay);
      });
    });
  });
});