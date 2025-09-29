import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class Wakatime implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Wakatime',
		name: 'wakatime',
		icon: 'file:../../wakatime.svg',
		group: ['input'],
		version: 1,
		description: 'Interact with Wakatime API to fetch time tracking data',
		defaults: {
			name: 'Wakatime',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'wakatimeApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Summaries',
						value: 'getSummaries',
						description: 'Fetch summaries from Wakatime',
						action: 'Get summaries from Wakatime',
					},
				],
				default: 'getSummaries',
			},

			// Get Summaries options
			{
				displayName: 'Start Date',
				name: 'start',
				type: 'dateTime',
				displayOptions: {
					show: {
						operation: ['getSummaries'],
					},
				},
				default: '',
				description: 'Start date for summaries (YYYY-MM-DD). Leave empty for today.',
			},
			{
				displayName: 'End Date',
				name: 'end',
				type: 'dateTime',
				displayOptions: {
					show: {
						operation: ['getSummaries'],
					},
				},
				default: '',
				description: 'End date for summaries (YYYY-MM-DD). Leave empty for today.',
			},
			{
				displayName: 'Project',
				name: 'project',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getSummaries'],
					},
				},
				default: '',
				description: 'Filter by project name (optional)',
			},
			{
				displayName: 'Branches',
				name: 'branches',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['getSummaries'],
					},
				},
				default: '',
				description: 'Filter by git branch names (optional)',
			},

		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'getSummaries') {
					const start = this.getNodeParameter('start', i) as string;
					const end = this.getNodeParameter('end', i) as string;
					const project = this.getNodeParameter('project', i) as string;
					const branches = this.getNodeParameter('branches', i) as string;

					const today = new Date().toISOString().split('T')[0];
					const startDate = start ? start.split('T')[0] : today;
					const endDate = end ? end.split('T')[0] : today;

					const queryParams: any = {
						start: startDate,
						end: endDate,
					};

					if (project) queryParams.project = project;
					if (branches) queryParams.branches = branches;

					const response = await this.helpers.requestWithAuthentication.call(
						this,
						'wakatimeApi',
						{
							method: 'GET',
							url: 'https://wakatime.com/api/v1/users/current/summaries',
							qs: queryParams,
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							},
							json: true,
						},
					);

					returnData.push({
						json: {
							operation: 'getSummaries',
							start: startDate,
							end: endDate,
							project: project || null,
							branches: branches || null,
							response: response,
							data: response.data || response,
							total_count: (response.data || response)?.length || 0,
						},
					});

				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}