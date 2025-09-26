import {
  Day,
  DAYS,
  getFirstAndLastDayOfMonth,
  getFirstAndLastDayOfWeekWithinMonthAndYear,
  getFirstAndLastDayOfYear,
  getFirstAndLastTimeOfDay,
  getIsoFormattedDay,
  getTimeZoneOffset,
} from './date';
import { fetchJSON } from './fetchJSON';

export type State = 'Berlin' | 'Brandenburg' | 'Hamburg' | 'Schleswig-Holstein';
const STATE_MAPPING: Record<State, string> = {
  Berlin: 'be',
  Brandenburg: 'bb',
  Hamburg: 'hh',
  'Schleswig-Holstein': 'sh',
} as const;

interface Stats {
  total: number;
  days: EnrichedDay[];
}

interface EnrichedDay {
  date: Date;
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
  fromDate: Date,
  toDate: Date,
  workingDays: readonly Day[]
): Stats {
  const from = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate(),
    getTimeZoneOffset(fromDate)
  );
  const to = new Date(
    toDate.getFullYear(),
    toDate.getMonth(),
    toDate.getDate()
  );

  const days: Stats['days'] = [];
  let numOfWorkingDays = 0;
  const dayIndexes = workingDays.map((day) => DAYS.indexOf(day));

  while (from <= to) {
    const day = from.getDay();
    if (dayIndexes.includes(day)) {
      days.push({ date: new Date(from), day: DAYS[day] });
      numOfWorkingDays++;
    }
    from.setDate(from.getDate() + 1);
  }
  return { total: numOfWorkingDays, days };
}

function getHolidays(
  fromDate: Date,
  toDate: Date,
  holidays: Omit<EnrichedDay, 'day'>[]
): Stats {
  const days = holidays
    .filter(({ date }) => date >= fromDate && date <= toDate)
    .map(({ date, name }) => {
      return {
        date,
        name,
        day: DAYS[date.getDay()],
      };
    });

  return { total: days.length, days };
}

async function fetchHolidays(
  fromDate: Date,
  toDate: Date,
  state: State
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
    ...new Set([fromDate.getFullYear(), toDate.getFullYear()]),
  ].join(',');
  const states = STATE_MAPPING[state];

  const url = `https://get.api-feiertage.de/?years=${years}&states=${states}`;
  const res = await fetchJSON<{
    status: string;
    feiertage: Feiertage[];
  }>(url, {
    withCache: true,
    cacheExpirationMinutes: 10080, // 7 days
  });

  if (res?.status !== 'success') throw new Error(`Feiertage API error ${res}`);

  return res.feiertage.map(({ date, fname }) => ({
    date: new Date(date),
    name: fname,
  }));
}

export function getStats(
  allHolidays: Omit<EnrichedDay, 'day'>[],
  fromDate: Date,
  toDate: Date,
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
  from: Date,
  to: Date,
  workingDays: readonly Day[]
): WorkingDaysResponseWithRemaining {
  return {
    all: getStats(holidays, from, to, workingDays),
    remaining: getStats(holidays, new Date(), to, workingDays),
  };
}

export async function getWorkingDaysStats(
  requestDate: Date,
  state: State,
  workingDays: readonly Day[]
): Promise<{
  day: WorkingDaysResponseWithRemaining;
  week: WorkingDaysResponseWithRemaining;
  month: WorkingDaysResponseWithRemaining;
  year: WorkingDaysResponseWithRemaining;
}> {
  const [firstDayYear, lastDayYear] = getFirstAndLastDayOfYear(requestDate);
  const holidays = await fetchHolidays(firstDayYear, lastDayYear, state);

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