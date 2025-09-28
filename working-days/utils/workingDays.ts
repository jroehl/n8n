import { DateTime } from 'luxon';
import {
  Day,
  DAYS,
  getFirstAndLastDayOfMonth,
  getFirstAndLastDayOfWeekWithinMonthAndYear,
  getFirstAndLastDayOfYear,
  getFirstAndLastTimeOfDay,
  getIsoFormattedDay,
  dateToDateTime,
  dateTimeToDate,
  getWeekdayIndex,
} from './date';

// Re-export conversion functions for use in the node
export { dateToDateTime, dateTimeToDate };

// HTTP request helper type for dependency injection
export interface HttpRequestHelper {
  httpRequest(options: {
    url: string;
    method: 'GET';
    json: boolean;
  }): Promise<any>;
}

interface Stats {
  total: number;
  days: EnrichedDay[];
}

interface EnrichedDay {
  date: DateTime;
  day: Day;
  name?: string;
}

export interface WorkingDaysResponse {
  totals: {
    holidays: number;
    workingDays: number;
    workingDaysExcludingPublicHolidays: number;
  };
  workingDays: Stats;
  holidays: Stats;
}

function getWorkingDays(
  fromDate: DateTime,
  toDate: DateTime,
  workingDays: readonly Day[]
): Stats {
  const from = fromDate.startOf('day');
  const to = toDate.startOf('day');

  const days: Stats['days'] = [];
  let numOfWorkingDays = 0;
  const dayIndexes = workingDays.map((day) => DAYS.indexOf(day));

  let current = from;
  while (current <= to) {
    const dayIndex = getWeekdayIndex(current);
    if (dayIndexes.includes(dayIndex)) {
      days.push({ date: current, day: DAYS[dayIndex] });
      numOfWorkingDays++;
    }
    current = current.plus({ days: 1 });
  }
  return { total: numOfWorkingDays, days };
}

function getHolidays(
  fromDate: DateTime,
  toDate: DateTime,
  holidays: Omit<EnrichedDay, 'day'>[]
): Stats {
  const days = holidays
    .filter(({ date }) => date >= fromDate && date <= toDate)
    .map(({ date, name }) => {
      return {
        date,
        name,
        day: DAYS[getWeekdayIndex(date)],
      };
    });

  return { total: days.length, days };
}

async function fetchHolidays(
  fromDate: DateTime,
  toDate: DateTime,
  stateCode: string,
  httpRequestHelper: HttpRequestHelper
): Promise<Omit<EnrichedDay, 'day'>[]> {
  interface Feiertage {
    date: string;
    fname: string;
    all_states: string;
    bw: string;
    by: string;
    be: string;
    bb: string;
    hb: string;
    hh: string;
    he: string;
    mv: string;
    ni: string;
    nw: string;
    rp: string;
    sl: string;
    sn: string;
    st: string;
    sh: string;
    th: string;
    comment: string;
  }

  const years = [
    ...new Set([fromDate.year, toDate.year]),
  ].join(',');

  const url = `https://get.api-feiertage.de/?years=${years}&states=${stateCode}`;
  const res = await httpRequestHelper.httpRequest({
    url,
    method: 'GET',
    json: true,
  }) as {
    status: string;
    feiertage: Feiertage[];
  };

  if (res?.status !== 'success') throw new Error(`Feiertage API error ${JSON.stringify(res)}`);

  return res.feiertage.map(({ date, fname }) => ({
    date: DateTime.fromISO(date),
    name: fname,
  }));
}

export function getStats(
  allHolidays: Omit<EnrichedDay, 'day'>[],
  fromDate: DateTime,
  toDate: DateTime,
  workingDays: readonly Day[]
): WorkingDaysResponse {
  const holidaysStats = getHolidays(fromDate, toDate, allHolidays);
  const workingDaysStats = getWorkingDays(fromDate, toDate, workingDays);

  return {
    totals: {
      workingDays: workingDaysStats.total,
      workingDaysExcludingPublicHolidays: workingDaysStats.days.filter(
        ({ date }) =>
          !holidaysStats.days.some(
            (holiday) =>
              getIsoFormattedDay(holiday.date) === getIsoFormattedDay(date)
          )
      ).length,
      holidays: holidaysStats.total,
    },
    holidays: holidaysStats,
    workingDays: workingDaysStats,
  };
}

export interface WorkingDaysResponseWithRemaining {
  all: WorkingDaysResponse;
  remaining: WorkingDaysResponse;
}

function getWorkingStatsWithRemaining(
  holidays: Omit<EnrichedDay, 'day'>[],
  from: DateTime,
  to: DateTime,
  workingDays: readonly Day[]
): WorkingDaysResponseWithRemaining {
  return {
    all: getStats(holidays, from, to, workingDays),
    remaining: getStats(holidays, DateTime.now(), to, workingDays),
  };
}

export async function getWorkingDaysStats(
  requestDate: DateTime,
  stateCode: string,
  workingDays: readonly Day[],
  httpRequestHelper: HttpRequestHelper
): Promise<{
  day: WorkingDaysResponseWithRemaining;
  week: WorkingDaysResponseWithRemaining;
  month: WorkingDaysResponseWithRemaining;
  year: WorkingDaysResponseWithRemaining;
}> {
  const [firstDayYear, lastDayYear] = getFirstAndLastDayOfYear(requestDate);
  const holidays = await fetchHolidays(firstDayYear, lastDayYear, stateCode, httpRequestHelper);

  const [firstDayMonth, lastDayMonth] = getFirstAndLastDayOfMonth(requestDate);
  const month = getWorkingStatsWithRemaining(
    holidays,
    firstDayMonth,
    lastDayMonth,
    workingDays
  );
  const [firstDayWeek, lastDayWeek] =
    getFirstAndLastDayOfWeekWithinMonthAndYear(requestDate);
  const week = getWorkingStatsWithRemaining(
    holidays,
    firstDayWeek,
    lastDayWeek,
    workingDays
  );
  const year = getWorkingStatsWithRemaining(
    holidays,
    firstDayYear,
    lastDayYear,
    workingDays
  );
  const [firstTimeDay, lastTimeDay] = getFirstAndLastTimeOfDay(requestDate);
  const day = getWorkingStatsWithRemaining(
    holidays,
    firstTimeDay,
    lastTimeDay,
    workingDays
  );

  return { day, week, month, year };
}