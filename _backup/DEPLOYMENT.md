
# Proventure Portal Deployment Guide

## Frontend (Vercel)
The frontend is automatically deployed to Vercel whenever you push to the `main` branch.
- **Domain**: `client.proventure.in`
- **Repo**: `https://github.com/sayrahul/proventure-portal`

### Domain Configuration (DNS)
Based on your screenshots, your `client` subdomain is currently pointing to an old IP (`216.198.79.1`). You need to update this to point to Vercel.

**Steps to Configure DNS:**
1.  Log in to your DNS provider (where you took the screenshot).
2.  Find the **A Record** for `client`.
3.  **Edit** this record:
    - **Type**: `A`
    - **Name**: `client`
    - **Value**: `76.76.21.21` (Vercel's IP)
    - **TTL**: Auto or 3600
4.  Alternatively, you can use a **CNAME Record**:
    - **Type**: `CNAME`
    - **Name**: `client`
    - **Value**: `cname.vercel-dns.com`
5.  Save the changes.
6.  Wait for propagation (can take a few minutes to hours).

## Backend (Google Apps Script)
The backend logic resides in `Code.js`. Since we are not using `clasp` for automated deployments, you must manually update the script in the Google Apps Script editor.

### Steps to Update Backend:
1.  Open your Google Apps Script project: [https://script.google.com/](https://script.google.com/)
2.  Open the project associated with your web app.
3.  Copy the entire content of `Code.js` from this repository.
4.  Paste it into the `Code.gs` file in the Apps Script editor, replacing existing content.
5.  **Save** the project (Ctrl+S).
6.  **Deploy** the project:
    - Click **Deploy** > **Manage Deployments**.
    - Click the **pencil icon** next to your active deployment (e.g., "Web App").
    - Under **Version**, select **New version**.
    - Click **Deploy**.
    - Copy the **Web App URL**.
7.  Verify the `API_URL` variable in `index.html` matches the copied URL.

### Important Notes:
- Ensure the `API_URL` variable in `index.html` points to your deployed Web App URL.
- If you change the Web App URL, updates to `index.html` must be pushed to Git to reflect on Vercel.
