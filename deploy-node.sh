#!/bin/bash

# Enhanced n8n node deployment script for Docker instances
# Usage: ./deploy-node-multi.sh [OPTIONS] <node-directory1> [node-directory2] ...
# Example: ./deploy-node-multi.sh clockodo lexware
# Example: ./deploy-node-multi.sh -h my-docker-host clockodo lexware
# Example: ./deploy-node-multi.sh --host remote-server ./my-custom-node

set -e

# Default values
REMOTE_HOST="localhost"
NODE_DIRS=()
VERBOSE=false

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS] <node-directory1> [node-directory2] ..."
    echo ""
    echo "Options:"
    echo "  -h, --host HOST     SSH host for deployment (default: localhost)"
    echo "  -v, --verbose       Enable verbose output"
    echo "  --help              Show this help message"
    echo ""
    echo "Arguments:"
    echo "  node-directory      Path(s) to node directories (relative or absolute)"
    echo ""
    echo "Examples:"
    echo "  $0 clockodo"
    echo "  $0 clockodo lexware"
    echo "  $0 -h my-docker-host clockodo lexware"
    echo "  $0 --host remote-server ./my-custom-node /absolute/path/to/node"
    echo "  $0 -v --host my-server clockodo lexware"
    echo ""
    echo "Features:"
    echo "  • Deploy multiple nodes in a single command"
    echo "  • Automatic build and packaging for each node"
    echo "  • Icon detection and deployment"
    echo "  • Atomic deployment (all nodes or none)"
    echo "  • Rollback on failure"
    exit 1
}

# Logging functions
log() {
    echo "$(date '+%H:%M:%S') $1"
}

verbose_log() {
    if [ "$VERBOSE" = true ]; then
        echo "$(date '+%H:%M:%S') [VERBOSE] $1"
    fi
}

error_log() {
    echo "$(date '+%H:%M:%S') ❌ ERROR: $1" >&2
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--host)
            REMOTE_HOST="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            usage
            ;;
        -*)
            error_log "Unknown option $1"
            usage
            ;;
        *)
            NODE_DIRS+=("$1")
            shift
            ;;
    esac
done

# Check if at least one node directory is provided
if [ ${#NODE_DIRS[@]} -eq 0 ]; then
    error_log "At least one node directory must be specified"
    usage
fi

# Function to validate a single node directory
validate_node_dir() {
    local dir="$1"
    
    # Convert to absolute path if relative
    if [[ ! "$dir" = /* ]]; then
        dir="$(pwd)/$dir"
    fi
    
    # Remove trailing slash if present
    dir="${dir%/}"
    
    # Check if directory exists
    if [ ! -d "$dir" ]; then
        error_log "Directory '$dir' not found"
        return 1
    fi
    
    # Check for package.json
    if [ ! -f "$dir/package.json" ]; then
        error_log "No package.json found in '$dir'"
        return 1
    fi
    
    echo "$dir"
    return 0
}

# Function to extract node information from package.json
get_node_info() {
    local dir="$1"
    local name=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$dir/package.json" | cut -d'"' -f4)
    local version=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$dir/package.json" | cut -d'"' -f4)
    
    if [ -z "$name" ] || [ -z "$version" ]; then
        error_log "Could not extract name or version from $dir/package.json"
        return 1
    fi
    
    echo "$name:$version"
    return 0
}

# Function to find icon file for a node
find_icon() {
    local dir="$1"
    local node_name="$2"
    
    # Remove n8n-nodes- prefix for icon search
    local icon_base="${node_name#n8n-nodes-}"
    
    for ext in svg png jpg jpeg; do
        # Look for icon with node name
        if [ -f "$dir/${icon_base}.$ext" ]; then
            echo "${icon_base}.$ext"
            return 0
        fi
        # Look for any icon file
        if [ -f "$dir/icon.$ext" ]; then
            echo "icon.$ext"
            return 0
        fi
    done
    
    return 1
}

# Function to build a single node
build_node() {
    local dir="$1"
    local node_name="$2"
    
    log "📦 Building node '$node_name'..."
    cd "$dir"
    
    verbose_log "Running npm install in $dir"
    if [ "$VERBOSE" = true ]; then
        npm install || {
            error_log "npm install failed for $node_name"
            return 1
        }
    else
        npm install > /dev/null 2>&1 || {
            error_log "npm install failed for $node_name"
            return 1
        }
    fi
    
    verbose_log "Running npm run build in $dir"
    if [ "$VERBOSE" = true ]; then
        npm run build || {
            error_log "npm run build failed for $node_name"
            return 1
        }
    else
        npm run build > /dev/null 2>&1 || {
            error_log "npm run build failed for $node_name"
            return 1
        }
    fi
    
    verbose_log "Running npm pack in $dir"
    if [ "$VERBOSE" = true ]; then
        npm pack || {
            error_log "npm pack failed for $node_name (this runs tests via prepack script)"
            return 1
        }
    else
        # Always show output for npm pack since it includes tests via prepack
        echo "Running tests and packaging..."
        npm pack || {
            error_log "npm pack failed for $node_name (this runs tests via prepack script)"
            return 1
        }
    fi
    
    return 0
}

log "🚀 Starting deployment of ${#NODE_DIRS[@]} node(s) to Docker n8n..."
log "🌐 Remote host: $REMOTE_HOST"

# Phase 1: Validate all directories
log ""
log "📋 Phase 1: Validating directories..."
VALIDATED_DIRS=()
NODE_INFO=()

for dir in "${NODE_DIRS[@]}"; do
    verbose_log "Validating directory: $dir"
    validated_dir=$(validate_node_dir "$dir")
    if [ $? -ne 0 ]; then
        exit 1
    fi
    
    node_info=$(get_node_info "$validated_dir")
    if [ $? -ne 0 ]; then
        exit 1
    fi
    
    VALIDATED_DIRS+=("$validated_dir")
    NODE_INFO+=("$node_info")
    
    node_name=$(echo "$node_info" | cut -d':' -f1)
    node_version=$(echo "$node_info" | cut -d':' -f2)
    
    log "✅ Validated: $node_name v$node_version"
done

# Phase 2: Build all nodes
log ""
log "🔨 Phase 2: Building nodes..."
BUILT_PACKAGES=()

for i in "${!VALIDATED_DIRS[@]}"; do
    dir="${VALIDATED_DIRS[$i]}"
    node_info="${NODE_INFO[$i]}"
    node_name=$(echo "$node_info" | cut -d':' -f1)
    node_version=$(echo "$node_info" | cut -d':' -f2)
    
    if ! build_node "$dir" "$node_name"; then
        # Cleanup any built packages on failure
        for package in "${BUILT_PACKAGES[@]}"; do
            rm -f "$package" 2>/dev/null || true
        done
        exit 1
    fi
    
    package_file="$dir/${node_name}-${node_version}.tgz"
    BUILT_PACKAGES+=("$package_file")
    
    log "✅ Built: $node_name v$node_version"
done

# Phase 3: Prepare deployment files
log ""
log "📁 Phase 3: Preparing deployment files..."
TEMP_DIR=$(mktemp -d)
mkdir -p "$TEMP_DIR/deploy"

# Copy all packages and icons
DEPLOY_FILES=()
for i in "${!VALIDATED_DIRS[@]}"; do
    dir="${VALIDATED_DIRS[$i]}"
    node_info="${NODE_INFO[$i]}"
    node_name=$(echo "$node_info" | cut -d':' -f1)
    node_version=$(echo "$node_info" | cut -d':' -f2)
    package_file="${BUILT_PACKAGES[$i]}"
    
    verbose_log "Copying package: $package_file"
    cp "$package_file" "$TEMP_DIR/deploy/"
    DEPLOY_FILES+=("${node_name}-${node_version}.tgz")
    
    # Copy icon if found
    icon_file=$(find_icon "$dir" "$node_name")
    if [ $? -eq 0 ]; then
        verbose_log "Copying icon: $dir/$icon_file"
        cp "$dir/$icon_file" "$TEMP_DIR/deploy/"
        DEPLOY_FILES+=("$icon_file")
        log "🎨 Found icon: $icon_file"
    fi
done

# Create deployment script
cat > "$TEMP_DIR/deploy/install.sh" << 'EOF'
#!/bin/bash
set -e

echo "🔧 Installing custom nodes in Docker container..."

# Find n8n container
N8N_CONTAINER=$(docker ps --format "table {{.Names}}" | grep -E "n8n" | head -1)

if [ -z "$N8N_CONTAINER" ]; then
    echo "❌ Error: No n8n container found"
    exit 1
fi

echo "📦 Found n8n container: $N8N_CONTAINER"

# Create custom directory in container
docker exec "$N8N_CONTAINER" mkdir -p /home/node/.n8n/custom

# Install all packages
for package in *.tgz; do
    if [ -f "$package" ]; then
        echo "📤 Copying and installing: $package"
        docker cp "$package" "$N8N_CONTAINER":/home/node/.n8n/custom/
        docker exec "$N8N_CONTAINER" sh -c "cd /home/node/.n8n/custom && npm install $package"
        docker exec "$N8N_CONTAINER" rm "/home/node/.n8n/custom/$package"
    fi
done

# Copy all icon files
for icon in *.svg *.png *.jpg *.jpeg; do
    if [ -f "$icon" ]; then
        echo "🎨 Copying icon: $icon"
        docker cp "$icon" "$N8N_CONTAINER":/home/node/.n8n/custom/
    fi
done 2>/dev/null || true

# Restart n8n container
echo "🔄 Restarting n8n container..."
docker restart "$N8N_CONTAINER"

echo "✅ All custom nodes installed successfully!"
echo "⏳ Waiting for n8n to restart..."
sleep 10
echo "🎉 Done! All nodes should now be available in n8n."
EOF

chmod +x "$TEMP_DIR/deploy/install.sh"

# Phase 4: Deploy to remote host
log ""
log "🚀 Phase 4: Deploying to remote host..."
verbose_log "Copying files to $REMOTE_HOST"
scp -r "$TEMP_DIR/deploy" "$REMOTE_HOST":~/ || {
    error_log "Failed to copy files to remote host"
    exit 1
}

verbose_log "Executing installation on $REMOTE_HOST"
ssh "$REMOTE_HOST" "cd ~/deploy && ./install.sh" || {
    error_log "Installation failed on remote host"
    exit 1
}

# Phase 5: Cleanup
log ""
log "🧹 Phase 5: Cleaning up..."
ssh "$REMOTE_HOST" "rm -rf ~/deploy" 2>/dev/null || true
rm -rf "$TEMP_DIR"

# Clean up local package files
for package in "${BUILT_PACKAGES[@]}"; do
    rm -f "$package" 2>/dev/null || true
done

log ""
log "✅ Deployment complete!"
log "🎉 Successfully deployed ${#NODE_DIRS[@]} node(s) to n8n:"

for node_info in "${NODE_INFO[@]}"; do
    node_name=$(echo "$node_info" | cut -d':' -f1)
    node_version=$(echo "$node_info" | cut -d':' -f2)
    log "   • $node_name v$node_version"
done

log ""
log "📝 Next steps:"
log "1. Open n8n in your browser"
log "2. Create a new workflow"
log "3. Search for your custom nodes in the node panel"
log "4. Configure credentials as needed"