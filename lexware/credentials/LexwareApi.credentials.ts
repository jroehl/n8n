import {
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class LexwareApi implements ICredentialType {
	name = 'lexwareApi';
	displayName = 'Lexware API';
	icon: Icon = 'file:../../lexware.png';
	documentationUrl = 'https://developers.lexware.io/docs/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Lexware API key (obtained from https://app.lexware.de/addons/public-api)',
		},
	];
}