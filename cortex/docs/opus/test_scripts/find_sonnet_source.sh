#!/bin/bash
# Find where claude-sonnet-4-5@20250929 came from

echo "=== FINDING SOURCE OF SONNET MODEL ==="
echo ""

echo "1. Global config:"
grep "modelId" ~/.rovodev/config.yml | head -3

echo ""
echo "2. Running config (modified timestamp):"
stat -c "Modified: %y" /tmp/cortex_config_23307_1771410778.yml

echo ""
echo "3. Was it created with sonnet, or changed after?"
echo "   Created: Feb 18 12:32:58"
echo "   Modified: $(stat -c "%y" /tmp/cortex_config_23307_1771410778.yml)"

echo ""
echo "4. Check if ~/.rovodev/config.yml was different when session started:"
echo "   Checking backups..."
ls -lt ~/.rovodev/config.yml* | head -10

echo ""
echo "5. What's in the most recent backup?"
if [[ -f ~/.rovodev/config.yml.backup6 ]]; then
  echo "Backup6:"
  grep "modelId" ~/.rovodev/config.yml.backup6 | head -3
fi

echo ""
echo "6. My theory: Someone manually edited the temp config file!"
echo "   Let me check git history of when sonnet@date format was introduced..."

git log --all --oneline --grep="sonnet.*date\|@20250929" | head -10
