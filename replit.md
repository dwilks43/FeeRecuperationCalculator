# Overview

This is a React-based dual pricing savings calculator widget application. The main purpose is to help merchants understand their potential cost savings when switching to a dual pricing payment processing model. The application calculates processing fees, markup collections, and demonstrates how dual pricing can reduce or eliminate credit card processing costs for businesses.

The calculator takes various merchant parameters (monthly volume, processing rates, tax/tip rates) and provides real-time calculations showing current costs versus new costs under a dual pricing model, along with potential monthly and annual savings.

## Recent PDF Generation Updates (August 2025)
- Implemented comprehensive PDF report with customer information capture
- Applied unified section styling with blue gradient backgrounds and rounded corners
- Fixed DocRaptor logo rendering issues using table-based layout with inline styles
- Added proper currency formatting with commas for all monetary values
- Reordered sections: Customer Info → Input Parameters → Volume Breakdown → Monthly Processing Savings → Annual Impact
- Enhanced Monthly Processing Savings card sizing consistency
- Added Tax Rate and Tip Rate to Input Parameters section
- Resolved customer data display issues (removed N/A fallbacks)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: React useState for local component state (no complex state management needed)
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development Server**: Custom Vite integration for seamless full-stack development
- **API Structure**: RESTful endpoints with `/api` prefix
- **Error Handling**: Centralized error middleware with structured error responses
- **Session Management**: In-memory storage implementation (ready for database integration)

## Data Storage Solutions
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe queries
- **Database**: PostgreSQL via Neon serverless (configured but not actively used)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Current Storage**: In-memory storage for development (MemStorage class)
- **Session Store**: Connect-pg-simple configured for PostgreSQL session storage

## Development Tools & Configuration
- **Type Checking**: Strict TypeScript configuration with path mapping
- **Code Quality**: ESLint and Prettier for consistent code formatting
- **Asset Management**: Vite asset pipeline with custom alias configuration
- **Environment**: Replit-optimized with development banners and error overlays

## External Dependencies
- **UI Framework**: Extensive Radix UI component library for accessible components
- **Date Handling**: date-fns for date manipulation utilities
- **State Management**: TanStack React Query for server state management (configured but minimal usage)
- **Validation**: Zod for runtime type validation and form schemas
- **Icons**: Lucide React for consistent iconography
- **Styling Utilities**: Class Variance Authority (CVA) for component variant management

## Key Features
- **Real-time Calculations**: Live preview of savings as users modify input parameters
- **Dual Pricing Logic**: Complex mathematical formulas for base volume, markup, and cost calculations
- **Interactive Tooltips**: Comprehensive help system explaining each input and calculated value
- **Responsive Design**: Mobile-first approach with Tailwind responsive utilities
- **Professional UI**: Sales-ready presentation with consistent branding and visual hierarchy
- **Demo Mode**: Pre-filled demo values for quick demonstration purposes

The application follows a component-based architecture with clear separation of concerns between calculation logic, UI components, and data flow. The mathematical formulas are centralized in utility functions to ensure consistency across all components.