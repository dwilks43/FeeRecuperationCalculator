# Overview

This is a professional React-based **Fee Recuperation Savings Calculator** for Dynamic Merchant Processing (DMP). The main purpose is to help merchants understand their potential cost savings when switching to DMP's Fee Recuperation Program (dual pricing payment processing model). The application calculates processing fees, markup collections, and demonstrates how the program can reduce or eliminate credit card processing costs for businesses.

The calculator takes various merchant parameters (monthly credit card volume, monthly cash volume, processing rates, tax/tip rates) and provides real-time calculations showing current costs versus new costs under the Fee Recuperation Program, along with potential monthly and annual savings. It generates professional PDF reports with DMP branding for sales presentations.

## Recent PDF Generation Updates (August 2025)
- **BREAKTHROUGH**: Implemented server-side logo loading solution reading DMP logo at startup
- Successfully converted 277,736 byte logo to 370,316 character base64 string with validation
- Applied official DMP brand color palette: Ultramarine (#004ED3), Aqua (#2BD8C2), Spruce (#00937B), Ink (#0B2340)
- Replaced emoji section markers with professional styled section headers
- Removed redundant chip labels for clean, premium hierarchy
- Enhanced Monthly Savings emphasis with larger type (24px) and Spruce green highlighting
- Improved Annual Savings display with enhanced positive emphasis
- Fixed footer layout preventing text wrapping with table-cell approach
- Maintained DocRaptor-safe markup with simple tables and inline CSS
- Reordered sections: Customer Info → Input Parameters → Volume Breakdown → Monthly Processing Savings → Annual Impact

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