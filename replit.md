# FinanceCalc Pro

## Overview

FinanceCalc Pro is a comprehensive financial calculator web application built for calculating various tax-advantaged benefits and financial planning scenarios. The application provides calculators for HSA/FSA contributions, commuter benefits, and life insurance needs assessment, all updated with 2025 tax rules and contribution limits.

The application features a modern React frontend with a Node.js/Express backend, designed with a glassmorphism UI aesthetic and comprehensive calculation engines for each financial scenario.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Design Pattern**: Glass morphism UI with gradient backgrounds and semi-transparent cards

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Pattern**: RESTful API design with JSON request/response format
- **Storage**: In-memory storage implementation (MemStorage class) with interface for future database integration
- **Session Management**: Calculation sessions stored with UUID identification
- **Error Handling**: Centralized error handling middleware with structured error responses

### Data Layer
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Centralized schema definitions in `/shared` directory for type safety
- **Validation**: Zod schemas for runtime validation of inputs and API requests
- **Database**: PostgreSQL configured via Neon Database serverless connection

### Project Structure
- **Monorepo Setup**: Client, server, and shared code in single repository
- **Shared Types**: Common TypeScript interfaces and schemas shared between frontend and backend
- **Path Aliases**: Configured aliases for clean imports (@/ for client, @shared for shared code)
- **Build Strategy**: Separate build processes for client (Vite) and server (esbuild)

### Key Features
- **Calculator Types**: Three main calculators (HSA/FSA, Commuter Benefits, Life Insurance)
- **Real-time Calculations**: Immediate updates as users modify inputs
- **Session Persistence**: Ability to save and retrieve calculation sessions
- **Responsive Design**: Mobile-first responsive layout
- **Print Support**: Built-in print functionality for calculation results
- **2025 Tax Compliance**: Updated with current year contribution limits and tax rules

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessible component foundations
- **Charts**: Recharts for data visualization where applicable
- **Form Handling**: React Hook Form with Hookform Resolvers for form validation
- **Date Utilities**: date-fns for date manipulation and formatting
- **Styling**: class-variance-authority and clsx for dynamic className management
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm with drizzle-zod for type-safe database operations
- **Session Store**: connect-pg-simple for PostgreSQL session storage (configured but using memory storage)
- **Development**: tsx for TypeScript execution in development mode

### Development Tools
- **Build Tools**: Vite for frontend, esbuild for backend bundling
- **Type Checking**: TypeScript with strict mode enabled
- **Code Quality**: ESLint and Prettier configurations (implicit via Replit setup)
- **Development Server**: Vite dev server with HMR and development overlays
- **Database Migration**: Drizzle Kit for schema management and migrations

### Third-party Services
- **Database Hosting**: Neon Database for serverless PostgreSQL
- **Font Loading**: Google Fonts for Inter typography
- **Development Environment**: Replit-specific plugins and banners for development mode