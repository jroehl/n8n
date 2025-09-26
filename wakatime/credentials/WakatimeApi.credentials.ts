import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class WakatimeApi implements ICredentialType {
	name = 'wakatimeApi';
	displayName = 'Wakatime API';
	documentationUrl = 'https://wakatime.com/developers';
	icon: Icon = 'file:../../wakatime.svg';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Wakatime API key from your account settings',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				api_key: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://wakatime.com/api/v1',
			url: '/users/current',
		},
	};
}