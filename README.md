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

1. Add the required GitHub Actions secret `COOLIFY_WEBHOOK` in the repository settings (**Settings → Secrets and variables → Actions**). Copy the webhook URL from the Coolify app's **Settings → Webhooks** section.
2. In Coolify, change the app source from the Git repository/Dockerfile build to a pre-built Docker image and set the image to `ghcr.io/muslimmujahid/buku-hadir:latest`.
3. Push to `main`. The workflow builds the existing Dockerfile, pushes the image to GitHub Container Registry (tagged `latest` and with the short commit SHA), then sends a `POST` request to `COOLIFY_WEBHOOK` to redeploy the image.

### Pulling the image from Coolify

If the GitHub Container Registry package is private, Coolify needs a personal access token (PAT) with `read:packages` access added as a registry credential in Coolify. Alternatively, make the GHCR package public in the GitHub package settings (**Packages → buku-hadir → Package settings → Visibility**).

Keep the application's runtime environment variables configured in Coolify; they are not replaced by the container image workflow.
