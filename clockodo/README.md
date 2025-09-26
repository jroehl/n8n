# n8n-nodes-clockodo

Custom n8n node for integrating with the [Clockodo](https://www.clockodo.com/) time tracking API.

## Installation

### Via npm

```bash
npm install n8n-nodes-clockodo
```

### Manual Installation

1. Clone this repository
2. Build the node: `npm run build`
3. Copy to your n8n custom folder:
   ```bash
   cp -r dist/* ~/.n8n/custom/
   cp clockodo.png ~/.n8n/custom/
   ```
4. Restart n8n

## Configuration

1. In n8n, go to **Settings** → **Credentials**
2. Add new **Clockodo API** credentials
3. Enter your:
   - **Email**: Your Clockodo account email
   - **API Key**: Found in your Clockodo account settings

## Available Operations

### Business Groups
- **Get All**: Retrieve all non-business groups

### Clock
- **Get Status**: Get current clock status
- **Clock In**: Start time tracking
- **Clock Out**: Stop time tracking

### Customers
- **Get All**: Retrieve all customers

### Entries (Time Entries)
- **Get All**: Retrieve time entries with optional filtering
  - Date range filtering (start/end dates)
  - Billable entries only filter
- **Create**: Create a new time entry

### Projects
- **Get All**: Retrieve all projects

### Services
- **Get All**: Retrieve all services
- **Get**: Get specific service by ID

### Users
- **Get All**: Retrieve all users
- **Get Me**: Get current user information

## Examples

### Get Today's Time Entries
```json
{
  "resource": "entries",
  "operation": "getAll",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-01-01T23:59:59.999Z"
}
```

### Clock In
```json
{
  "resource": "clock",
  "operation": "clockIn",
  "customersId": 123,
  "servicesId": 456
}
```

### Create Time Entry
```json
{
  "resource": "entries",
  "operation": "create",
  "customersId": 123,
  "servicesId": 456,
  "timeSince": "2025-01-01T09:00:00.000Z",
  "timeUntil": "2025-01-01T17:00:00.000Z",
  "text": "Development work"
}
```

## API Reference

This node uses the [Clockodo API v2](https://www.clockodo.com/api/). All operations require authentication via email and API key.

### Authentication Headers
- `X-ClockodoApiUser`: Your email address
- `X-ClockodoApiKey`: Your API key
- `X-Clockodo-External-Application`: Set to "n8n;support@n8n.io"

## Development

### Prerequisites
- Node.js ≥ 16.0.0
- npm
- TypeScript

### Setup
```bash
git clone https://github.com/jroehl/n8n-nodes-clockodo.git
cd n8n-nodes-clockodo/clockodo
npm install
```

### Build
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Package
```bash
npm run pack
```

## License

MIT

## Support

- [Issues](https://github.com/jroehl/n8n-nodes-clockodo/issues)
- [Clockodo API Documentation](https://www.clockodo.com/api/)
- [n8n Community](https://community.n8n.io/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request