# n8n Custom Nodes

This repository contains custom n8n nodes and deployment tools for Docker-based n8n instances.

## Available Nodes

### 🕒 [Clockodo](./clockodo/)
Time tracking integration for the Clockodo API.

**Features:**
- Complete API coverage (entries, clock, users, projects, services, business groups)
- Authentication via email + API key
- Date filtering for time entries
- Clock in/out operations
- User and project management

### 🧾 [Lexware](./lexware/)
Accounting and invoicing integration for the Lexware API.

**Features:**
- Complete API coverage (contacts, articles, invoices, credit notes, delivery notes, files)
- Bearer token authentication
- CRUD operations for all resources
- Pagination support
- File download functionality

## Quick Deployment

Deploy one or multiple custom nodes to your Docker n8n instance:

```bash
./deploy-node.sh [OPTIONS] <node-directory1> [node-directory2] ...
```

### Examples

```bash
# Deploy single node to default host (localhost)
./deploy-node.sh clockodo

# Deploy multiple nodes at once
./deploy-node.sh clockodo lexware

# Deploy to specific remote host
./deploy-node.sh -h my-docker-host clockodo lexware

# Deploy with verbose output
./deploy-node.sh -v --host remote-server clockodo lexware

# Deploy from any path
./deploy-node.sh --host my-server /path/to/custom-node ./relative-path
```

### Options

- `-h, --host HOST`: SSH host for deployment (default: localhost)
- `-v, --verbose`: Enable verbose output for debugging
- `--help`: Show detailed help message

## Requirements

- Node.js ≥ 16.0.0 and npm
- SSH access to the remote Docker host
- Docker with n8n container running

## How Deployment Works

1. **Builds** the node locally using npm
2. **Packages** it as a .tgz file
3. **Auto-detects** icon files
4. **Copies** files to remote host via SSH
5. **Installs** inside the n8n Docker container
6. **Restarts** the container to load the new node

## Creating New Custom Nodes

1. Create a new directory for your node
2. Add `package.json` with n8n node configuration
3. Create your node TypeScript files
4. Add an icon (SVG/PNG) with your node name
5. Run `./deploy-node.sh your-node-directory`

## Repository Structure

```
├── clockodo/              # Clockodo n8n node
├── lexware/             # Lexware n8n node
├── deploy-node.sh         # Generic deployment script
├── custom-node-installer-workflow.json
├── simple-node-upload-workflow.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests if applicable
4. Ensure code follows best practices
5. Submit a pull request

## License

MIT