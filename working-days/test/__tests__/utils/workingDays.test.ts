import { DateTime } from 'luxon';
import {
  getStats,
  getWorkingDaysStats,
  dateToDateTime,
  dateTimeToDate,
  HttpRequestHelper,
  WorkingDaysResponse,
  WorkingDaysResponseWithRemaining,
} from '../../../utils/workingDays';
import { Day } from '../../../utils/date';

// Mock HTTP request helper
const createMockHttpRequestHelper = (mockResponse: any): HttpRequestHelper => ({
  httpRequest: jest.fn().mockResolvedValue(mockResponse),
});

describe('workingDays utils', () => {
  describe('getStats', () => {
    const workingDays: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    it('should calculate correct statistics for a date range', () => {
      const holidays = [
        { date: DateTime.fromISO('2024-01-01'), name: 'New Year' },
        { date: DateTime.fromISO('2024-01-06'), name: 'Epiphany' },
      ];
      
      const fromDate = DateTime.fromISO('2024-01-01');
      const toDate = DateTime.fromISO('2024-01-07');
      
      const stats = getStats(holidays, fromDate, toDate, workingDays);
      
      expect(stats.totals.holidays).toBe(2);
      expect(stats.totals.workingDays).toBe(5); // Jan 1-5, 7 days includes Mon-Fri
      expect(stats.totals.workingDaysExcludingPublicHolidays).toBe(4); // Jan 1 is holiday, so 4 days
      expect(stats.holidays.total).toBe(2);
      expect(stats.workingDays.total).toBe(5);
    });

    it('should handle empty holidays array', () => {
      const holidays: any[] = [];
      const fromDate = DateTime.fromISO('2024-01-01');
      const toDate = DateTime.fromISO('2024-01-07');
      
      const stats = getStats(holidays, fromDate, toDate, workingDays);
      
      expect(stats.totals.holidays).toBe(0);
      expect(stats.totals.workingDays).toBe(5); // Jan 1-5 (Mon-Fri)
      expect(stats.totals.workingDaysExcludingPublicHolidays).toBe(5);
    });

    it('should handle weekends correctly', () => {
      const holidays: any[] = [];
      const fromDate = DateTime.fromISO('2024-01-06'); // Saturday
      const toDate = DateTime.fromISO('2024-01-07'); // Sunday
      
      const stats = getStats(holidays, fromDate, toDate, workingDays);
      
      expect(stats.totals.workingDays).toBe(0);
      expect(stats.totals.workingDaysExcludingPublicHolidays).toBe(0);
    });

    it('should count holidays falling on weekends', () => {
      const holidays = [
        { date: DateTime.fromISO('2024-01-06'), name: 'Epiphany' }, // Saturday
      ];
      const fromDate = DateTime.fromISO('2024-01-01');
      const toDate = DateTime.fromISO('2024-01-07');
      
      const stats = getStats(holidays, fromDate, toDate, workingDays);
      
      expect(stats.totals.holidays).toBe(1);
      expect(stats.holidays.days[0].day).toBe('Saturday');
    });

    it('should include custom working days', () => {
      const customWorkingDays: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const holidays: any[] = [];
      const fromDate = DateTime.fromISO('2024-01-01');
      const toDate = DateTime.fromISO('2024-01-07');
      
      const stats = getStats(holidays, fromDate, toDate, customWorkingDays);
      
      expect(stats.totals.workingDays).toBe(6); // Mon-Sat from Jan 1-7
    });

    it('should handle single day range', () => {
      const holidays = [
        { date: DateTime.fromISO('2024-01-01'), name: 'New Year' },
      ];
      const date = DateTime.fromISO('2024-01-01');
      
      const stats = getStats(holidays, date, date, workingDays);
      
      expect(stats.totals.holidays).toBe(1);
      expect(stats.totals.workingDays).toBe(1); // Monday
      expect(stats.totals.workingDaysExcludingPublicHolidays).toBe(0);
    });
  });

  describe('getWorkingDaysStats', () => {
    const workingDays: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const mockHolidayResponse = {
      status: 'success',
      feiertage: [
        { date: '2024-01-01', fname: 'Neujahr' },
        { date: '2024-04-01', fname: 'Ostermontag' },
        { date: '2024-05-01', fname: 'Tag der Arbeit' },
        { date: '2024-12-25', fname: 'Weihnachten' },
        { date: '2024-12-26', fname: '2. Weihnachtstag' },
      ],
    };

    it('should fetch holidays and calculate stats for all periods', async () => {
      const httpRequestHelper = createMockHttpRequestHelper(mockHolidayResponse);
      const requestDate = DateTime.fromISO('2024-06-15');
      
      const stats = await getWorkingDaysStats(
        requestDate,
        'be',
        workingDays,
        httpRequestHelper
      );
      
      // Verify API was called correctly
      expect(httpRequestHelper.httpRequest).toHaveBeenCalledWith({
        url: 'https://get.api-feiertage.de/?years=2024&states=be',
        method: 'GET',
        json: true,
      });
      
      // Verify structure
      expect(stats).toHaveProperty('day');
      expect(stats).toHaveProperty('week');
      expect(stats).toHaveProperty('month');
      expect(stats).toHaveProperty('year');
      
      // Each period should have all and remaining
      ['day', 'week', 'month', 'year'].forEach(period => {
        expect(stats[period as keyof typeof stats]).toHaveProperty('all');
        expect(stats[period as keyof typeof stats]).toHaveProperty('remaining');
      });
    });

    it('should handle multiple years', async () => {
      const httpRequestHelper = createMockHttpRequestHelper(mockHolidayResponse);
      const requestDate = DateTime.fromISO('2024-12-31');
      
      await getWorkingDaysStats(
        requestDate,
        'be',
        workingDays,
        httpRequestHelper
      );
      
      // When at year end, it should still only request current year
      expect(httpRequestHelper.httpRequest).toHaveBeenCalledWith({
        url: 'https://get.api-feiertage.de/?years=2024&states=be',
        method: 'GET',
        json: true,
      });
    });

    it('should handle API errors', async () => {
      const httpRequestHelper = createMockHttpRequestHelper({
        status: 'error',
        message: 'Invalid state code',
      });
      
      const requestDate = DateTime.fromISO('2024-06-15');
      
      await expect(
        getWorkingDaysStats(requestDate, 'XX', workingDays, httpRequestHelper)
      ).rejects.toThrow('Feiertage API error');
    });

    it('should correctly calculate remaining days', async () => {
      const httpRequestHelper = createMockHttpRequestHelper(mockHolidayResponse);
      // Use a date in the middle of the month
      const requestDate = DateTime.fromISO('2024-06-15');
      
      const stats = await getWorkingDaysStats(
        requestDate,
        'be',
        workingDays,
        httpRequestHelper
      );
      
      // Remaining days should be less than total days
      expect(stats.month.remaining.totals.workingDays).toBeLessThan(
        stats.month.all.totals.workingDays
      );
      
      // Day stats remaining should be 0 or very small (same day)
      expect(stats.day.remaining.totals.workingDays).toBeLessThanOrEqual(1);
    });

    it('should handle different state codes', async () => {
      const httpRequestHelper = createMockHttpRequestHelper(mockHolidayResponse);
      const requestDate = DateTime.fromISO('2024-06-15');
      
      await getWorkingDaysStats(
        requestDate,
        'by',
        workingDays,
        httpRequestHelper
      );
      
      expect(httpRequestHelper.httpRequest).toHaveBeenCalledWith({
        url: 'https://get.api-feiertage.de/?years=2024&states=by',
        method: 'GET',
        json: true,
      });
    });

    it('should handle weekend request dates', async () => {
      const httpRequestHelper = createMockHttpRequestHelper(mockHolidayResponse);
      const requestDate = DateTime.fromISO('2024-06-15'); // Saturday
      
      const stats = await getWorkingDaysStats(
        requestDate,
        'be',
        workingDays,
        httpRequestHelper
      );
      
      // Day stats should show 0 working days for Saturday
      expect(stats.day.all.totals.workingDays).toBe(0);
    });
  });

  describe('date conversion functions', () => {
    it('should re-export dateToDateTime', () => {
      const jsDate = new Date('2024-01-15T12:00:00Z');
      const dateTime = dateToDateTime(jsDate);
      expect(dateTime).toBeInstanceOf(DateTime);
    });

    it('should re-export dateTimeToDate', () => {
      const dateTime = DateTime.fromISO('2024-01-15T12:00:00Z');
      const jsDate = dateTimeToDate(dateTime);
      expect(jsDate).toBeInstanceOf(Date);
    });
  });

  describe('edge cases', () => {
    it('should handle leap year correctly', async () => {
      const mockLeapYearResponse = {
        status: 'success',
        feiertage: [],
      };
      
      const httpRequestHelper = createMockHttpRequestHelper(mockLeapYearResponse);
      const requestDate = DateTime.fromISO('2024-02-29'); // Leap year
      const workingDays: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      
      const stats = await getWorkingDaysStats(
        requestDate,
        'be',
        workingDays,
        httpRequestHelper
      );
      
      // February 2024 has 29 days
      expect(stats.month.all.totals.workingDays).toBe(21); // 29 days, 8 weekend days
    });

    it('should handle year boundaries', async () => {
      const mockResponse = {
        status: 'success',
        feiertage: [
          { date: '2023-12-25', fname: 'Weihnachten' },
          { date: '2024-01-01', fname: 'Neujahr' },
        ],
      };
      
      const httpRequestHelper = createMockHttpRequestHelper(mockResponse);
      const requestDate = DateTime.fromISO('2024-01-01');
      const workingDays: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      
      const stats = await getWorkingDaysStats(
        requestDate,
        'be',
        workingDays,
        httpRequestHelper
      );
      
      // Should only count holidays in 2024
      expect(stats.year.all.totals.holidays).toBe(1);
    });
  });
});