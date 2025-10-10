# Time Tracking App Setup Script for Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Time Tracking App - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed. Please install Node.js v18 or higher." -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running
Write-Host ""
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
Write-Host "Make sure MongoDB is running on localhost:27017" -ForegroundColor Yellow
Write-Host ""

# Install Backend Dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location -Path "backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "Backend dependencies installed successfully!" -ForegroundColor Green

# Install Frontend Dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location -Path "..\frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "Frontend dependencies installed successfully!" -ForegroundColor Green

# Return to root directory
Set-Location -Path ".."

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Make sure MongoDB is running" -ForegroundColor White
Write-Host "2. Seed the database: cd backend && npm run seed" -ForegroundColor White
Write-Host "3. Start the backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "4. Start the frontend (in a new terminal): cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Default admin credentials:" -ForegroundColor Yellow
Write-Host "Email: admin@timetrack.com" -ForegroundColor White
Write-Host "Password: Admin@123" -ForegroundColor White
Write-Host ""
