# punk-frontend-2026

Next.js static frontend for Punk, deployable to **Google App Engine Standard** via Cloud Build.

## Prerequisites

- [Google Cloud SDK (`gcloud`)](https://cloud.google.com/sdk/docs/install) installed and authenticated
- A Google Cloud billing account
- Node.js 22+ (for local builds only)

## Google Cloud Console setup

### 1. Create a project

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown → **New Project**.
3. Enter a project name (e.g. `punk-frontend`) and click **Create**.
4. Select the new project from the dropdown.

### 2. Enable billing

1. Go to **Billing** in the left menu.
2. Link a billing account to your project (required for App Engine and Cloud Build).

### 3. Enable required APIs

Go to **APIs & Services → Library** and enable:

- **App Engine Admin API**
- **Cloud Build API**
- **Cloud Resource Manager API**
- **Secret Manager API** (if using secrets for build-time env vars)

Or run from your terminal (replace `PROJECT_ID`):

```bash
gcloud config set project PROJECT_ID

gcloud services enable \
  appengine.googleapis.com \
  cloudbuild.googleapis.com \
  cloudresourcemanager.googleapis.com \
  secretmanager.googleapis.com
```

### 4. Create the App Engine application

App Engine is created once per project and **region cannot be changed later**.

```bash
gcloud app create --region=us-central
```

Choose a region close to your users. Common options: `us-central`, `us-east1`, `europe-west1`.

### 5. Grant Cloud Build permission to deploy

Cloud Build needs the App Engine Deployer role:

```bash
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/appengine.deployer"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/appengine.serviceAdmin"
```

### 6. Store the WalletConnect project ID

The build needs `NEXT_PUBLIC_WC_PROJECT_ID` at compile time.

**Option A — Cloud Build substitution (default)**

Pass the value when submitting a build or in your trigger's substitution variables:

```bash
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
```

**Option B — Secret Manager (recommended for CI triggers)**

```bash
echo -n "your_walletconnect_project_id" | \
  gcloud secrets create NEXT_PUBLIC_WC_PROJECT_ID \
    --data-file=- \
    --replication-policy=automatic

gcloud secrets add-iam-policy-binding NEXT_PUBLIC_WC_PROJECT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding NEXT_PUBLIC_WC_PROJECT_ID \
  --member="serviceAccount:${PROJECT_NAME}@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Then add this to `cloudbuild.yaml` under the build step:

```yaml
secretEnv:
  - NEXT_PUBLIC_WC_PROJECT_ID
```

And at the bottom of `cloudbuild.yaml`:

```yaml
availableSecrets:
  secretManager:
    - versionName: projects/$PROJECT_ID/secrets/NEXT_PUBLIC_WC_PROJECT_ID/versions/latest
      env: NEXT_PUBLIC_WC_PROJECT_ID
```

Get a project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/).

### 7. Create a Cloud Build trigger (optional, for CI/CD)

1. Push this repo to GitHub, GitLab, or Cloud Source Repositories.
2. In Cloud Console go to **Cloud Build → Triggers → Create trigger**.
3. Connect your repository.
4. Set **Configuration** to **Cloud Build configuration file** and path: `cloudbuild.yaml`.
5. Under **Substitution variables**, set `_NEXT_PUBLIC_WC_PROJECT_ID` to your WalletConnect project ID (or use Secret Manager — see step 6).
6. Save the trigger. Pushes to the configured branch will build and deploy automatically.

## Environment variables

| Variable | When | Description |
|----------|------|-------------|
| `NEXT_PUBLIC_WC_PROJECT_ID` | Build time | WalletConnect Cloud project ID |

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Manual deploy to App Engine

Build the static site, then deploy:

```bash
export NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id

npm ci
npm run build
gcloud app deploy app.yaml --quiet
```

View the live URL:

```bash
gcloud app browse
```

## Deploy via Cloud Build (one-off)

```bash
gcloud builds submit --config=cloudbuild.yaml
```

If not using Secret Manager, pass the substitution explicitly:

```bash
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
```

## How deployment works

1. `npm run build` produces a static export in `out/` (see `next.config.ts`).
2. `server.js` serves `out/` on port `8080` with the same path resolution as `nginx.conf` (`try_files` behavior).
3. `app.yaml` configures App Engine Standard with the Node.js 22 runtime.
4. `cloudbuild.yaml` installs dependencies, builds the app, and runs `gcloud app deploy`.

## Custom domain (optional)

1. In Cloud Console go to **App Engine → Settings → Custom domains**.
2. Click **Add a custom domain** and follow the wizard.
3. Add the provided DNS records at your domain registrar.

## Useful commands

```bash
# View deployed versions
gcloud app versions list

# View logs
gcloud app logs tail -s default

# Delete old versions (replace VERSION)
gcloud app versions delete VERSION
```

## Project files

| File | Purpose |
|------|---------|
| `app.yaml` | App Engine Standard runtime and scaling config |
| `cloudbuild.yaml` | Cloud Build pipeline (install → build → deploy) |
| `server.js` | Production static file server for the `out/` directory |
| `.gcloudignore` | Files excluded from `gcloud app deploy` uploads |
