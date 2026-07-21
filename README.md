This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

Deployment runs through GitHub Actions and Coolify:

1. Enable the Coolify API: **Settings → Advanced → API Settings → API Access**.
2. Create an API token in Coolify: **Security → API Tokens**, give it a name, and select the `deploy` permission. Copy the full token (`ID|SECRET`) immediately.
3. Add two GitHub Actions secrets in the repository settings (**Settings → Secrets and variables → Actions**):
   - `COOLIFY_WEBHOOK` — copy the webhook URL from the Coolify app's **Settings → Webhooks** section.
   - `COOLIFY_API_TOKEN` — the full API token copied above.
4. Keep the Coolify app source as **Docker Compose** and make sure it loads `docker/docker-compose.prod.yml`. The compose file now pulls the pre-built image `ghcr.io/muslimmujahid/buku-hadir:latest` instead of building from the Dockerfile.
5. Push to `main`. The workflow builds the existing Dockerfile, pushes the image to GitHub Container Registry (tagged `latest` and with the short commit SHA), then sends an authenticated `POST` request to `COOLIFY_WEBHOOK` to redeploy the image. Coolify will pull the new image and recreate the container.

### Pulling the image from Coolify

If the GitHub Container Registry package is private, Coolify needs a personal access token (PAT) with `read:packages` access added as a registry credential in Coolify. Alternatively, make the GHCR package public in the GitHub package settings (**Packages → buku-hadir → Package settings → Visibility**).

Keep the application's runtime environment variables configured in Coolify; they are not replaced by the container image workflow.
