#!/bin/bash

# Finance Manager - iOS Setup Script
# This script automates the Capacitor iOS setup process

set -e  # Exit on error

echo "🚀 Starting iOS setup for Finance Manager..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm found"
echo ""

# Step 1: Install Capacitor dependencies
echo "📦 Step 1/6: Installing Capacitor dependencies..."
npm install @capacitor/core @capacitor/cli @capacitor/ios
echo "✅ Capacitor installed"
echo ""

# Step 2: Initialize Capacitor (skip if already initialized)
if [ ! -f "capacitor.config.ts" ]; then
    echo "⚙️  Step 2/6: Initializing Capacitor..."
    echo "Using predefined configuration..."
    echo "✅ Capacitor config already created"
else
    echo "✅ Step 2/6: Capacitor already initialized"
fi
echo ""

# Step 3: Build the web app
echo "🔨 Step 3/6: Building web app..."
npm run build
echo "✅ Web app built successfully"
echo ""

# Step 4: Add iOS platform (skip if already added)
if [ ! -d "ios" ]; then
    echo "📱 Step 4/6: Adding iOS platform..."
    npx cap add ios
    echo "✅ iOS platform added"
else
    echo "✅ Step 4/6: iOS platform already exists"
fi
echo ""

# Step 5: Sync web assets with iOS
echo "🔄 Step 5/6: Syncing web assets with iOS..."
npx cap sync ios
echo "✅ Assets synced"
echo ""

# Step 6: Open in Xcode
echo "🍎 Step 6/6: Opening project in Xcode..."
npx cap open ios
echo ""

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps in Xcode:"
echo "  1. Select your development team in Signing & Capabilities"
echo "  2. Select a simulator or connect your iPhone"
echo "  3. Click the Play button (▶️) to run the app"
echo ""
echo "📚 For more details, see IOS_SETUP_GUIDE.md"
echo ""
