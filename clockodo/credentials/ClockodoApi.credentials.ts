import {
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class ClockodoApi implements ICredentialType {
	name = 'clockodoApi';
	displayName = 'Clockodo API';
	icon: Icon = 'file:../../clockodo.png';
	documentationUrl = 'https://www.clockodo.com/api/';
	properties: INodeProperties[] = [
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Clockodo account email address',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Clockodo API key (found in your account settings)',
		},
	];
}