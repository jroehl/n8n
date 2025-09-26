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
						resource: ['invoices', 'credit-notes', 'delivery-notes'],
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
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['contacts', 'articles', 'invoices', 'credit-notes', 'delivery-notes'],
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
						resource: ['contacts', 'articles', 'invoices', 'credit-notes', 'delivery-notes'],
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

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;
				let url = '';
				let method: IHttpRequestMethods = 'GET';
				let body: IDataObject | undefined;
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

						if (searchTerm) queryParams.push(`email=${encodeURIComponent(searchTerm)}`);
						if (page > 0) queryParams.push(`page=${page}`);
						if (size !== 25) queryParams.push(`size=${size}`);

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

						if (searchTerm) queryParams.push(`title=${encodeURIComponent(searchTerm)}`);
						if (page > 0) queryParams.push(`page=${page}`);
						if (size !== 25) queryParams.push(`size=${size}`);

						const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
						url = `https://api.lexware.io/v1/articles${queryString}`;
					}
				} else if (resource === 'files') {
					if (operation === 'upload') {
						// File upload requires special handling - for now, refer to n8n HTTP Request node
						throw new Error('File upload should be handled using the n8n HTTP Request node with multipart/form-data. See documentation for examples.');
					} else if (operation === 'download') {
						const fileId = this.getNodeParameter('fileId', i) as string;
						url = `https://api.lexware.io/v1/files/${fileId}`;
					}
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
					} else {
						// getAll
						const queryParams: string[] = [];
						const page = this.getNodeParameter('page', i, 0) as number;
						const size = this.getNodeParameter('size', i, 25) as number;

						if (page > 0) queryParams.push(`page=${page}`);
						if (size !== 25) queryParams.push(`size=${size}`);

						const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
						url = `https://api.lexware.io/v1/${resource}${queryString}`;
					}
				}

				const options: IHttpRequestOptions = {
					method,
					url,
					headers,
					json: operation !== 'upload' || resource !== 'files',
				};

				if (body) {
					options.body = body;
				}

				responseData = await this.helpers.httpRequest(options);
				
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