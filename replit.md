# Overview

This is a professional React-based **Fee Recuperation Savings Calculator** for Dynamic Merchant Processing (DMP). The main purpose is to help merchants understand their potential cost savings when switching to DMP's Fee Recuperation Program (dual pricing, cash discounting, or supplemental fee payment processing models). The application calculates processing fees, markup collections, and demonstrates how the program can reduce or eliminate credit card processing costs for businesses.

The calculator takes various merchant parameters (monthly credit card volume, monthly cash volume, processing rates, tax/tip rates) and provides real-time calculations showing current costs versus new costs under the Fee Recuperation Program, along with potential monthly and annual savings. It generates professional PDF reports with DMP branding for sales presentations.

## Recent PDF Generation Updates (September 2025)
- **Version 1.9.1 Unified Naming Conventions**: Standardized fee collection terminology throughout the application and PDFs
  - **Dual Pricing Mode**: Changed "Markup Collected" to "Card Price Increase Collected (Cards)"
  - **Supplemental Fee Mode**: Changed all variations to "Supplemental Fee Collected — Cards" and "Supplemental Fee Collected — Cash"
  - Updated tooltips, UI components, and PDF generators to reflect consistent naming
- **Version 1.9.0 Complete UI-PDF Consistency**: Achieved complete 1-to-1 consistency between app UI and PDF
- **Unified Label Consistency**: Changed "Card Under/Over-Recovery" and "Net Change in Card Processing" to "Processing Cost after Price Differential" throughout app and PDF
- **Live Calculations Structure**: Restructured PDF Live Calculations into 3 distinct sections matching the app exactly:
  - Section 1: Derived Bases & Totals  
  - Section 2: Processing on Cards (New Program)
  - Section 3: Savings vs Today
- **Section Headers**: Implemented section header rendering in PDF generator for rows with `format: 'section'`
- **Data Flow Alignment**: Ensured all data points appear in exact same order as application (1-to-1 match)
- Applied comprehensive patches to ensure Monthly Processing Savings table renders properly
- Added `buildMonthlySavingsRows()` helper with numeric coercion in `pdfDataTransformer.ts`
- Updated to `pdf.config.json` v1.8.0 with strict two-page layout and enhanced data bindings
- Single DMP logo in header with professional Report # and Date chips
- Page 1: Customer Information + Input Parameters with colored title bars
- Page 2: Live Volume Breakdown + Monthly Processing Savings as full-width table
- Implemented robust numeric value handling to prevent formatting issues
- Both program types (Dual Pricing and Supplemental Fee) generate PDFs successfully with consistent formatting
- Configuration uses `sourceOfTruth: "ui"` to mirror UI presentation exactly without recalculation
- Verified end-to-end PDF generation with complete data population for all sections

## Previous PDF Generation Updates (August 2025)
- **BREAKTHROUGH**: Implemented server-side logo loading solution reading DMP logo at startup
- Successfully converted 277,736 byte logo to 370,316 character base64 string with validation
- Applied official DMP brand color palette: Ultramarine (#0046FF), Aqua (#1CD3D3), Spruce (#0A7A64), Ink (#0F172A)
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