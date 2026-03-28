# Airlock | Skyline Purifiers

A dynamic, web-based digital companion app and testing prototype for the high school educational board game, **Airlock**.

## Gameplay Overview

Players take the role of city planners and operators attempting to filter pollutants out of the sky before districts are engulfed. They place filters into their zones and direct the flow of wind, while fighting against tier-scaled climate events and random emissions. 

## Features

- **Responsive & Interactive Board:** View the hex-board interface with full CAD-style Pan & Zoom controls.
- **Dynamic Climate Events:** React to shifting weather conditions dynamically generated during gameplay.
- **Educational Filtering Logic:** Use electrostatic, HEPA, mesh, scrubber, and carbon filters to manage mathematically balanced emission loads.

## Local Development

**Prerequisites:** Node.js (v20+ recommended)

1. Clone or download the repository.
2. Open your terminal in the root folder of the project.
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Run the local development server:
   ```bash
   npm run dev
   ```
5. Open your browser to the local address provided.

## Deploying to GitHub Pages

This project includes a native GitHub Actions workflow (`.github/workflows/deploy.yml`) to automatically deploy the codebase to a live GitHub Pages website when you push it to your repository.

Here is the exact step-by-step process of how to commit and deploy this online:

### Step 1: Initialize Git and Commit Your Build
Open a terminal in the folder containing your code and run the following commands:
```bash
git init
git add .
git commit -m "Initial commit for Airlock"
```

### Step 2: Push to GitHub
Go to GitHub and create a **New Repository**. Do not initialize it with a README or `.gitignore`.
Once created, copy the URL of your repository, and run these commands (replacing `<url-to-your-repo>`):
```bash
git branch -M main
git remote add origin <url-to-your-repo>
git push -u origin main
```

### Step 3: Enable GitHub Actions & Pages
1. On your GitHub repository page, click the **Settings** tab.
2. In the left sidebar, click **Pages**.
3. Under the **Build and deployment** section, look for **Source**, and select **GitHub Actions**.

The action will now automatically build and publish your game! Any time you push an update to code on the `main` branch, the site will re-deploy the newest version.
