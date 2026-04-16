#!/bin/bash

# Integration Setup Script
# Automates backend and API integration setup

set -e  # Exit on error

echo "🚀 NRI Finance Manager - Integration Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "\n${BLUE}═══ $1 ═══${NC}\n"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup flow
main() {
    print_step "Checking Prerequisites"
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installed: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install from https://nodejs.org"
        exit 1
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm installed: $NPM_VERSION"
    else
        print_error "npm not found"
        exit 1
    fi
    
    print_step "Project Selection"
    
    echo "Which project do you want to set up?"
    echo "1) nri-saas (Next.js backend)"
    echo "2) nri-wallet (React/Vite frontend)"
    echo "3) Both"
    read -p "Enter choice (1-3): " PROJECT_CHOICE
    
    case $PROJECT_CHOICE in
        1)
            setup_nri_saas
            ;;
        2)
            setup_nri_wallet
            ;;
        3)
            setup_nri_saas
            setup_nri_wallet
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    print_step "Setup Complete!"
    echo ""
    print_success "Integration setup completed successfully!"
    echo ""
    print_info "Next steps:"
    echo "  1. Review .env files and add your API keys"
    echo "  2. Follow the Integration Guide: docs/INTEGRATION_GUIDE.md"
    echo "  3. Use the checklist: docs/INTEGRATION_CHECKLIST.md"
    echo ""
    print_info "Need help? Check docs/TROUBLESHOOTING.md"
    echo ""
}

setup_nri_saas() {
    print_step "Setting up nri-saas (Next.js Backend)"
    
    if [ ! -d "nri-saas" ]; then
        print_error "nri-saas directory not found"
        return 1
    fi
    
    cd nri-saas
    
    # Install dependencies
    print_info "Installing dependencies..."
    if npm install; then
        print_success "Dependencies installed"
    else
        print_error "Failed to install dependencies"
        cd ..
        return 1
    fi
    
    # Create .env.local if doesn't exist
    if [ ! -f ".env.local" ]; then
        print_info "Creating .env.local from template..."
        cp .env.example .env.local
        print_success "Created .env.local"
        print_warning "⚠️  IMPORTANT: Edit nri-saas/.env.local and add your Supabase credentials"
    else
        print_warning ".env.local already exists (skipping)"
    fi
    
    # Check if Supabase CLI is installed
    if command_exists supabase; then
        print_success "Supabase CLI installed"
        print_info "You can run 'supabase login' and 'supabase link' to connect"
    else
        print_warning "Supabase CLI not installed"
        print_info "Install with: npm install -g supabase"
    fi
    
    cd ..
    print_success "nri-saas setup complete"
}

setup_nri_wallet() {
    print_step "Setting up nri-wallet (React/Vite Frontend)"
    
    if [ ! -d "nri-wallet" ]; then
        print_error "nri-wallet directory not found"
        return 1
    fi
    
    cd nri-wallet
    
    # Install dependencies
    print_info "Installing dependencies..."
    if npm install; then
        print_success "Dependencies installed"
    else
        print_error "Failed to install dependencies"
        cd ..
        return 1
    fi
    
    # Install Supabase client
    print_info "Installing Supabase client..."
    if npm install @supabase/supabase-js; then
        print_success "Supabase client installed"
    else
        print_warning "Failed to install Supabase client"
    fi
    
    # Create .env if doesn't exist
    if [ ! -f ".env" ]; then
        print_info "Creating .env file..."
        cat > .env << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Currency API (optional - free tier)
# VITE_CURRENCY_API_KEY=your_api_key
EOF
        print_success "Created .env file"
        print_warning "⚠️  IMPORTANT: Edit nri-wallet/.env and add your Supabase credentials"
    else
        print_warning ".env already exists (skipping)"
    fi
    
    # Create Supabase client file
    print_info "Creating Supabase client setup..."
    mkdir -p src/lib
    
    if [ ! -f "src/lib/supabase.js" ]; then
        cat > src/lib/supabase.js << 'EOF'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper: Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'your_supabase_project_url')
}

// Helper: Get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
EOF
        print_success "Created src/lib/supabase.js"
    else
        print_warning "src/lib/supabase.js already exists (skipping)"
    fi
    
    # Create sync service
    print_info "Creating sync service..."
    mkdir -p src/services
    
    if [ ! -f "src/services/syncService.js" ]; then
        cat > src/services/syncService.js << 'EOF'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { db } from '../db'

class SyncService {
  constructor() {
    this.isSyncing = false
    this.lastSync = localStorage.getItem('lastSync') || null
  }

  // Sync expenses to Supabase
  async syncExpenses() {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, using local storage only')
      return
    }

    try {
      this.isSyncing = true
      const expenses = await db.expenses.toArray()

      for (const expense of expenses) {
        const { id, ...data } = expense
        
        const { error } = await supabase
          .from('transactions')
          .upsert({
            id,
            type: 'expense',
            ...data,
            user_id: (await supabase.auth.getUser()).data.user?.id
          })

        if (error) throw error
      }

      localStorage.setItem('lastSync', new Date().toISOString())
      console.log('✅ Expenses synced to Supabase')
    } catch (error) {
      console.error('❌ Sync failed:', error)
    } finally {
      this.isSyncing = false
    }
  }

  // Pull data from Supabase
  async pullFromSupabase() {
    if (!isSupabaseConfigured()) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'expense')

      if (error) throw error

      for (const transaction of data) {
        await db.expenses.put(transaction)
      }

      console.log('✅ Pulled data from Supabase')
    } catch (error) {
      console.error('❌ Pull failed:', error)
    }
  }

  // Auto-sync every 5 minutes
  startAutoSync() {
    setInterval(() => {
      this.syncExpenses()
    }, 5 * 60 * 1000)
  }
}

export const syncService = new SyncService()
EOF
        print_success "Created src/services/syncService.js"
    else
        print_warning "src/services/syncService.js already exists (skipping)"
    fi
    
    # Check for iOS setup
    if [ -d "ios" ]; then
        print_success "iOS platform detected"
        
        if command_exists pod; then
            print_info "CocoaPods installed - iOS ready"
        else
            print_warning "CocoaPods not found - needed for iOS"
            print_info "Install with: sudo gem install cocoapods"
        fi
        
        if command_exists xcodebuild; then
            print_success "Xcode command line tools installed"
        else
            print_warning "Xcode not found - needed for iOS development"
        fi
    else
        print_info "iOS platform not set up (optional)"
        print_info "To add iOS: npx cap add ios"
    fi
    
    cd ..
    print_success "nri-wallet setup complete"
}

# Run interactive setup
interactive_setup() {
    clear
    echo "╔═══════════════════════════════════════════════════╗"
    echo "║   NRI Finance Manager - Integration Setup        ║"
    echo "╚═══════════════════════════════════════════════════╝"
    echo ""
    
    print_info "This script will help you set up:"
    echo "  • Backend integration (Supabase)"
    echo "  • Currency API configuration"
    echo "  • Mobile testing environment"
    echo ""
    
    read -p "Continue? (y/n): " CONTINUE
    
    if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
        echo "Setup cancelled"
        exit 0
    fi
    
    main
}

# Check if script is run with --help
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Integration Setup Script"
    echo ""
    echo "Usage: ./setup-integration.sh"
    echo ""
    echo "This script will:"
    echo "  1. Check prerequisites (Node.js, npm)"
    echo "  2. Install project dependencies"
    echo "  3. Create environment files"
    echo "  4. Set up Supabase integration"
    echo "  5. Configure sync services"
    echo ""
    echo "Options:"
    echo "  --help, -h    Show this help message"
    echo ""
    echo "Documentation:"
    echo "  Integration Guide:  docs/INTEGRATION_GUIDE.md"
    echo "  Checklist:          docs/INTEGRATION_CHECKLIST.md"
    echo "  Troubleshooting:    docs/TROUBLESHOOTING.md"
    exit 0
fi

# Run interactive setup
interactive_setup
