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

## Quick Deployment

Deploy any custom node to your Docker n8n instance:

```bash
./deploy-node.sh <node-directory> [remote-host]
```

### Examples

```bash
# Deploy Clockodo node to default host (localhost)
./deploy-node.sh clockodo

# Deploy to specific remote host
./deploy-node.sh clockodo my-docker-host

# Deploy from any path
./deploy-node.sh /path/to/my-custom-node remote-server
```

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