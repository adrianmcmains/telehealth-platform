#!/bin/bash

# Set the project root directory (adjust if needed)
PROJECT_ROOT="$(pwd)"

# Change to the project root directory (to ensure we're working from the right place)
cd "$PROJECT_ROOT"

# Exclude specific files and directories like node_modules, .git, .env, etc.
# Modify this list as needed
EXCLUDED_PATHS=(
  "./.git/*"
  "./node_modules/*"
  "./.gitignore"
  "./.env"
)

# Generate a list of files to watch, excluding the paths above
FILES_TO_WATCH=$(find . -type f | grep -vE "$(IFS=\|; echo "${EXCLUDED_PATHS[*]}")")

# Run the following if there are changes
if [ -n "$FILES_TO_WATCH" ]; then
  # Stage all changes
  git add .

  # Commit changes with a timestamp message
  git commit -m "Auto commit: $(date '+%Y-%m-%d %H:%M:%S')"

  # Push changes to the main branch
  git push origin main
else
  echo "No changes to commit"
fi
