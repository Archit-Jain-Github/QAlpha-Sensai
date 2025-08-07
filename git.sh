#!/bin/bash

# Get branch name
read -p "Branch name: " branch

# Switch to branch (create if doesn't exist)
echo "Switching to branch '$branch'..."
git checkout -B $branch

# Check if branch exists on remote, if not create it
if ! git ls-remote --heads origin $branch | grep -q $branch; then
    echo "Branch '$branch' doesn't exist on remote. Creating it..."
    git push -u origin $branch
fi

# Get commit message
read -p "Commit message: " message

# Git workflow
echo "Pulling latest changes..."
git pull origin $branch

echo "Adding files..."
git add .

echo "Committing changes..."
git commit -m "$message"

echo "Pushing to GitHub..."
git push origin $branch

echo "Done! Changes pushed to branch '$branch'"
echo ""

# Ask user what to do next
echo "What would you like to do next?"
echo "1) Switch to another branch"
echo "2) Merge this branch to main"
echo "3) Exit"
read -p "Enter your choice (1/2/3): " choice

case $choice in
    1)
        read -p "Enter branch name to switch to: " target_branch
        echo "Switching to branch '$target_branch'..."
        git checkout $target_branch
        echo "Switched to '$target_branch'"
        ;;
    2)
        echo "Switching to main branch..."
        git checkout main
        echo "Pulling latest main..."
        git pull origin main
        echo "Merging '$branch' into main..."
        git merge $branch
        echo "Pushing merged changes to main..."
        git push origin main
        echo "Successfully merged '$branch' into main!"
        ;;
    3)
        echo "Goodbye!"
        ;;
    *)
        echo "Invalid choice. Exiting..."
        ;;
esac