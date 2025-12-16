# Banque Misr AI Voice Training Platform

A production-ready authentication system built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🔐 Email/Password Authentication
- 📝 User Registration with Password Strength Indicator
- 🔑 Password Reset Flow
- 🎨 Beautiful, Responsive UI with Custom Animations
- 🛡️ Route Protection Middleware
- ✅ Form Validation with Zod
- 🎯 TypeScript Strict Mode
- 🚀 Next.js 14 App Router

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase project (get one at [supabase.com](https://supabase.com))

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings under API.

3. Configure Supabase:

- Go to your Supabase Dashboard
- Navigate to Authentication → Providers
- Enable "Email" provider
- (Optional) Configure email templates
- Add redirect URLs:
  - Development: `http://localhost:3000/auth/callback`
  - Production: `https://your-domain.com/auth/callback`

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Authentication pages (login, signup, forgot-password)
│   ├── (dashboard)/     # Protected dashboard pages
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page (redirects)
├── components/
│   ├── ui/              # Reusable UI components
│   └── auth/            # Auth-specific components
├── lib/
│   ├── supabase/        # Supabase client configuration
│   ├── utils/           # Utility functions
│   └── constants/      # Constants (colors, etc.)
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
└── styles/              # Global styles
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Form Management**: React Hook Form + Zod
- **Icons**: Material Symbols Outlined
- **Fonts**: Manrope (Google Fonts)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Authentication Flow

1. **Login**: Users can sign in with email and password
2. **Signup**: New users can create accounts with password strength validation
3. **Password Reset**: Users can request password reset links via email
4. **Route Protection**: Middleware automatically protects routes and redirects users

## Customization

### Brand Colors

Edit `tailwind.config.ts` to customize brand colors:

```typescript
colors: {
  'bm-maroon': '#7A1A25',
  'bm-maroon-light': '#9B2C3A',
  'bm-maroon-dark': '#60141D',
  'bm-gold': '#FFC72C',
  'bm-gold-hover': '#E6B328',
}
```

### Animations

Custom animations are defined in `tailwind.config.ts`:
- `blob` - Floating blob animation
- `wave` - Wave SVG animation
- `fade-in-up` - Fade in from bottom
- `shimmer` - Button shimmer effect

## License

© 2024 Banque Misr. All rights reserved.







