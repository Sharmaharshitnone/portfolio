#!/bin/bash
#
# scripts/download-fonts.sh
# 
# Downloads TTF fonts needed for OG image generation.
# Only needed for build machines (CI/CD, new developers).
#
# Usage: bash scripts/download-fonts.sh
#

set -euo pipefail

FONTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/public/fonts"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📥 Downloading fonts for OG image generation...${NC}"
mkdir -p "$FONTS_DIR"

download_font() {
    local filename="$1"
    local filepath="$FONTS_DIR/$filename"
    
    if [[ -f "$filepath" ]]; then
        echo "✓ $filename already exists ($(du -h "$filepath" | cut -f1))"
        return
    fi
    
    echo "  Downloading $filename..."
    
    # Try multiple sources for Inter fonts
    case "$filename" in
    "inter-regular.ttf")
        # Use Google Fonts CSS to extract TTF URL
        local css_url="https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap"
        local ttf_url
        ttf_url=$(curl -s -H "User-Agent: Mozilla/5.0 (Linux) AppleWebKit/537.36" "$css_url" | grep -o 'https://fonts\.gstatic\.com[^)]*\.ttf' | head -n1)
        
        if [[ -n "$ttf_url" ]]; then
            curl -fsSL -o "$filepath" "$ttf_url"
        else
            echo "❌ Could not find download URL for $filename"
            return 1
        fi
        ;;
    "inter-bold.ttf")
        local css_url="https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap"
        local ttf_url
        ttf_url=$(curl -s -H "User-Agent: Mozilla/5.0 (Linux) AppleWebKit/537.36" "$css_url" | grep -o 'https://fonts\.gstatic\.com[^)]*\.ttf' | head -n1)
        
        if [[ -n "$ttf_url" ]]; then
            curl -fsSL -o "$filepath" "$ttf_url"
        else
            echo "❌ Could not find download URL for $filename"
            return 1
        fi
        ;;
    *)
        echo "❌ Unknown font: $filename"
        return 1
        ;;
    esac
    
    echo -e "${GREEN}✓ Downloaded $filename ($(du -h "$filepath" | cut -f1))${NC}"
}

download_font "inter-regular.ttf"
download_font "inter-bold.ttf"

echo ""
echo -e "${GREEN}🎉 Font download complete!${NC}"
echo ""
echo "These TTF fonts are used by Satori for OG image generation during build."
echo "The smaller WOFF2 fonts (already in git) are served to web browsers."
echo ""
echo "Files:"
ls -lah "$FONTS_DIR"/*.ttf 2>/dev/null || echo "No TTF fonts found"

# Verify the fonts work with a quick Node.js check
echo ""
echo "Testing font loading..."
cat << 'EOF' > /tmp/test-fonts.js
const fs = require('fs');
const path = require('path');
const fontsDir = process.argv[2];
try {
  const regularPath = path.join(fontsDir, 'inter-regular.ttf');
  const boldPath = path.join(fontsDir, 'inter-bold.ttf');
  
  const regular = fs.readFileSync(regularPath);
  const bold = fs.readFileSync(boldPath);
  
  if (regular.length > 100000 && bold.length > 100000) {
    console.log('✓ Fonts loaded successfully for Satori');
  } else {
    console.log('⚠ Font files seem too small');
  }
} catch (e) {
  console.log('❌ Font loading test failed:', e.message);
}
EOF

node /tmp/test-fonts.js "$FONTS_DIR" 2>/dev/null || echo "Node.js font test skipped"
rm -f /tmp/test-fonts.js