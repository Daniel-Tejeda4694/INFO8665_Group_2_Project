# Parla UI

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Install dependencies

After cloning or downloading the project, navigate to the project directory and install dependencies:

```bash
npm install
```

### 2. Run the development server
Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open your browser and go to [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Start editing

You can begin editing the application by modifying `src/app/page.tsx`. Changes will automatically reflect in the browser.

## Project Structure

```plaintext
parla_ui/
├── src/
│   ├── app/               # App Router pages
│   ├── components/        # Reusable UI components
│   ├── styles/            # Global and Tailwind CSS styles
│   ├── utils/             # Utility functions (e.g., formatters, validators, helpers)
│   └── ...
├── public/                # Static assets (images, icons)
├── .eslintrc.json         # ESLint configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── next.config.js         # Next.js configuration
```

## Available Scripts

You can run the following scripts using `npm`:

| Command           | Description                                  |
|-------------------|----------------------------------------------|
| `npm run dev`     | Start the development server                 |
| `npm run build`   | Build the app for production                 |
| `npm run start`   | Start the production server (after build)    |
| `npm run lint`    | Run ESLint to check code style and errors    |

## Learn More

To learn more about Next.js, visit the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - Official documentation for features and APIs
- [Learn Next.js](https://nextjs.org/learn) - Interactive learning course for beginners

You can also explore the [Next.js GitHub repository](https://github.com/vercel/next.js) for updates and contributions.

## Deployment

The recommended way to deploy a Next.js application is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

For more deployment options, refer to the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).