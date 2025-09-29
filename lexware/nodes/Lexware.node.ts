import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	IHttpRequestOptions,
	IHttpRequestMethods,
} from 'n8n-workflow';

export class Lexware implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Lexware',
		name: 'lexware',
		icon: 'file:../../lexware.png',
		group: ['transform'],
		version: 1,
		description: 'Interact with Lexware API',
		defaults: {
			name: 'Lexware',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'lexwareApi',
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
						name: 'Contact',
						value: 'contacts',
					},
					{
						name: 'Article',
						value: 'articles',
					},
					{
						name: 'Invoice',
						value: 'invoices',
					},
					{
						name: 'Credit Note',
						value: 'credit-notes',
					},
					{
						name: 'Delivery Note',
						value: 'delivery-notes',
					},
					{
						name: 'File',
						value: 'files',
					},
					{
						name: 'Voucher List',
						value: 'voucherlist',
					},
				],
				default: 'contacts',
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['contacts'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all contacts',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a contact by ID',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new contact',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a contact',
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
						resource: ['articles'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all articles',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get an article by ID',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new article',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an article',
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
						resource: ['invoices'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get an item by ID',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new item',
					},
				],
				default: 'get',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['credit-notes', 'delivery-notes'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all items',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get an item by ID',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new item',
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
						resource: ['files'],
					},
				},
				options: [
					{
						name: 'Upload',
						value: 'upload',
						description: 'Upload a file',
					},
					{
						name: 'Download',
						value: 'download',
						description: 'Download a file',
					},
				],
				default: 'upload',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['voucherlist'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get voucher list with filtering options',
					},
				],
				default: 'getAll',
			},
			// Contact ID field
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['contacts'],
						operation: ['get', 'update'],
					},
				},
				default: '',
				required: true,
				description: 'The ID of the contact',
			},
			// Article ID field
			{
				displayName: 'Article ID',
				name: 'articleId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['articles'],
						operation: ['get', 'update'],
					},
				},
				default: '',
				required: true,
				description: 'The ID of the article',
			},
			// Document ID field for invoices, credit notes, delivery notes
			{
				displayName: 'Document ID',
				name: 'documentId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['invoices', 'credit-notes', 'delivery-notes'],
						operation: ['get'],
					},
				},
				default: '',
				required: true,
				description: 'The ID of the document',
			},
			// File ID field
			{
				displayName: 'File ID',
				name: 'fileId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['files'],
						operation: ['download'],
					},
				},
				default: '',
				required: true,
				description: 'The ID of the file to download',
			},
			// File upload fields
			{
				displayName: 'Input Data Field Name',
				name: 'binaryDataField',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['files'],
						operation: ['upload'],
					},
				},
				default: 'data',
				required: true,
				description: 'Name of the binary data field containing the file',
			},
			{
				displayName: 'File Type',
				name: 'fileType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['files'],
						operation: ['upload'],
					},
				},
				options: [
					{
						name: 'Voucher',
						value: 'voucher',
					},
					{
						name: 'Invoice',
						value: 'invoice',
					},
					{
						name: 'Credit Note',
						value: 'creditnote',
					},
					{
						name: 'Delivery Note',
						value: 'deliverynote',
					},
				],
				default: 'voucher',
				required: true,
				description: 'Type of the file being uploaded',
			},
			// Search/filter fields
			{
				displayName: 'Search Term',
				name: 'searchTerm',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['contacts', 'articles'],
						operation: ['getAll'],
					},
				},
				default: '',
				description: 'Search term to filter results (optional)',
			},
			// Additional query parameters
			{
				displayName: 'Additional Query Parameters',
				name: 'additionalQueryParams',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['contacts', 'articles', 'credit-notes', 'delivery-notes'],
						operation: ['getAll'],
					},
				},
				default: {},
				placeholder: 'Add Query Parameter',
				options: [
					{
						name: 'parameters',
						displayName: 'Parameter',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name of the query parameter',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the query parameter',
							},
						],
					},
				],
				description: 'Add custom query parameters as specified in the Lexware API documentation',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['contacts', 'articles', 'credit-notes', 'delivery-notes'],
						operation: ['getAll'],
					},
				},
				default: 0,
				description: 'Page number for pagination (optional)',
			},
			{
				displayName: 'Size',
				name: 'size',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['contacts', 'articles', 'credit-notes', 'delivery-notes'],
						operation: ['getAll'],
					},
				},
				default: 25,
				description: 'Number of items per page (max 250)',
			},
			// Rate limiting options
			{
				displayName: 'Rate Limiting Options',
				name: 'rateLimitOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Enable Rate Limiting',
						name: 'enableRateLimit',
						type: 'boolean',
						default: true,
						description: 'Whether to handle rate limiting automatically',
					},
					{
						displayName: 'Max Retries',
						name: 'maxRetries',
						type: 'number',
						default: 3,
						description: 'Maximum number of retries on rate limit (429) errors',
					},
					{
						displayName: 'Base Delay (ms)',
						name: 'baseDelay',
						type: 'number',
						default: 1000,
						description: 'Base delay in milliseconds between retries',
					},
					{
						displayName: 'Max Delay (ms)',
						name: 'maxDelay',
						type: 'number',
						default: 30000,
						description: 'Maximum delay in milliseconds between retries',
					},
				],
				description: 'Configure rate limiting behavior',
			},
			// Voucherlist specific fields
			{
				displayName: 'Voucher Date From',
				name: 'voucherDateFrom',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['voucherlist'],
						operation: ['getAll'],
					},
				},
				default: '',
				description: 'Filter vouchers from this date (YYYY-MM-DD)',
			},
			{
				displayName: 'Voucher Date To',
				name: 'voucherDateTo',
				type: 'dateTime',
				displayOptions: {
					show: {
						resource: ['voucherlist'],
						operation: ['getAll'],
					},
				},
				default: '',
				description: 'Filter vouchers until this date (YYYY-MM-DD)',
			},
			{
				displayName: 'Voucher Status',
				name: 'voucherStatus',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['voucherlist'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						name: 'Any',
						value: '',
					},
					{
						name: 'Draft',
						value: 'draft',
					},
					{
						name: 'Open',
						value: 'open',
					},
					{
						name: 'Paid',
						value: 'paid',
					},
					{
						name: 'Overdue',
						value: 'overdue',
					},
					{
						name: 'Voided',
						value: 'voided',
					},
				],
				default: '',
				description: 'Filter by voucher status',
			},
			{
				displayName: 'Voucher Type',
				name: 'voucherType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['voucherlist'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						name: 'Any',
						value: '',
					},
					{
						name: 'Invoice',
						value: 'invoice',
					},
					{
						name: 'Sales Invoice',
						value: 'salesinvoice',
					},
					{
						name: 'Sales Credit Note',
						value: 'salescreditnote',
					},
					{
						name: 'Purchase Invoice',
						value: 'purchaseinvoice',
					},
					{
						name: 'Purchase Credit Note',
						value: 'purchasecreditnote',
					},
					{
						name: 'Delivery Note',
						value: 'deliverynote',
					},
					{
						name: 'Invoice Receipt',
						value: 'invoicereceipt',
					},
				],
				default: '',
				description: 'Filter by voucher type',
			},
			{
				displayName: 'Archived',
				name: 'archived',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['voucherlist'],
						operation: ['getAll'],
					},
				},
				default: false,
				description: 'Whether to include archived vouchers',
			},
			// Enhanced pagination for voucherlist
			{
				displayName: 'Page',
				name: 'voucherPage',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['voucherlist'],
						operation: ['getAll'],
					},
				},
				default: 0,
				description: 'Page number for pagination (optional)',
			},
			{
				displayName: 'Size',
				name: 'voucherSize',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['voucherlist'],
						operation: ['getAll'],
					},
				},
				default: 25,
				description: 'Number of items per page (max 250)',
			},
			// JSON data field for create/update operations
			{
				displayName: 'Data',
				name: 'data',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['contacts', 'articles', 'invoices', 'credit-notes', 'delivery-notes'],
						operation: ['create', 'update'],
					},
				},
				default: '{}',
				required: true,
				description: 'JSON data for the resource (see Lexware API documentation for structure)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const credentials = await this.getCredentials('lexwareApi');
		
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Rate limiting helper function
		const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

		const makeRequestWithRetry = async (options: IHttpRequestOptions, rateLimitOptions: any): Promise<any> => {
			const { enableRateLimit = true, maxRetries = 3, baseDelay = 1000, maxDelay = 30000 } = rateLimitOptions;
			
			let lastError: Error | null = null;
			
			for (let attempt = 0; attempt <= maxRetries; attempt++) {
				try {
					return await this.helpers.httpRequest(options);
				} catch (error: any) {
					lastError = error;
					
					// Check if it's a rate limit error (429) and rate limiting is enabled
					if (enableRateLimit && error.response?.status === 429 && attempt < maxRetries) {
						// Calculate delay with exponential backoff
						const exponentialDelay = baseDelay * Math.pow(2, attempt);
						const jitterDelay = exponentialDelay + (Math.random() * 1000); // Add jitter
						const delayMs = Math.min(jitterDelay, maxDelay);
						
						// Check if Retry-After header is present
						const retryAfter = error.response?.headers?.['retry-after'];
						const finalDelayMs = retryAfter ? parseInt(retryAfter) * 1000 : delayMs;
						
						console.log(`Rate limit hit (429). Retrying after ${finalDelayMs}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
						await sleep(finalDelayMs);
						continue;
					}
					
					// For other errors or if rate limiting is disabled, throw immediately
					throw error;
				}
			}
			
			// If we get here, all retries have been exhausted
			throw lastError;
		};

		for (let i = 0; i < items.length; i++) {
			try {
				// Get rate limiting options
				const rateLimitOptions = this.getNodeParameter('rateLimitOptions', i, {}) as IDataObject;
				
				let responseData;
				let url = '';
				let method: IHttpRequestMethods = 'GET';
				let body: IDataObject | Buffer | undefined;
				let headers: IDataObject = {
					'Authorization': `Bearer ${credentials.apiKey}`,
					'Accept': 'application/json',
				};

				// Build URL and set method based on resource and operation
				if (resource === 'contacts') {
					if (operation === 'get') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						url = `https://api.lexware.io/v1/contacts/${contactId}`;
					} else if (operation === 'create') {
						method = 'POST';
						url = 'https://api.lexware.io/v1/contacts';
						body = this.getNodeParameter('data', i) as IDataObject;
						headers['Content-Type'] = 'application/json';
					} else if (operation === 'update') {
						method = 'PUT';
						const contactId = this.getNodeParameter('contactId', i) as string;
						url = `https://api.lexware.io/v1/contacts/${contactId}`;
						body = this.getNodeParameter('data', i) as IDataObject;
						headers['Content-Type'] = 'application/json';
					} else {
						// getAll
						const queryParams: string[] = [];
						const searchTerm = this.getNodeParameter('searchTerm', i, '') as string;
						const page = this.getNodeParameter('page', i, 0) as number;
						const size = this.getNodeParameter('size', i, 25) as number;
						const additionalParams = this.getNodeParameter('additionalQueryParams', i, { parameters: [] }) as IDataObject;

						if (searchTerm) queryParams.push(`email=${encodeURIComponent(searchTerm)}`);
						if (page > 0) queryParams.push(`page=${page}`);
						if (size !== 25) queryParams.push(`size=${size}`);

						// Add additional query parameters
						if (additionalParams.parameters && Array.isArray(additionalParams.parameters)) {
							for (const param of additionalParams.parameters as IDataObject[]) {
								if (param.name && param.value) {
									queryParams.push(`${encodeURIComponent(param.name as string)}=${encodeURIComponent(param.value as string)}`);
								}
							}
						}

						const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
						url = `https://api.lexware.io/v1/contacts${queryString}`;
					}
				} else if (resource === 'articles') {
					if (operation === 'get') {
						const articleId = this.getNodeParameter('articleId', i) as string;
						url = `https://api.lexware.io/v1/articles/${articleId}`;
					} else if (operation === 'create') {
						method = 'POST';
						url = 'https://api.lexware.io/v1/articles';
						body = this.getNodeParameter('data', i) as IDataObject;
						headers['Content-Type'] = 'application/json';
					} else if (operation === 'update') {
						method = 'PUT';
						const articleId = this.getNodeParameter('articleId', i) as string;
						url = `https://api.lexware.io/v1/articles/${articleId}`;
						body = this.getNodeParameter('data', i) as IDataObject;
						headers['Content-Type'] = 'application/json';
					} else {
						// getAll
						const queryParams: string[] = [];
						const searchTerm = this.getNodeParameter('searchTerm', i, '') as string;
						const page = this.getNodeParameter('page', i, 0) as number;
						const size = this.getNodeParameter('size', i, 25) as number;
						const additionalParams = this.getNodeParameter('additionalQueryParams', i, { parameters: [] }) as IDataObject;

						if (searchTerm) queryParams.push(`title=${encodeURIComponent(searchTerm)}`);
						if (page > 0) queryParams.push(`page=${page}`);
						if (size !== 25) queryParams.push(`size=${size}`);

						// Add additional query parameters
						if (additionalParams.parameters && Array.isArray(additionalParams.parameters)) {
							for (const param of additionalParams.parameters as IDataObject[]) {
								if (param.name && param.value) {
									queryParams.push(`${encodeURIComponent(param.name as string)}=${encodeURIComponent(param.value as string)}`);
								}
							}
						}

						const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
						url = `https://api.lexware.io/v1/articles${queryString}`;
					}
				} else if (resource === 'files') {
					if (operation === 'upload') {
						method = 'POST';
						url = 'https://api.lexware.io/v1/files';
						
						const binaryDataField = this.getNodeParameter('binaryDataField', i) as string;
						const fileType = this.getNodeParameter('fileType', i) as string;
						
						const binaryData = this.helpers.assertBinaryData(i, binaryDataField);
						const buffer = Buffer.from(binaryData.data, 'base64');
						
						// Create form data manually
						const boundary = `----formdata-n8n-${Math.random().toString(36)}`;
						const formDataParts: string[] = [];
						
						// Add file part
						formDataParts.push(`--${boundary}`);
						formDataParts.push(`Content-Disposition: form-data; name="file"; filename="${binaryData.fileName || 'file'}"`);
						formDataParts.push(`Content-Type: ${binaryData.mimeType || 'application/octet-stream'}`);
						formDataParts.push('');
						
						// Add type part
						const fileBuffer = Buffer.concat([
							Buffer.from(formDataParts.join('\r\n') + '\r\n'),
							buffer,
							Buffer.from(`\r\n--${boundary}\r\n`),
							Buffer.from(`Content-Disposition: form-data; name="type"\r\n\r\n${fileType}\r\n--${boundary}--\r\n`)
						]);
						
						body = fileBuffer;
						headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
						delete headers['Accept']; // Remove Accept header for file uploads
					} else if (operation === 'download') {
						const fileId = this.getNodeParameter('fileId', i) as string;
						url = `https://api.lexware.io/v1/files/${fileId}`;
					}
				} else if (resource === 'voucherlist') {
					// Voucherlist endpoint
					const queryParams: string[] = [];
					
					const voucherDateFrom = this.getNodeParameter('voucherDateFrom', i, '') as string;
					const voucherDateTo = this.getNodeParameter('voucherDateTo', i, '') as string;
					const voucherStatus = this.getNodeParameter('voucherStatus', i, '') as string;
					const voucherType = this.getNodeParameter('voucherType', i, '') as string;
					const archived = this.getNodeParameter('archived', i, false) as boolean;
					const page = this.getNodeParameter('voucherPage', i, 0) as number;
					const size = this.getNodeParameter('voucherSize', i, 25) as number;

					if (voucherDateFrom) {
						const dateFrom = new Date(voucherDateFrom).toISOString().split('T')[0];
						queryParams.push(`voucherDateFrom=${dateFrom}`);
					}
					if (voucherDateTo) {
						const dateTo = new Date(voucherDateTo).toISOString().split('T')[0];
						queryParams.push(`voucherDateTo=${dateTo}`);
					}
					if (voucherStatus) queryParams.push(`voucherStatus=${voucherStatus}`);
					if (voucherType) queryParams.push(`voucherType=${voucherType}`);
					if (archived) queryParams.push(`archived=${archived}`);
					if (page > 0) queryParams.push(`page=${page}`);
					if (size !== 25) queryParams.push(`size=${size}`);

					const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
					url = `https://api.lexware.io/v1/voucherlist${queryString}`;
				} else {
					// invoices, credit-notes, delivery-notes
					if (operation === 'get') {
						const documentId = this.getNodeParameter('documentId', i) as string;
						url = `https://api.lexware.io/v1/${resource}/${documentId}`;
					} else if (operation === 'create') {
						method = 'POST';
						url = `https://api.lexware.io/v1/${resource}`;
						body = this.getNodeParameter('data', i) as IDataObject;
						headers['Content-Type'] = 'application/json';
					} else if (operation === 'getAll' && (resource === 'credit-notes' || resource === 'delivery-notes')) {
						// getAll operation for credit-notes and delivery-notes
						const queryParams: string[] = [];
						const page = this.getNodeParameter('page', i, 0) as number;
						const size = this.getNodeParameter('size', i, 25) as number;
						const additionalParams = this.getNodeParameter('additionalQueryParams', i, { parameters: [] }) as IDataObject;

						if (page > 0) queryParams.push(`page=${page}`);
						if (size !== 25) queryParams.push(`size=${size}`);

						// Add additional query parameters
						if (additionalParams.parameters && Array.isArray(additionalParams.parameters)) {
							for (const param of additionalParams.parameters as IDataObject[]) {
								if (param.name && param.value) {
									queryParams.push(`${encodeURIComponent(param.name as string)}=${encodeURIComponent(param.value as string)}`);
								}
							}
						}

						const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
						url = `https://api.lexware.io/v1/${resource}${queryString}`;
					}
				}

				const options: IHttpRequestOptions = {
					method,
					url,
					headers,
					json: !(resource === 'files' && operation === 'upload'),
				};

				if (body) {
					options.body = body;
				}

				responseData = await makeRequestWithRetry(options, rateLimitOptions);
				
				// Handle different response structures
				if (operation === 'download' && resource === 'files') {
					// For file downloads, return binary data
					const binaryData = await this.helpers.prepareBinaryData(
						Buffer.from(responseData),
						`lexware-file-${this.getNodeParameter('fileId', i)}`
					);
					returnData.push({ 
						json: { fileId: this.getNodeParameter('fileId', i) }, 
						binary: { data: binaryData } 
					});
				} else if (responseData.content && Array.isArray(responseData.content)) {
					// Paginated results
					returnData.push(...responseData.content);
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