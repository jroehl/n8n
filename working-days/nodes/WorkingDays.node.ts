import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from "n8n-workflow";

import { DateTime } from "luxon";
import { Day, DAYS } from "../utils/date";
import {
  getWorkingDaysStats,
  getStats,
  dateToDateTime,
  dateTimeToDate,
} from "../utils/workingDays";

// Helper function to convert DateTime objects in stats to ISO strings
function convertStatsForOutput(stats: any): any {
  if (!stats) return stats;

  if (stats.days && Array.isArray(stats.days)) {
    return {
      ...stats,
      days: stats.days.map((day: any) => ({
        ...day,
        date: day.date?.toISO ? day.date.toISO() : day.date,
      })),
    };
  }

  return stats;
}

function convertPeriodStats(periodStats: any, includeBreakdown: boolean): any {
  return {
    all: {
      totals: periodStats.all.totals,
      ...(includeBreakdown && {
        workingDays: convertStatsForOutput(periodStats.all.workingDays),
        holidays: convertStatsForOutput(periodStats.all.holidays),
      }),
    },
    remaining: {
      totals: periodStats.remaining.totals,
      ...(includeBreakdown && {
        workingDays: convertStatsForOutput(periodStats.remaining.workingDays),
        holidays: convertStatsForOutput(periodStats.remaining.holidays),
      }),
    },
  };
}

const stateMap = [
  {
    name: "Baden-Württemberg",
    value: "bw",
  },
  {
    name: "Bayern",
    value: "by",
  },
  {
    name: "Berlin",
    value: "be",
  },
  {
    name: "Brandenburg",
    value: "bb",
  },
  {
    name: "Bremen",
    value: "hb",
  },
  {
    name: "Hamburg",
    value: "hh",
  },
  {
    name: "Hessen",
    value: "he",
  },
  {
    name: "Mecklenburg-Vorpommern",
    value: "mv",
  },
  {
    name: "Niedersachsen",
    value: "ni",
  },
  {
    name: "Nordrhein-Westfalen",
    value: "nw",
  },
  {
    name: "Rheinland-Pfalz",
    value: "rp",
  },
  {
    name: "Saarland",
    value: "sl",
  },
  {
    name: "Sachsen",
    value: "sn",
  },
  {
    name: "Sachsen-Anhalt",
    value: "st",
  },
  {
    name: "Schleswig-Holstein",
    value: "sh",
  },
  {
    name: "Thüringen",
    value: "th",
  },
];
export class WorkingDays implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Working Days",
    name: "workingDays",
    icon: "file:../../working-days.svg",
    group: ["transform"],
    version: 1,
    description: "Calculate working days and holidays for German states",
    defaults: {
      name: "Working Days",
    },
    inputs: ["main"],
    outputs: ["main"],
    properties: [
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        options: [
          {
            name: "Get Statistics",
            value: "getStats",
            description: "Get working days statistics for day/week/month/year",
          },
          {
            name: "Calculate Range",
            value: "calculateRange",
            description: "Calculate working days for a specific date range",
          },
        ],
        default: "getStats",
        required: true,
      },
      {
        displayName: "Reference Date",
        name: "referenceDate",
        type: "dateTime",
        displayOptions: {
          show: {
            operation: ["getStats"],
          },
        },
        default: "",
        description:
          "The reference date to calculate statistics for (default: today)",
      },
      {
        displayName: "From Date",
        name: "fromDate",
        type: "dateTime",
        displayOptions: {
          show: {
            operation: ["calculateRange"],
          },
        },
        default: "",
        required: true,
        description: "Start date of the range",
      },
      {
        displayName: "To Date",
        name: "toDate",
        type: "dateTime",
        displayOptions: {
          show: {
            operation: ["calculateRange"],
          },
        },
        default: "",
        required: true,
        description: "End date of the range",
      },
      {
        displayName: "German State",
        name: "state",
        type: "options",
        options: stateMap,
        default: "be",
        required: true,
        description: "German state for public holiday calculation",
      },
      {
        displayName: "Working Days",
        name: "workingDays",
        type: "multiOptions",
        options: DAYS.map((day) => ({ name: day, value: day })),
        default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        required: true,
        description: "Days considered as working days",
      },
      {
        displayName: "Include Breakdown",
        name: "includeBreakdown",
        type: "boolean",
        default: true,
        description:
          "Whether to include detailed day-by-day breakdown in the response",
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: IDataObject[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const operation = this.getNodeParameter("operation", i) as string;
        const state = this.getNodeParameter("state", i) as string;
        const stateCode =
          stateMap.find((s) => s.name === state)?.value || state;
        const workingDays = this.getNodeParameter("workingDays", i) as Day[];
        const includeBreakdown = this.getNodeParameter(
          "includeBreakdown",
          i,
        ) as boolean;

        let result: IDataObject;

        if (operation === "getStats") {
          const referenceDateParam = this.getNodeParameter(
            "referenceDate",
            i,
            "",
          ) as string;
          const referenceDate = referenceDateParam
            ? DateTime.fromISO(referenceDateParam)
            : DateTime.now();

          const stats = await getWorkingDaysStats(
            referenceDate,
            stateCode,
            workingDays,
            this.helpers,
          );

          result = {
            operation: "getStats",
            referenceDate: referenceDate.toISO(),
            state: stateCode,
            workingDays,
            statistics: {
              day: convertPeriodStats(stats.day, includeBreakdown),
              week: convertPeriodStats(stats.week, includeBreakdown),
              month: convertPeriodStats(stats.month, includeBreakdown),
              year: convertPeriodStats(stats.year, includeBreakdown),
            },
          };
        } else {
          // calculateRange
          const fromDateParam = this.getNodeParameter("fromDate", i) as string;
          const toDateParam = this.getNodeParameter("toDate", i) as string;
          const fromDate = DateTime.fromISO(fromDateParam);
          const toDate = DateTime.fromISO(toDateParam);

          // For range calculation, we need to fetch holidays for the entire range
          const years = [...new Set([fromDate.year, toDate.year])].join(",");

          const url = `https://get.api-feiertage.de/?years=${years}&states=${stateCode}`;

          const holidayResponse = (await this.helpers.httpRequest({
            url,
            method: "GET",
            json: true,
          })) as {
            status: string;
            feiertage: Array<{ date: string; fname: string }>;
          };

          if (!holidayResponse || holidayResponse.status !== "success") {
            throw new Error("Failed to fetch holiday data");
          }

          const holidays = holidayResponse.feiertage.map(({ date, fname }) => ({
            date: DateTime.fromISO(date),
            name: fname,
          }));

          const stats = getStats(holidays, fromDate, toDate, workingDays);

          result = {
            operation: "calculateRange",
            fromDate: fromDate.toISO(),
            toDate: toDate.toISO(),
            state: stateCode,
            workingDays,
            statistics: {
              totals: stats.totals,
              ...(includeBreakdown && {
                workingDays: convertStatsForOutput(stats.workingDays),
                holidays: convertStatsForOutput(stats.holidays),
              }),
            },
          };
        }

        returnData.push(result);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ error: (error as Error).message });
          continue;
        }
        throw error;
      }
    }

    return [this.helpers.returnJsonArray(returnData)];
  }
}
