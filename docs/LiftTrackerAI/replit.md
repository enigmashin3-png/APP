# Fitness Tracking Application

## Overview

This is a comprehensive workout tracking web application built with React, Express, and Drizzle ORM. The app provides users with tools to plan, execute, and monitor their fitness journeys through workout plans, exercise databases, progress tracking, and real-time workout logging. It features a modern, responsive design optimized for both desktop and mobile devices with a focus on gym-friendly usability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: React with TypeScript using Vite for development and build tooling
- **Routing**: Wouter for lightweight client-side routing with pages organized under `/client/src/pages/`
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Responsive Design**: Mobile-first approach with bottom navigation for mobile and sidebar for desktop
- **Styling**: Tailwind CSS with custom CSS variables for theming and dark mode support

### Backend Architecture

- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API with endpoints for exercises, workout plans, sessions, and sets
- **Storage Layer**: Configurable storage interface (IStorage) with in-memory implementation (MemStorage) for rapid prototyping
- **Development**: Vite middleware integration for seamless development experience with hot module replacement
- **Build Process**: ESBuild for server bundling and Vite for client build

### Data Model

- **Users**: Basic user profiles with fitness levels (beginner/intermediate/advanced)
- **Exercises**: Comprehensive exercise database with categories, muscle groups, equipment, and instructions
- **Workout Plans**: Template-based and custom workout plans with structured exercise routines
- **Workout Sessions**: Real-time workout tracking with timing, volume calculations, and completion status
- **Workout Sets**: Individual exercise sets with reps, weight, and completion tracking
- **Progressive Overload**: Algorithm-based weight and rep recommendations for continuous improvement

### Key Features

- **Progressive Overload Calculator**: Intelligent weight and rep suggestions based on previous performance
- **Real-time Workout Timer**: Session timing with rest period tracking
- **Exercise Database**: Searchable library with filtering by category and muscle groups
- **Workout History**: Comprehensive logging of all completed workouts with analytics
- **Progress Visualization**: Charts and metrics to track strength gains over time
- **Responsive Design**: Optimized for mobile gym usage with quick data entry

## External Dependencies

### Core Framework Dependencies

- **React Ecosystem**: React 18+ with React DOM, React Hook Form, and React Query for frontend functionality
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Extensive Radix UI component library (@radix-ui/\*) for accessible, unstyled primitives
- **Styling**: Tailwind CSS for utility-first styling with PostCSS for processing

### Data Layer

- **Database**: PostgreSQL with Neon Database serverless hosting (@neondatabase/serverless)
- **ORM**: Drizzle ORM for type-safe database operations with Drizzle Kit for migrations
- **Validation**: Zod for schema validation and type inference with drizzle-zod for schema integration

### Development Tools

- **Build Tools**: Vite for frontend development and building, ESBuild for server bundling
- **TypeScript**: Full TypeScript support across frontend and backend
- **Development**: TSX for running TypeScript in development, Replit-specific plugins for enhanced development experience

### Utility Libraries

- **Date Handling**: date-fns for date manipulation and formatting
- **Class Names**: clsx and tailwind-merge for conditional CSS class management
- **Icons**: Lucide React for consistent iconography
- **Unique IDs**: nanoid for generating unique identifiers
- **Charts**: Recharts for data visualization and progress tracking
- **Session Management**: connect-pg-simple for PostgreSQL-based session storage

### Notable Architectural Decisions

- **In-Memory Storage**: Default to MemStorage for rapid prototyping without database setup complexity
- **Mobile-First Design**: Bottom navigation for mobile, sidebar for desktop to optimize gym usage
- **Progressive Overload Logic**: Built-in algorithm for intelligent workout progression recommendations
- **Componentized UI**: Extensive use of reusable shadcn/ui components for consistent design
- **Type Safety**: Full TypeScript coverage with shared schemas between frontend and backend
