# n8n-nodes-working-days

Custom n8n node for calculating working days and holidays for German states.

## Installation

### Via npm

```bash
npm install n8n-nodes-working-days
```

### Manual Installation

1. Clone this repository
2. Build the node: `npm run build`
3. Copy to your n8n custom folder:
   ```bash
   cp -r dist/* ~/.n8n/custom/
   cp working-days.svg ~/.n8n/custom/
   ```
4. Restart n8n

## Features

### 📊 Working Days Statistics
- **Day**: Calculate working days for current day
- **Week**: Calculate working days for current week
- **Month**: Calculate working days for current month  
- **Year**: Calculate working days for current year

### 📅 Date Range Calculations
- Calculate working days for any custom date range
- Exclude German public holidays automatically
- Support for multiple German states

### 🏛️ German Public Holidays
- **Supported States**: Berlin, Brandenburg, Hamburg, Schleswig-Holstein
- **Holiday API**: Integration with German public holiday API
- **Caching**: 7-day cache for holiday data

### ⚙️ Configurable Working Days
- Select which days are considered working days
- Default: Monday to Friday
- Customizable for any business schedule

## Operations

### Get Statistics
Get comprehensive working days statistics for day/week/month/year periods.

**Parameters:**
- **Reference Date**: Date to calculate statistics for (default: today)
- **German State**: State for public holiday calculation
- **Working Days**: Days considered as working days
- **Include Breakdown**: Include detailed day-by-day breakdown

### Calculate Range
Calculate working days for a specific date range.

**Parameters:**
- **From Date**: Start date of the range
- **To Date**: End date of the range
- **German State**: State for public holiday calculation
- **Working Days**: Days considered as working days
- **Include Breakdown**: Include detailed day-by-day breakdown

## Examples

### Get Current Month Statistics
```json
{
  "operation": "getStats",
  "referenceDate": "2025-01-15T00:00:00.000Z",
  "state": "Berlin",
  "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "includeBreakdown": true
}
```

**Response:**
```json
{
  "operation": "getStats",
  "referenceDate": "2025-01-15T00:00:00.000Z",
  "state": "Berlin",
  "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "statistics": {
    "month": {
      "all": {
        "totals": {
          "workingDays": 22,
          "workingDaysExcludingPublicHolidays": 21,
          "holidays": 1
        },
        "workingDays": { "total": 22, "days": [...] },
        "holidays": { "total": 1, "days": [...] }
      },
      "remaining": {
        "totals": {
          "workingDays": 12,
          "workingDaysExcludingPublicHolidays": 12,
          "holidays": 0
        }
      }
    }
  }
}
```

### Calculate Custom Date Range
```json
{
  "operation": "calculateRange",
  "fromDate": "2025-01-01T00:00:00.000Z",
  "toDate": "2025-01-31T23:59:59.999Z",
  "state": "Hamburg",
  "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "includeBreakdown": false
}
```

**Response:**
```json
{
  "operation": "calculateRange",
  "fromDate": "2025-01-01T00:00:00.000Z",
  "toDate": "2025-01-31T23:59:59.999Z",
  "state": "Hamburg",
  "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "statistics": {
    "totals": {
      "workingDays": 22,
      "workingDaysExcludingPublicHolidays": 21,
      "holidays": 1
    }
  }
}
```

## Supported German States

- **Berlin** (be)
- **Brandenburg** (bb)
- **Hamburg** (hh)
- **Schleswig-Holstein** (sh)

*More states can be added by extending the STATE_MAPPING in the code.*

## API Integration

This node uses the German public holidays API:
- **URL**: https://get.api-feiertage.de/
- **Caching**: 7 days to minimize API calls
- **States**: Configurable state codes for accurate holiday calculation

## Development

### Prerequisites
- Node.js ≥ 16.0.0
- npm
- TypeScript

### Setup
```bash
git clone https://github.com/jroehl/n8n-nodes-working-days.git
cd n8n-nodes-working-days/working-days
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

## Use Cases

- **Project Planning**: Calculate available working days for project timelines
- **HR Systems**: Determine work days for payroll and attendance
- **Scheduling**: Plan tasks around public holidays and weekends
- **Business Analytics**: Track working day patterns and productivity
- **Automation**: Trigger workflows based on working day calculations

## License

MIT

## Support

- [Issues](https://github.com/jroehl/n8n-nodes-working-days/issues)
- [German Holiday API](https://get.api-feiertage.de/)
- [n8n Community](https://community.n8n.io/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request