# GitHub Setup Guide

## Step-by-Step Instructions to Push to GitHub

### Prerequisites
- Git installed on your system
- GitHub account created
- Git configured with your credentials

### Step 1: Initialize Git Repository

Open PowerShell in the project root directory and run:

```powershell
cd C:\Users\rrajay\CascadeProjects\time-tracking-app
git init
```

### Step 2: Configure Git (if not already done)

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Add All Files

```powershell
git add .
```

### Step 4: Create Initial Commit

```powershell
git commit -m "Initial commit: Full-stack time tracking application

- Backend: Node.js + Express + MongoDB
- Frontend: Vue.js 3 + Tailwind CSS
- Features: Authentication, RBAC, Analytics, Timesheet Management
- Complete documentation and tests included"
```

### Step 5: Create GitHub Repository

1. Go to https://github.com
2. Click the "+" icon in the top right
3. Select "New repository"
4. Enter repository details:
   - **Name:** `time-tracking-app` (or your preferred name)
   - **Description:** "Full-stack time tracking web application with Vue.js, Node.js, Express, and MongoDB"
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### Step 6: Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```powershell
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/time-tracking-app.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Alternative: Using SSH

If you prefer SSH:

```powershell
# Add remote with SSH
git remote add origin git@github.com:YOUR_USERNAME/time-tracking-app.git

# Push
git push -u origin main
```

## Quick Command Reference

### All Steps Combined

```powershell
# Navigate to project
cd C:\Users\rrajay\CascadeProjects\time-tracking-app

# Initialize Git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Full-stack time tracking application"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/time-tracking-app.git

# Push
git branch -M main
git push -u origin main
```

## Verify Upload

After pushing, visit your GitHub repository URL:
```
https://github.com/YOUR_USERNAME/time-tracking-app
```

You should see all your files and folders!

## Common Issues and Solutions

### Issue: "fatal: remote origin already exists"
**Solution:**
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/time-tracking-app.git
```

### Issue: Authentication failed
**Solution:**
1. Use a Personal Access Token instead of password
2. Go to GitHub Settings → Developer settings → Personal access tokens
3. Generate new token with 'repo' scope
4. Use token as password when prompted

### Issue: Large files warning
**Solution:**
- Ensure `node_modules/` is in `.gitignore` (already done)
- If you accidentally added large files:
  ```powershell
  git rm -r --cached node_modules
  git commit -m "Remove node_modules"
  ```

## Repository Settings (Optional)

After pushing, you can configure:

1. **Branch Protection:**
   - Settings → Branches → Add rule
   - Protect `main` branch

2. **GitHub Actions:**
   - Automate testing and deployment
   - CI/CD pipelines

3. **Repository Topics:**
   - Add tags: `vue`, `nodejs`, `express`, `mongodb`, `time-tracking`, `tailwindcss`

4. **About Section:**
   - Add description
   - Add website URL (if deployed)
   - Add topics

## Recommended Repository Description

```
Full-stack time tracking web application with modern UI and comprehensive features.

🚀 Features:
• JWT Authentication & Authorization
• Admin & Employee Dashboards
• Project & Cost Center Management
• Timesheet Submission & Approval
• Analytics & Reporting
• Responsive Design

🛠️ Tech Stack:
• Frontend: Vue.js 3, Tailwind CSS, Pinia
• Backend: Node.js, Express, MongoDB
• Security: JWT, Bcrypt, Rate Limiting
```

## Next Steps After Pushing

1. **Add Repository Badge:**
   ```markdown
   ![GitHub](https://img.shields.io/github/license/YOUR_USERNAME/time-tracking-app)
   ![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/time-tracking-app)
   ```

2. **Enable GitHub Pages** (for documentation)

3. **Set up GitHub Actions** (for CI/CD)

4. **Add Contributing Guidelines**

5. **Create Issues/Project Board** (for tracking)

## Cloning the Repository

Others can clone your repository:

```powershell
git clone https://github.com/YOUR_USERNAME/time-tracking-app.git
cd time-tracking-app
```

## Updating Repository

For future changes:

```powershell
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Description of changes"

# Push
git push
```

---

**Congratulations!** 🎉 Your project is now on GitHub!
