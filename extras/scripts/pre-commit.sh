#!/bin/bash

# Lint staged JavaScript and TypeScript files and fix issues
echo "Fixing linting issues..."
staged_files=$(git diff --cached --name-only --diff-filter=ACMRTUXB | grep -E '\.(js|ts)$')
if [[ -n $staged_files ]]; then
  echo "$staged_files" | xargs npx eslint --ext .js,.ts --fix >/dev/null 2>&1
fi

# Check if any linting issues were fixed
lint_exit_code=$?

if [ $lint_exit_code -ne 0 ]; then
  echo "Failed to fix linting issues. Please manually fix the issues before committing."
  exit 1
fi

echo "Linting issues fixed. Proceeding with the commit."
