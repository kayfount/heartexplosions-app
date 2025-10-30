#!/bin/bash
# Security verification script - Run before git push
# Usage: ./verify-security.sh

echo "🔒 Firebase Studio - Security Verification"
echo "=========================================="
echo ""

ERRORS=0

# Check 1: .env is in .gitignore
echo "[1/6] Checking .gitignore configuration..."
if grep -q "^\.env$" .gitignore; then
    echo "   ✅ .env is in .gitignore"
else
    echo "   ❌ ERROR: .env is NOT in .gitignore!"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: .env is not staged
echo "[2/6] Checking if .env is staged for commit..."
if git ls-files --error-unmatch .env &>/dev/null; then
    echo "   ❌ ERROR: .env is tracked by git!"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✅ .env is not tracked by git"
fi

# Check 3: .env is ignored
echo "[3/6] Verifying .env is ignored..."
if git check-ignore .env &>/dev/null; then
    echo "   ✅ .env is ignored by git"
else
    echo "   ⚠️  WARNING: .env might not be properly ignored"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: No private keys in source code
echo "[4/6] Scanning source files for private keys..."
PRIVATE_KEY_FILES=$(grep -r "BEGIN PRIVATE KEY" src/ --exclude-dir=node_modules 2>/dev/null)
if [ -z "$PRIVATE_KEY_FILES" ]; then
    echo "   ✅ No private keys found in source code"
else
    echo "   ❌ ERROR: Private keys found in source files!"
    echo "$PRIVATE_KEY_FILES"
    ERRORS=$((ERRORS + 1))
fi

# Check 5: No service account JSON files in workspace
echo "[5/6] Checking for service account JSON files..."
JSON_FILES=$(find . -name "*firebase-adminsdk*.json" 2>/dev/null | grep -v node_modules)
if [ -z "$JSON_FILES" ]; then
    echo "   ✅ No service account JSON files in workspace"
else
    echo "   ⚠️  WARNING: Found service account JSON files:"
    echo "$JSON_FILES"
    echo "   Consider deleting these files for security"
fi

# Check 6: FIREBASE_SERVICE_ACCOUNT_KEY not in staged changes
echo "[6/6] Checking staged changes for secrets..."
STAGED_SECRETS=$(git diff --cached | grep -i "FIREBASE_SERVICE_ACCOUNT_KEY.*BEGIN PRIVATE KEY" 2>/dev/null)
if [ -z "$STAGED_SECRETS" ]; then
    echo "   ✅ No secrets in staged changes"
else
    echo "   ❌ ERROR: Secrets found in staged changes!"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ All security checks passed!"
    echo "   It's safe to push your code."
    exit 0
else
    echo "❌ Security check failed with $ERRORS error(s)"
    echo "   DO NOT push until errors are resolved!"
    exit 1
fi
