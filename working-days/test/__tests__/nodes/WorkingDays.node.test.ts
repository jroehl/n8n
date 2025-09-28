import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { WorkingDays } from '../../../nodes/WorkingDays.node';
import { DateTime } from 'luxon';

// Mock n8n workflow helpers
const createMockExecuteFunctions = (
  parameters: any,
  httpResponse?: any
): IExecuteFunctions => {
  const mockHelpers = {
    httpRequest: jest.fn().mockResolvedValue(httpResponse),
    returnJsonArray: (data: any[]) => data.map(item => ({ json: item })),
  };

  return {
    getInputData: () => [{ json: {} }],
    getNodeParameter: (name: string, index: number, defaultValue?: any) => {
      return parameters[name] !== undefined ? parameters[name] : defaultValue;
    },
    helpers: mockHelpers,
    continueOnFail: () => false,
  } as unknown as IExecuteFunctions;
};

describe('WorkingDays Node', () => {
  let workingDaysNode: WorkingDays;

  beforeEach(() => {
    workingDaysNode = new WorkingDays();
  });

  describe('node description', () => {
    it('should have correct metadata', () => {
      const { description } = workingDaysNode;
      
      expect(description.displayName).toBe('Working Days');
      expect(description.name).toBe('workingDays');
      expect(description.version).toBe(1);
      expect(description.group).toContain('transform');
    });

    it('should have all German states', () => {
      const { properties } = workingDaysNode.description;
      const stateProperty = properties.find(p => p.name === 'state');
      
      expect(stateProperty?.options).toHaveLength(16);
      expect(stateProperty?.options).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Berlin', value: 'be' }),
          expect.objectContaining({ name: 'Bayern', value: 'by' }),
          expect.objectContaining({ name: 'Nordrhein-Westfalen', value: 'nw' }),
        ])
      );
    });

    it('should have correct operations', () => {
      const { properties } = workingDaysNode.description;
      const operationProperty = properties.find(p => p.name === 'operation');
      
      expect(operationProperty?.options).toHaveLength(2);
      expect(operationProperty?.options).toEqual([
        expect.objectContaining({ name: 'Get Statistics', value: 'getStats' }),
        expect.objectContaining({ name: 'Calculate Range', value: 'calculateRange' }),
      ]);
    });
  });

  describe('execute - getStats operation', () => {
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

    it('should calculate statistics for reference date', async () => {
      const parameters = {
        operation: 'getStats',
        referenceDate: '2024-06-15T00:00:00.000Z',
        state: 'be',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        includeBreakdown: true,
      };

      const mockExecuteFunctions = createMockExecuteFunctions(
        parameters,
        mockHolidayResponse
      );

      const result = await workingDaysNode.execute.call(mockExecuteFunctions);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(1);
      
      const output = result[0][0].json as any;
      expect(output.operation).toBe('getStats');
      expect(output.state).toBe('BE');
      expect(output.statistics).toBeDefined();
      expect(output.statistics.day).toBeDefined();
      expect(output.statistics.week).toBeDefined();
      expect(output.statistics.month).toBeDefined();
      expect(output.statistics.year).toBeDefined();
      
      // Verify API was called
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        url: 'https://get.api-feiertage.de/?years=2024&states=be',
        method: 'GET',
        json: true,
      });
    });

    it('should use current date when referenceDate not provided', async () => {
      const parameters = {
        operation: 'getStats',
        referenceDate: '',
        state: 'be',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        includeBreakdown: false,
      };

      const mockExecuteFunctions = createMockExecuteFunctions(
        parameters,
        mockHolidayResponse
      );

      const result = await workingDaysNode.execute.call(mockExecuteFunctions);
      const output = result[0][0].json as any;
      
      // Should have a valid ISO date
      expect(output.referenceDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      
      // Should not include breakdown when false
      expect(output.statistics.day.all.workingDays).toBeUndefined();
      expect(output.statistics.day.all.holidays).toBeUndefined();
    });

    it('should handle custom working days', async () => {
      const parameters = {
        operation: 'getStats',
        referenceDate: '2024-06-15T00:00:00.000Z',
        state: 'be',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        includeBreakdown: true,
      };

      const mockExecuteFunctions = createMockExecuteFunctions(
        parameters,
        mockHolidayResponse
      );

      const result = await workingDaysNode.execute.call(mockExecuteFunctions);
      const output = result[0][0].json as any;
      
      expect(output.workingDays).toContain('Saturday');
      expect(output.statistics.month.all.totals.workingDays).toBeGreaterThan(20);
    });
  });

  describe('execute - calculateRange operation', () => {
    const mockHolidayResponse = {
      status: 'success',
      feiertage: [
        { date: '2024-01-01', fname: 'Neujahr' },
        { date: '2024-01-06', fname: 'Heilige Drei Könige' },
      ],
    };

    it('should calculate range statistics', async () => {
      const parameters = {
        operation: 'calculateRange',
        fromDate: '2024-01-01T00:00:00.000Z',
        toDate: '2024-01-31T00:00:00.000Z',
        state: 'by',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        includeBreakdown: true,
      };

      const mockExecuteFunctions = createMockExecuteFunctions(
        parameters,
        mockHolidayResponse
      );

      const result = await workingDaysNode.execute.call(mockExecuteFunctions);
      const output = result[0][0].json as any;
      
      expect(output.operation).toBe('calculateRange');
      expect(output.fromDate).toMatch(/2024-01-01/);
      expect(output.toDate).toMatch(/2024-01-31/);
      expect(output.statistics.totals).toBeDefined();
      expect(output.statistics.workingDays).toBeDefined();
      expect(output.statistics.holidays).toBeDefined();
    });

    it('should handle date ranges spanning multiple years', async () => {
      const mockMultiYearResponse = {
        status: 'success',
        feiertage: [
          { date: '2023-12-25', fname: 'Weihnachten' },
          { date: '2023-12-26', fname: '2. Weihnachtstag' },
          { date: '2024-01-01', fname: 'Neujahr' },
        ],
      };

      const parameters = {
        operation: 'calculateRange',
        fromDate: '2023-12-01T00:00:00.000Z',
        toDate: '2024-01-31T00:00:00.000Z',
        state: 'be',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        includeBreakdown: false,
      };

      const mockExecuteFunctions = createMockExecuteFunctions(
        parameters,
        mockMultiYearResponse
      );

      const result = await workingDaysNode.execute.call(mockExecuteFunctions);
      
      // Verify API was called with both years
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        url: 'https://get.api-feiertage.de/?years=2023,2024&states=BE',
        method: 'GET',
        json: true,
      });
      
      const output = result[0][0].json as any;
      expect(output.statistics.totals.holidays).toBe(3);
    });
  });

  describe('error handling', () => {
    it('should throw error on API failure', async () => {
      const parameters = {
        operation: 'getStats',
        referenceDate: '2024-06-15T00:00:00.000Z',
        state: 'be',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        includeBreakdown: true,
      };

      const mockExecuteFunctions = createMockExecuteFunctions(
        parameters,
        { status: 'error', message: 'Invalid state' }
      );

      await expect(
        workingDaysNode.execute.call(mockExecuteFunctions)
      ).rejects.toThrow('Feiertage API error');
    });

    it('should handle continueOnFail', async () => {
      const parameters = {
        operation: 'getStats',
        referenceDate: '2024-06-15T00:00:00.000Z',
        state: 'be',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        includeBreakdown: true,
      };

      const mockExecuteFunctions = createMockExecuteFunctions(
        parameters,
        { status: 'error', message: 'Invalid state' }
      );
      
      // Override continueOnFail to return true
      (mockExecuteFunctions.continueOnFail as jest.Mock) = jest.fn().mockReturnValue(true);

      const result = await workingDaysNode.execute.call(mockExecuteFunctions);
      
      expect(result[0][0].json).toHaveProperty('error');
      expect(result[0][0].json.error).toContain('Feiertage API error');
    });

    it('should handle invalid date formats', async () => {
      const parameters = {
        operation: 'calculateRange',
        fromDate: 'invalid-date',
        toDate: '2024-01-31T00:00:00.000Z',
        state: 'be',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        includeBreakdown: true,
      };

      const mockExecuteFunctions = createMockExecuteFunctions(parameters);

      await expect(
        workingDaysNode.execute.call(mockExecuteFunctions)
      ).rejects.toThrow();
    });
  });

  describe('date conversion', () => {
    it('should convert DateTime objects to ISO strings in output', async () => {
      const parameters = {
        operation: 'calculateRange',
        fromDate: '2024-01-01T00:00:00.000Z',
        toDate: '2024-01-07T00:00:00.000Z',
        state: 'be',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        includeBreakdown: true,
      };

      const mockHolidayResponse = {
        status: 'success',
        feiertage: [
          { date: '2024-01-01', fname: 'Neujahr' },
        ],
      };

      const mockExecuteFunctions = createMockExecuteFunctions(
        parameters,
        mockHolidayResponse
      );

      const result = await workingDaysNode.execute.call(mockExecuteFunctions);
      const output = result[0][0].json as any;
      
      // Check that dates in the breakdown are ISO strings
      if (output.statistics.holidays.days.length > 0) {
        const holidayDate = output.statistics.holidays.days[0].date;
        expect(typeof holidayDate).toBe('string');
        expect(holidayDate).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      }
    });
  });
});