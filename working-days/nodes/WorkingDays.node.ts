import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';

import { Day, DAYS } from '../utils/date';
import { getWorkingDaysStats, State, getStats } from '../utils/workingDays';

export class WorkingDays implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Working Days',
		name: 'workingDays',
		icon: 'file:../../working-days.svg',
		group: ['transform'],
		version: 1,
		description: 'Calculate working days and holidays for German states',
		defaults: {
			name: 'Working Days',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Statistics',
						value: 'getStats',
						description: 'Get working days statistics for day/week/month/year',
					},
					{
						name: 'Calculate Range',
						value: 'calculateRange',
						description: 'Calculate working days for a specific date range',
					},
				],
				default: 'getStats',
				required: true,
			},
			{
				displayName: 'Reference Date',
				name: 'referenceDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						operation: ['getStats'],
					},
				},
				default: '',
				description: 'The reference date to calculate statistics for (default: today)',
			},
			{
				displayName: 'From Date',
				name: 'fromDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						operation: ['calculateRange'],
					},
				},
				default: '',
				required: true,
				description: 'Start date of the range',
			},
			{
				displayName: 'To Date',
				name: 'toDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						operation: ['calculateRange'],
					},
				},
				default: '',
				required: true,
				description: 'End date of the range',
			},
			{
				displayName: 'German State',
				name: 'state',
				type: 'options',
				options: [
					{
						name: 'Berlin',
						value: 'Berlin',
					},
					{
						name: 'Brandenburg',
						value: 'Brandenburg',
					},
					{
						name: 'Hamburg',
						value: 'Hamburg',
					},
					{
						name: 'Schleswig-Holstein',
						value: 'Schleswig-Holstein',
					},
				],
				default: 'Berlin',
				required: true,
				description: 'German state for public holiday calculation',
			},
			{
				displayName: 'Working Days',
				name: 'workingDays',
				type: 'multiOptions',
				options: [
					{
						name: 'Monday',
						value: 'Monday',
					},
					{
						name: 'Tuesday',
						value: 'Tuesday',
					},
					{
						name: 'Wednesday',
						value: 'Wednesday',
					},
					{
						name: 'Thursday',
						value: 'Thursday',
					},
					{
						name: 'Friday',
						value: 'Friday',
					},
					{
						name: 'Saturday',
						value: 'Saturday',
					},
					{
						name: 'Sunday',
						value: 'Sunday',
					},
				],
				default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
				required: true,
				description: 'Days considered as working days',
			},
			{
				displayName: 'Include Breakdown',
				name: 'includeBreakdown',
				type: 'boolean',
				default: true,
				description: 'Whether to include detailed day-by-day breakdown in the response',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const state = this.getNodeParameter('state', i) as State;
				const workingDays = this.getNodeParameter('workingDays', i) as Day[];
				const includeBreakdown = this.getNodeParameter('includeBreakdown', i) as boolean;

				let result: IDataObject;

				if (operation === 'getStats') {
					const referenceDateParam = this.getNodeParameter('referenceDate', i, '') as string;
					const referenceDate = referenceDateParam ? new Date(referenceDateParam) : new Date();

					const stats = await getWorkingDaysStats(referenceDate, state, workingDays);

					result = {
						operation: 'getStats',
						referenceDate: referenceDate.toISOString(),
						state,
						workingDays,
						statistics: {
							day: {
								all: {
									totals: stats.day.all.totals,
									...(includeBreakdown && {
										workingDays: stats.day.all.workingDays,
										holidays: stats.day.all.holidays,
									}),
								},
								remaining: {
									totals: stats.day.remaining.totals,
									...(includeBreakdown && {
										workingDays: stats.day.remaining.workingDays,
										holidays: stats.day.remaining.holidays,
									}),
								},
							},
							week: {
								all: {
									totals: stats.week.all.totals,
									...(includeBreakdown && {
										workingDays: stats.week.all.workingDays,
										holidays: stats.week.all.holidays,
									}),
								},
								remaining: {
									totals: stats.week.remaining.totals,
									...(includeBreakdown && {
										workingDays: stats.week.remaining.workingDays,
										holidays: stats.week.remaining.holidays,
									}),
								},
							},
							month: {
								all: {
									totals: stats.month.all.totals,
									...(includeBreakdown && {
										workingDays: stats.month.all.workingDays,
										holidays: stats.month.all.holidays,
									}),
								},
								remaining: {
									totals: stats.month.remaining.totals,
									...(includeBreakdown && {
										workingDays: stats.month.remaining.workingDays,
										holidays: stats.month.remaining.holidays,
									}),
								},
							},
							year: {
								all: {
									totals: stats.year.all.totals,
									...(includeBreakdown && {
										workingDays: stats.year.all.workingDays,
										holidays: stats.year.all.holidays,
									}),
								},
								remaining: {
									totals: stats.year.remaining.totals,
									...(includeBreakdown && {
										workingDays: stats.year.remaining.workingDays,
										holidays: stats.year.remaining.holidays,
									}),
								},
							},
						},
					};
				} else {
					// calculateRange
					const fromDateParam = this.getNodeParameter('fromDate', i) as string;
					const toDateParam = this.getNodeParameter('toDate', i) as string;
					const fromDate = new Date(fromDateParam);
					const toDate = new Date(toDateParam);

					// For range calculation, we need to fetch holidays for the entire range
					const { fetchJSON } = await import('../utils/fetchJSON');
					
					const years = [
						...new Set([fromDate.getFullYear(), toDate.getFullYear()]),
					].join(',');
					
					const stateMapping: Record<State, string> = {
						Berlin: 'be',
						Brandenburg: 'bb',
						Hamburg: 'hh',
						'Schleswig-Holstein': 'sh',
					};
					
					const stateCode = stateMapping[state];
					const url = `https://get.api-feiertage.de/?years=${years}&states=${stateCode}`;
					
					const holidayResponse = await fetchJSON<{
						status: string;
						feiertage: Array<{ date: string; fname: string }>;
					}>(url, {
						withCache: true,
						cacheExpirationMinutes: 10080, // 7 days
					});

					if (!holidayResponse || holidayResponse.status !== 'success') {
						throw new Error('Failed to fetch holiday data');
					}

					const holidays = holidayResponse.feiertage.map(({ date, fname }) => ({
						date: new Date(date),
						name: fname,
					}));

					const stats = getStats(holidays, fromDate, toDate, workingDays);

					result = {
						operation: 'calculateRange',
						fromDate: fromDate.toISOString(),
						toDate: toDate.toISOString(),
						state,
						workingDays,
						statistics: {
							totals: stats.totals,
							...(includeBreakdown && {
								workingDays: stats.workingDays,
								holidays: stats.holidays,
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