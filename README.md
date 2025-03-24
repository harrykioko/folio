
# Folio - Unified Management Platform

## Project Overview

Folio is the central data management platform that enables unified operational management across all HIM verticals. It serves as the operational backbone of the organization, providing a single source of truth for all business assets, collaboration tools, and analytics capabilities.

The platform is designed to reduce administrative overhead by centralizing information management, automating routine tasks, and providing intelligent insights for strategic decision-making. This allows founders and team members to focus on growth while maintaining complete visibility and control over operations.

## Key Features

### Centralized Asset Repository
- **Domain Management**: Track registrations, renewal dates, and DNS settings
- **Account Management**: Securely store credentials for all business tools and services
- **Document Storage**: Legal documents, contracts, and important business files
- **Technical Asset Registry**: Code repositories, API credentials, and configuration management

### AI Assistance
- **Intelligent Research**: AI-powered tools for information gathering and summarization
- **Content Generation**: Automated creation of reports, documentation, and communications
- **Decision Support**: Data analysis and recommendations for strategic planning
- **Workflow Automation**: AI-driven automation of routine administrative tasks

### Workspace Collaboration
- **Real-Time Document Editing**: Collaborative workspace for team document creation
- **Task Management**: Assign, track, and prioritize work across the organization
- **Meeting Coordination**: Scheduling, agenda building, and minutes capture
- **Team Communication**: Integrated messaging and discussion threads

### Comprehensive Analytics
- **Financial Tracking**: Budget management and expense monitoring
- **Performance Metrics**: Custom KPI tracking across all business verticals
- **Cross-Vertical Analysis**: Identify patterns and opportunities across product lines
- **Visualization Tools**: Clear data representation for strategic insights

## Technical Overview

Folio is built on a modern technology stack:

- **Frontend**: React with TypeScript, leveraging shadcn/ui components and Tailwind CSS
- **Backend**: Supabase providing PostgreSQL database, authentication, and serverless functions
- **Infrastructure**: Cloud-hosted with CI/CD pipelines for seamless deployment
- **Security**: JWT authentication, role-based access control, and comprehensive audit logging

## Project Structure

The codebase is organized as follows:

```
folio/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # Base UI components from shadcn
│   │   ├── landing/     # Components for landing page
│   │   └── settings/    # Components for settings pages
│   ├── config/          # Configuration files
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # External service integrations
│   │   └── supabase/    # Supabase client and types
│   ├── lib/             # Utility functions and helpers
│   ├── pages/           # Top-level page components
│   └── types/           # TypeScript type definitions
├── supabase/            # Supabase configuration
└── tailwind.config.ts   # Tailwind CSS configuration
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd folio
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
- Copy `.env.example` to `.env.local`
- Update the variables with your Supabase credentials

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Development Workflow

### Git Workflow

We recommend following a GitHub Flow approach:

1. Create a new branch for each feature or bug fix
```bash
git checkout -b feature/feature-name
# or
git checkout -b fix/bug-name
```

2. Make changes and commit frequently with clear messages
```bash
git commit -m "Add brief description of changes"
```

3. Push to the remote repository and create a pull request
```bash
git push -u origin feature/feature-name
```

4. After code review, merge to the main branch

### Code Style

- Follow the existing project structure and naming conventions
- Use TypeScript for type safety
- Write clean, self-documenting code with appropriate comments
- Ensure components are modular and reusable

## Transition Plan: Lovable to Windsurf

Folio was initially developed using Lovable's AI-assisted development platform. The transition to Windsurf involves:

1. **Code Migration**: Transfer of the codebase to Windsurf's development environment
2. **Feature Parity Validation**: Ensure all functionality works identically in the new environment
3. **Performance Optimization**: Leverage Windsurf's capabilities to enhance application performance
4. **Development Workflow Adaptation**: Adjust team processes to align with Windsurf's collaboration tools

The transition is scheduled to be completed by Q4 2024, with both platforms running in parallel during the transition period to ensure business continuity.

## Contact Information

**Project Owner**: HIM Technology Team
- Email: tech@himgroup.com
- Internal Slack: #folio-development

For urgent issues or questions, please contact the current project lead directly or post in the dedicated Slack channel.
