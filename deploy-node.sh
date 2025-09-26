#!/bin/bash

# Generic n8n node deployment script for Docker instances
# Usage: ./deploy-node.sh [node-directory] [remote-host]
# Example: ./deploy-node.sh clockodo localhost
# Example: ./deploy-node.sh ./my-custom-node ssh-host

set -e

# Function to display usage
usage() {
    echo "Usage: $0 <node-directory> [remote-host]"
    echo ""
    echo "Arguments:"
    echo "  node-directory  Path to the node directory (relative or absolute)"
    echo "  remote-host     SSH host for deployment (default: localhost)"
    echo ""
    echo "Examples:"
    echo "  $0 clockodo"
    echo "  $0 ./path/to/my-node remote-server"
    echo "  $0 /absolute/path/to/node"
    exit 1
}

# Check arguments
if [ $# -lt 1 ]; then
    usage
fi

# Parse arguments
NODE_DIR="$1"
REMOTE_HOST="${2:-localhost}"

# Convert to absolute path if relative
if [[ ! "$NODE_DIR" = /* ]]; then
    NODE_DIR="$(pwd)/$NODE_DIR"
fi

# Remove trailing slash if present
NODE_DIR="${NODE_DIR%/}"

# Check if directory exists
if [ ! -d "$NODE_DIR" ]; then
    echo "❌ Error: Directory '$NODE_DIR' not found"
    exit 1
fi

# Check for package.json
if [ ! -f "$NODE_DIR/package.json" ]; then
    echo "❌ Error: No package.json found in '$NODE_DIR'"
    exit 1
fi

# Extract node information from package.json
NODE_NAME=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$NODE_DIR/package.json" | cut -d'"' -f4)
NODE_VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$NODE_DIR/package.json" | cut -d'"' -f4)

if [ -z "$NODE_NAME" ] || [ -z "$NODE_VERSION" ]; then
    echo "❌ Error: Could not extract name or version from package.json"
    exit 1
fi

echo "🚀 Starting deployment of '$NODE_NAME' v$NODE_VERSION to Docker n8n..."
echo "📁 Node directory: $NODE_DIR"
echo "🌐 Remote host: $REMOTE_HOST"

# Step 1: Build the node locally
echo ""
echo "📦 Building the node..."
cd "$NODE_DIR"
npm install
npm run build

# Step 2: Package the node
echo "📦 Creating package..."
npm pack

# Step 3: Find icon files (svg or png)
ICON_FILE=""
for ext in svg png jpg jpeg; do
    # Look for icon with node name
    if [ -f "$NODE_DIR/${NODE_NAME#n8n-nodes-}.$ext" ]; then
        ICON_FILE="${NODE_NAME#n8n-nodes-}.$ext"
        break
    fi
    # Look for any icon file
    if [ -f "$NODE_DIR/icon.$ext" ]; then
        ICON_FILE="icon.$ext"
        break
    fi
done

# Step 4: Create a temporary deployment directory
echo "📁 Preparing deployment files..."
TEMP_DIR=$(mktemp -d)
mkdir -p "$TEMP_DIR/deploy"

# Copy necessary files
cp "$NODE_DIR/${NODE_NAME}-${NODE_VERSION}.tgz" "$TEMP_DIR/deploy/"

# Copy icon if found
if [ -n "$ICON_FILE" ] && [ -f "$NODE_DIR/$ICON_FILE" ]; then
    echo "🎨 Found icon: $ICON_FILE"
    cp "$NODE_DIR/$ICON_FILE" "$TEMP_DIR/deploy/"
fi

# Create deployment script with parameters
cat > "$TEMP_DIR/deploy/install.sh" << EOF
#!/bin/bash
set -e

NODE_NAME="$NODE_NAME"
NODE_VERSION="$NODE_VERSION"
PACKAGE_FILE="${NODE_NAME}-${NODE_VERSION}.tgz"
ICON_FILE="$ICON_FILE"

echo "🔧 Installing custom node '\$NODE_NAME' in Docker container..."

# Find n8n container
N8N_CONTAINER=\$(docker ps --format "table {{.Names}}" | grep -E "n8n" | head -1)

if [ -z "\$N8N_CONTAINER" ]; then
    echo "❌ Error: No n8n container found"
    exit 1
fi

echo "📦 Found n8n container: \$N8N_CONTAINER"

# Create custom directory in container
docker exec "\$N8N_CONTAINER" mkdir -p /home/node/.n8n/custom

# Copy and install the package
echo "📤 Copying package to container..."
docker cp "\$PACKAGE_FILE" "\$N8N_CONTAINER":/home/node/.n8n/custom/

# Copy icon if present
if [ -n "\$ICON_FILE" ] && [ -f "\$ICON_FILE" ]; then
    echo "🎨 Copying icon..."
    docker cp "\$ICON_FILE" "\$N8N_CONTAINER":/home/node/.n8n/custom/
fi

# Install the package inside container
echo "📥 Installing package..."
docker exec "\$N8N_CONTAINER" sh -c "cd /home/node/.n8n/custom && npm install \$PACKAGE_FILE"

# Clean up package file
docker exec "\$N8N_CONTAINER" rm /home/node/.n8n/custom/\$PACKAGE_FILE

# Restart n8n container
echo "🔄 Restarting n8n container..."
docker restart "\$N8N_CONTAINER"

echo "✅ Custom node '\$NODE_NAME' installed successfully!"
echo "⏳ Waiting for n8n to restart..."
sleep 10
echo "🎉 Done! The \$NODE_NAME node should now be available in n8n."
EOF

chmod +x "$TEMP_DIR/deploy/install.sh"

# Step 5: Copy files to remote host
echo "📤 Copying files to remote host..."
scp -r "$TEMP_DIR/deploy" "$REMOTE_HOST":~/

# Step 6: Execute installation on remote host
echo "🔧 Installing on remote host..."
ssh "$REMOTE_HOST" "cd ~/deploy && ./install.sh"

# Step 7: Cleanup
echo "🧹 Cleaning up..."
ssh "$REMOTE_HOST" "rm -rf ~/deploy"
rm -rf "$TEMP_DIR"
rm -f "$NODE_DIR/${NODE_NAME}-${NODE_VERSION}.tgz"

echo ""
echo "✅ Deployment complete!"
echo "🎉 The '$NODE_NAME' node is now available in your n8n instance!"
echo ""
echo "📝 Next steps:"
echo "1. Open n8n in your browser"
echo "2. Create a new workflow"
echo "3. Search for '${NODE_NAME#n8n-nodes-}' in the node panel"
echo "4. Configure the node with required credentials"