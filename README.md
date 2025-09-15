# Restaurant Admin UI

A modern admin dashboard built with Next.js 15, TypeScript, and shadcn/ui components.

## Features

- ⚡ **Next.js 15** - Latest version with App Router
- 🎨 **shadcn/ui** - Beautiful and accessible UI components
- 📱 **Responsive Design** - Works on all devices
- 🔧 **TypeScript** - Type-safe development
- 🎨 **Tailwind CSS v4** - Latest version for styling
- 📦 **pnpm** - Fast package manager
- 🔄 **API Integration** - Ready for backend communication

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Package Manager:** pnpm
- **Backend API:** http://localhost:8080

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Update environment variables in `.env.local` if needed:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # App Router pages
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── layout/         # Layout components
├── lib/                # Utilities
│   ├── api.ts          # API client
│   └── utils.ts        # Helper functions
```

## API Integration

The project includes a built-in API client (`src/lib/api.ts`) for communicating with your backend:

```typescript
import { api } from '@/lib/api';

// GET request
const data = await api.get<YourType>('/endpoint');

// POST request
const result = await api.post('/endpoint', { data: 'value' });
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8080` |

## Available Components

The following shadcn/ui components are pre-installed:

- Button
- Card
- Input
- Label
- Form
- Table

Add more components with:
```bash
pnpm dlx shadcn@latest add [component-name]
```

## Backend Integration

This frontend is designed to work with a backend API running on port 8080. Make sure your backend server is running before starting the frontend development server.

## Development

1. Ensure your backend API is running on port 8080
2. Start the development server with `pnpm dev`
3. The app will be available at `http://localhost:3000`

## Deployment

1. Build the application:
   ```bash
   pnpm build
   ```

2. Start the production server:
   ```bash
   pnpm start
   ```

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
