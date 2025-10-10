# GitHub Push Script for Time Tracking App

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Repository Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
Write-Host "Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "Git version: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if already a git repository
if (Test-Path ".git") {
    Write-Host "Git repository already initialized." -ForegroundColor Yellow
    $reinit = Read-Host "Do you want to reinitialize? (y/n)"
    if ($reinit -eq "y") {
        Remove-Item -Recurse -Force .git
        git init
        Write-Host "Repository reinitialized." -ForegroundColor Green
    }
} else {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "Git repository initialized." -ForegroundColor Green
}

Write-Host ""

# Configure Git user (if not configured)
Write-Host "Checking Git configuration..." -ForegroundColor Yellow
$userName = git config --global user.name
$userEmail = git config --global user.email

if (-not $userName) {
    Write-Host "Git user name not configured." -ForegroundColor Yellow
    $userName = Read-Host "Enter your name"
    git config --global user.name "$userName"
    Write-Host "User name configured: $userName" -ForegroundColor Green
} else {
    Write-Host "User name: $userName" -ForegroundColor Green
}

if (-not $userEmail) {
    Write-Host "Git user email not configured." -ForegroundColor Yellow
    $userEmail = Read-Host "Enter your email"
    git config --global user.email "$userEmail"
    Write-Host "User email configured: $userEmail" -ForegroundColor Green
} else {
    Write-Host "User email: $userEmail" -ForegroundColor Green
}

Write-Host ""

# Add all files
Write-Host "Adding files to Git..." -ForegroundColor Yellow
git add .
Write-Host "Files added successfully." -ForegroundColor Green

Write-Host ""

# Create commit
Write-Host "Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Full-stack time tracking application

- Backend: Node.js + Express + MongoDB
- Frontend: Vue.js 3 + Tailwind CSS
- Features: Authentication, RBAC, Analytics, Timesheet Management
- Complete documentation and tests included"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Commit created successfully." -ForegroundColor Green
} else {
    Write-Host "Error creating commit." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Get GitHub username and repository name
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Repository Information" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please create a new repository on GitHub first:" -ForegroundColor Yellow
Write-Host "1. Go to https://github.com/new" -ForegroundColor White
Write-Host "2. Create a new repository (DO NOT initialize with README)" -ForegroundColor White
Write-Host "3. Come back here with the repository details" -ForegroundColor White
Write-Host ""

$githubUsername = Read-Host "Enter your GitHub username"
$repoName = Read-Host "Enter repository name (default: time-tracking-app)"

if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "time-tracking-app"
}

Write-Host ""

# Ask for connection method
Write-Host "Choose connection method:" -ForegroundColor Yellow
Write-Host "1. HTTPS (recommended for beginners)" -ForegroundColor White
Write-Host "2. SSH (requires SSH key setup)" -ForegroundColor White
$connectionMethod = Read-Host "Enter choice (1 or 2)"

Write-Host ""

# Set remote based on connection method
if ($connectionMethod -eq "2") {
    $remoteUrl = "git@github.com:$githubUsername/$repoName.git"
    Write-Host "Using SSH connection" -ForegroundColor Green
} else {
    $remoteUrl = "https://github.com/$githubUsername/$repoName.git"
    Write-Host "Using HTTPS connection" -ForegroundColor Green
}

# Check if remote already exists
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "Remote 'origin' already exists: $existingRemote" -ForegroundColor Yellow
    $updateRemote = Read-Host "Do you want to update it? (y/n)"
    if ($updateRemote -eq "y") {
        git remote remove origin
        git remote add origin $remoteUrl
        Write-Host "Remote updated." -ForegroundColor Green
    }
} else {
    Write-Host "Adding remote repository..." -ForegroundColor Yellow
    git remote add origin $remoteUrl
    Write-Host "Remote added: $remoteUrl" -ForegroundColor Green
}

Write-Host ""

# Rename branch to main
Write-Host "Setting default branch to 'main'..." -ForegroundColor Yellow
git branch -M main
Write-Host "Branch renamed to 'main'." -ForegroundColor Green

Write-Host ""

# Push to GitHub
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($connectionMethod -eq "1") {
    Write-Host "You may be prompted for GitHub credentials." -ForegroundColor Yellow
    Write-Host "Note: Use a Personal Access Token instead of password." -ForegroundColor Yellow
    Write-Host "Generate token at: https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host ""
}

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Success! Repository pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository URL:" -ForegroundColor Yellow
    Write-Host "https://github.com/$githubUsername/$repoName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Visit your repository on GitHub" -ForegroundColor White
    Write-Host "2. Add a description and topics" -ForegroundColor White
    Write-Host "3. Configure repository settings" -ForegroundColor White
    Write-Host "4. Share with others!" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Error pushing to GitHub" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Repository doesn't exist on GitHub - Create it first" -ForegroundColor White
    Write-Host "2. Authentication failed - Use Personal Access Token" -ForegroundColor White
    Write-Host "3. SSH key not configured - Use HTTPS instead" -ForegroundColor White
    Write-Host ""
    Write-Host "See GITHUB_SETUP.md for detailed troubleshooting" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
