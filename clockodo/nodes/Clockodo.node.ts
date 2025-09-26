import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	IHttpRequestOptions,
	IHttpRequestMethods,
} from 'n8n-workflow';

export class Clockodo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Clockodo',
		name: 'clockodo',
		icon: 'file:../../clockodo.png',
		group: ['transform'],
		version: 1,
		description: 'Interact with Clockodo API',
		defaults: {
			name: 'Clockodo',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'clockodoApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Business Group',
						value: 'businessGroups',
					},
					{
						name: 'Clock',
						value: 'clock',
					},
					{
						name: 'Customer',
						value: 'customers',
					},
					{
						name: 'Entry',
						value: 'entries',
					},
					{
						name: 'Project',
						value: 'projects',
					},
					{
						name: 'Service',
						value: 'services',
					},
					{
						name: 'User',
						value: 'users',
					},
				],
				default: 'entries',
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['entries'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all time entries',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a time entry',
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['clock'],
					},
				},
				options: [
					{
						name: 'Get Status',
						value: 'getStatus',
						description: 'Get current clock status',
					},
					{
						name: 'Clock In',
						value: 'clockIn',
						description: 'Start time tracking',
					},
					{
						name: 'Clock Out',
						value: 'clockOut',
						description: 'Stop time tracking',
					},
				],
				default: 'getStatus',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['services'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all services',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a specific service by ID',
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['users'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all users',
					},
					{
						name: 'Get Me',
						value: 'getMe',
						description: 'Get current user information',
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['customers', 'projects', 'businessGroups'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all items',
					},
				],
				default: 'getAll',
			},
			// Time entry specific fields
			{
				displayName: 'Customer ID',
				name: 'customersId',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['entries'],
						operation: ['create'],
					},
				},
				default: 0,
				required: true,
				description: 'The ID of the customer',
			},
			{
				displayName: 'Service ID',
				name: 'servicesId',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['entries'],
						operation: ['create'],
					},
				},
				default: 0,
				required: true,
				description: 'The ID of the service',
			},
			{
				displayName: 'Time Since',
				name: 'timeSince',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['entries'],
						operation: ['create'],
					},
				},
				default: 0,
				required: true,
				description: 'Start time of the entry',
			},
			{
				displayName: 'Time Until',
				name: 'timeUntil',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['entries'],
						operation: ['create'],
					},
				},
				default: 0,
				required: true,
				description: 'End time of the entry',
			},
			{
				displayName: 'Description',
				name: 'text',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['entries'],
						operation: ['create'],
					},
				},
				default: 0,
				description: 'Description of the work done',
			},
			// Clock in fields
			{
				displayName: 'Customer ID',
				name: 'customersId',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['clock'],
						operation: ['clockIn'],
					},
				},
				default: 0,
				required: true,
				description: 'The ID of the customer',
			},
			{
				displayName: 'Service ID',
				name: 'servicesId',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['clock'],
						operation: ['clockIn'],
					},
				},
				default: 0,
				required: true,
				description: 'The ID of the service',
			},
			// Service specific fields
			{
				displayName: 'Service ID',
				name: 'serviceId',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['services'],
						operation: ['get'],
					},
				},
				default: 0,
				required: true,
				description: 'The ID of the service to retrieve',
			},
			// Entry filtering fields
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['entries'],
						operation: ['getAll'],
					},
				},
				default: '',
				description: 'Filter entries from this date (optional)',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['entries'],
						operation: ['getAll'],
					},
				},
				default: '',
				description: 'Filter entries until this date (optional)',
			},
			{
				displayName: 'Billable Only',
				name: 'billableOnly',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['entries'],
						operation: ['getAll'],
					},
				},
				default: false,
				description: 'Whether to filter for billable entries only',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const credentials = await this.getCredentials('clockodoApi');
		
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;
				let url = '';
				let method: IHttpRequestMethods = 'GET';
				let body: IDataObject | undefined;

				// Build URL and set method based on resource and operation
				if (resource === 'businessGroups') {
					url = 'https://my.clockodo.com/api/nonbusinessgroups';
				} else if (resource === 'services') {
					if (operation === 'get') {
						const serviceId = this.getNodeParameter('serviceId', i) as number;
						url = `https://my.clockodo.com/api/v2/services/${serviceId}`;
					} else {
						url = 'https://my.clockodo.com/api/v2/services';
					}
				} else if (resource === 'users' && operation === 'getMe') {
					url = 'https://my.clockodo.com/api/v2/aggregates/users/me';
				} else if (resource === 'entries') {
					if (operation === 'create') {
						method = 'POST';
						url = 'https://my.clockodo.com/api/v2/entries';
						body = {
							customers_id: this.getNodeParameter('customersId', i) as number,
							services_id: this.getNodeParameter('servicesId', i) as number,
							time_since: this.getNodeParameter('timeSince', i) as string,
							time_until: this.getNodeParameter('timeUntil', i) as string,
							text: this.getNodeParameter('text', i) as string,
						};
					} else {
						// Handle filtering for getAll entries
						const queryParams: string[] = [];
						const startDate = this.getNodeParameter('startDate', i, '') as string;
						const endDate = this.getNodeParameter('endDate', i, '') as string;
						const billableOnly = this.getNodeParameter('billableOnly', i, false) as boolean;

						if (startDate) {
							queryParams.push(`time_since=${new Date(startDate).toISOString().replace(/\.\d+Z/, 'Z')}`);
						}
						if (endDate) {
							queryParams.push(`time_until=${new Date(endDate).toISOString().replace(/\.\d+Z/, 'Z')}`);
						}
						if (billableOnly) {
							queryParams.push('filter[billable]=1');
						}

						const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
						url = `https://my.clockodo.com/api/v2/entries${queryString}`;
					}
				} else if (resource === 'clock') {
					if (operation === 'clockIn') {
						method = 'POST';
						url = 'https://my.clockodo.com/api/v2/clock';
						body = {
							customers_id: this.getNodeParameter('customersId', i) as number,
							services_id: this.getNodeParameter('servicesId', i) as number,
						};
					} else if (operation === 'clockOut') {
						method = 'DELETE';
						url = 'https://my.clockodo.com/api/v2/clock';
					} else {
						url = 'https://my.clockodo.com/api/v2/clock';
					}
				} else {
					// Default for customers, projects, users getAll
					url = `https://my.clockodo.com/api/v2/${resource}`;
				}

				const options: IHttpRequestOptions = {
					method,
					url,
					headers: {
						'X-ClockodoApiUser': credentials.email as string,
						'X-ClockodoApiKey': credentials.apiKey as string,
						'X-Clockodo-External-Application': 'n8n;support@n8n.io',
						'Accept': 'application/json',
					},
					json: true,
				};

				if (body) {
					options.body = body;
				}

				responseData = await this.helpers.httpRequest(options);
				
				// Handle different response structures
				if (resource === 'businessGroups' && responseData.nonbusinessgroups) {
					returnData.push(...responseData.nonbusinessgroups);
				} else if (resource === 'entries' && responseData.entries) {
					returnData.push(...responseData.entries);
				} else if (resource === 'services' && operation === 'get' && responseData.service) {
					returnData.push(responseData.service);
				} else if (resource === 'users' && operation === 'getMe') {
					returnData.push(responseData);
				} else if (Array.isArray(responseData[resource])) {
					returnData.push(...responseData[resource]);
				} else {
					returnData.push(responseData);
				}
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