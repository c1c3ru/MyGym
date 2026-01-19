#!/bin/bash

# Scroll Blocking Diagnostic Script
# This script searches for common patterns that block ScrollView functionality

echo "🔍 Scanning for scroll-blocking patterns in your codebase..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Define colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counter for issues found
ISSUES_FOUND=0

echo "${YELLOW}1. Checking for height: '100%' patterns...${NC}"
HEIGHT_RESULTS=$(grep -rn "height: '100%'" src/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" 2>/dev/null || true)
if [ -n "$HEIGHT_RESULTS" ]; then
    echo "${RED}❌ Found height: '100%' (SCROLL KILLER):${NC}"
    echo "$HEIGHT_RESULTS"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "${GREEN}✅ No height: '100%' found${NC}"
fi
echo ""

echo "${YELLOW}2. Checking for overflow: 'hidden' patterns...${NC}"
OVERFLOW_RESULTS=$(grep -rn "overflow: 'hidden'" src/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" 2>/dev/null || true)
if [ -n "$OVERFLOW_RESULTS" ]; then
    echo "${RED}❌ Found overflow: 'hidden' (SCROLL KILLER):${NC}"
    echo "$OVERFLOW_RESULTS"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "${GREEN}✅ No overflow: 'hidden' found${NC}"
fi
echo ""

echo "${YELLOW}3. Checking for position: 'absolute' in containers...${NC}"
POSITION_RESULTS=$(grep -rn "position: 'absolute'" src/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" 2>/dev/null || true)
if [ -n "$POSITION_RESULTS" ]; then
    echo "${YELLOW}⚠️  Found position: 'absolute' (may cause issues):${NC}"
    echo "$POSITION_RESULTS" | head -20
    echo ""
    echo "${BLUE}Note: position: 'absolute' can block scroll if used on parent containers${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "${GREEN}✅ No position: 'absolute' found${NC}"
fi
echo ""

echo "${YELLOW}4. Checking LinearGradient usage...${NC}"
GRADIENT_RESULTS=$(grep -rn "LinearGradient" src/ --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" 2>/dev/null || true)
if [ -n "$GRADIENT_RESULTS" ]; then
    echo "${YELLOW}⚠️  Found LinearGradient usage:${NC}"
    echo "$GRADIENT_RESULTS" | head -10
    echo ""
    echo "${BLUE}Note: LinearGradient should use flexGrow: 1, not flex: 1${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "${GREEN}✅ No LinearGradient found${NC}"
fi
echo ""

echo "${YELLOW}5. Checking Navigator screenOptions...${NC}"
SCREEN_OPTIONS=$(grep -rn "screenOptions" src/presentation/navigation/ --include="*.tsx" --include="*.ts" 2>/dev/null || true)
if [ -n "$SCREEN_OPTIONS" ]; then
    echo "${BLUE}ℹ️  Found screenOptions (check for contentStyle):${NC}"
    echo "$SCREEN_OPTIONS"
    echo ""
    echo "${BLUE}Manually verify these don't have overflow: 'hidden' or height: '100%'${NC}"
else
    echo "${GREEN}✅ No screenOptions found${NC}"
fi
echo ""

echo "${YELLOW}6. Checking for contentStyle in navigators...${NC}"
CONTENT_STYLE=$(grep -rn "contentStyle" src/presentation/navigation/ --include="*.tsx" --include="*.ts" 2>/dev/null || true)
if [ -n "$CONTENT_STYLE" ]; then
    echo "${RED}❌ Found contentStyle (potential SCROLL KILLER):${NC}"
    echo "$CONTENT_STYLE"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo "${GREEN}✅ No contentStyle found in navigators${NC}"
fi
echo ""

echo "${YELLOW}7. Checking SafeAreaProvider styles...${NC}"
SAFE_AREA=$(grep -rn "SafeAreaProvider" App.tsx src/ --include="*.tsx" --include="*.ts" 2>/dev/null || true)
if [ -n "$SAFE_AREA" ]; then
    echo "${BLUE}ℹ️  Found SafeAreaProvider:${NC}"
    echo "$SAFE_AREA"
    echo ""
    echo "${BLUE}Verify it uses style={{ flex: 1 }} and nothing else${NC}"
fi
echo ""

echo "${YELLOW}8. Checking web-specific styles in App.tsx...${NC}"
WEB_STYLES=$(grep -A 10 "Platform.OS === \"web\"" App.tsx 2>/dev/null || true)
if [ -n "$WEB_STYLES" ]; then
    echo "${BLUE}ℹ️  Found web-specific styles:${NC}"
    echo "$WEB_STYLES"
    echo ""
    echo "${BLUE}Check if these styles are blocking scroll${NC}"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ISSUES_FOUND -gt 0 ]; then
    echo "${RED}🚨 Found $ISSUES_FOUND potential scroll-blocking patterns!${NC}"
    echo ""
    echo "${YELLOW}Recommended Actions:${NC}"
    echo "1. Remove all height: '100%' from parent containers"
    echo "2. Remove all overflow: 'hidden' from containers with ScrollView"
    echo "3. Change LinearGradient to use flexGrow: 1 instead of flex: 1"
    echo "4. Remove contentStyle from Navigator screenOptions"
    echo "5. Ensure SafeAreaProvider only has style={{ flex: 1 }}"
else
    echo "${GREEN}✅ No obvious scroll-blocking patterns found!${NC}"
    echo ""
    echo "${YELLOW}If scroll still doesn't work, check:${NC}"
    echo "1. Nested View components with restrictive styles"
    echo "2. Third-party component wrappers (PaperProvider, etc.)"
    echo "3. Custom layout components"
    echo "4. Run the E2E tests in App.test.tsx"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${BLUE}Next Steps:${NC}"
echo "1. Fix any issues found above"
echo "2. Run: ${GREEN}bash scripts/test-scroll.sh${NC}"
echo "3. Or temporarily replace App.tsx with App.test.tsx"
echo "4. Test scroll functionality"
echo ""
