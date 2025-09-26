# n8n-nodes-lexware

Custom n8n node for integrating with the [Lexware](https://www.lexware.de/) API.

## Installation

### Via npm

```bash
npm install n8n-nodes-lexware
```

### Manual Installation

1. Clone this repository
2. Build the node: `npm run build`
3. Copy to your n8n custom folder:
   ```bash
   cp -r dist/* ~/.n8n/custom/
   cp lexware.png ~/.n8n/custom/
   ```
4. Restart n8n

## Configuration

1. In n8n, go to **Settings** → **Credentials**
2. Add new **Lexware API** credentials
3. Enter your **API Key** (obtained from https://app.lexware.de/addons/public-api)

## Available Operations

### 📇 Contacts
- **Get All**: Retrieve all contacts with optional search and pagination
- **Get**: Get a specific contact by ID
- **Create**: Create a new contact
- **Update**: Update an existing contact

### 📦 Articles
- **Get All**: Retrieve all articles with optional search and pagination
- **Get**: Get a specific article by ID
- **Create**: Create a new article
- **Update**: Update an existing article

### 🧾 Invoices
- **Get All**: Retrieve all invoices with pagination
- **Get**: Get a specific invoice by ID
- **Create**: Create a new invoice

### 💰 Credit Notes
- **Get All**: Retrieve all credit notes with pagination
- **Get**: Get a specific credit note by ID
- **Create**: Create a new credit note

### 📋 Delivery Notes
- **Get All**: Retrieve all delivery notes with pagination
- **Get**: Get a specific delivery note by ID
- **Create**: Create a new delivery note

### 📁 Files
- **Download**: Download a file by ID
- **Upload**: Use n8n HTTP Request node (see examples below)

## Examples

### Get All Contacts
```json
{
  "resource": "contacts",
  "operation": "getAll",
  "searchTerm": "john@example.com",
  "page": 0,
  "size": 25
}
```

### Create Contact
```json
{
  "resource": "contacts",
  "operation": "create",
  "data": {
    "version": 0,
    "roles": {
      "customer": {}
    },
    "name": {
      "company": "Acme Corp"
    },
    "addresses": {
      "billing": [{
        "street": "Main Street 123",
        "zip": "12345",
        "city": "Berlin",
        "countryCode": "DE"
      }]
    },
    "emailAddresses": {
      "business": ["contact@acme.com"]
    }
  }
}
```

### Create Invoice
```json
{
  "resource": "invoices",
  "operation": "create",
  "data": {
    "voucherDate": "2025-01-15T00:00:00.000+01:00",
    "address": {
      "contactId": "your-contact-id"
    },
    "lineItems": [{
      "type": "custom",
      "name": "Consulting Services",
      "quantity": 1,
      "unitName": "hour",
      "unitPrice": {
        "currency": "EUR",
        "netAmount": 100.00,
        "taxRatePercentage": 19
      }
    }],
    "totalPrice": {
      "currency": "EUR"
    },
    "taxConditions": {
      "taxType": "net"
    }
  }
}
```

### File Upload (Using n8n HTTP Request Node)
For file uploads, use the n8n HTTP Request node with these settings:

**URL**: `https://api.lexware.io/v1/files`
**Method**: POST
**Authentication**: Generic Credential Type → HTTP Header Auth
**Headers**:
- `Authorization`: `Bearer YOUR_API_KEY`
- `Accept`: `application/json`

**Body**: Multipart Form Data
- `file`: Binary data from previous node
- `type`: `voucher` (or `invoice`, `creditnote`, `deliverynote`)

## API Reference

This node uses the [Lexware API v1](https://developers.lexware.io/docs/). All operations require authentication via API key.

### Rate Limits
- Maximum 2 requests per second
- Implement appropriate delays between requests

### Authentication
- Bearer token authentication: `Authorization: Bearer {apiKey}`
- API key obtained from: https://app.lexware.de/addons/public-api

## Development

### Prerequisites
- Node.js ≥ 16.0.0
- npm
- TypeScript

### Setup
```bash
git clone https://github.com/jroehl/n8n-nodes-lexware.git
cd n8n-nodes-lexware/lexware
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

- [Issues](https://github.com/jroehl/n8n-nodes-lexware/issues)
- [Lexware API Documentation](https://developers.lexware.io/docs/)
- [n8n Community](https://community.n8n.io/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request