# Newsletter Architecture

This document outlines the architecture of the self-hosted newsletter system for `kiranic.com`, powered by Cloudflare D1, Resend, and GitHub Actions.

## System Overview

The system consists of three main workflows:
1.  **Subscription**: Users sign up via the website.
2.  **Automation**: A weekly script fetches content and emails subscribers.
3.  **Unsubscribe**: Users remove themselves via secure tokens.

```mermaid
graph TD
    subgraph "Frontend (User)"
        User((User))
        Form[Newsletter Form<br>src/components/Newsletter.astro]
        Email[User Email Client]
        UnsubPage[Unsubscribe Page<br>src/pages/unsubscribe.astro]
    end

    subgraph "Astro Backend (Cloudflare Pages)"
        SubAPI[API Route<br>src/pages/api/subscribe.ts]
        UnsubLogic[Unsubscribe Logic<br>Server-Side Rendered]
    end

    subgraph "Data & Infrastructure"
        D1[(Cloudflare D1 Database<br>Table: subscribers)]
        Resend[Resend API<br>Email Delivery]
    end

    subgraph "Automation (GitHub Actions)"
        Cron[Weekly Workflow<br>.github/workflows/weekly-newsletter.yml]
        Script[Node Script<br>scripts/send-newsletter.js]
        Content[Content Source<br>src/content/slop/*.md]
    end

    %% Subscription Flow
    User -->|1. Enters Email| Form
    Form -->|2. POST /api/subscribe| SubAPI
    SubAPI -->|3. Validate & Generate UUID| SubAPI
    SubAPI -->|4. INSERT OR IGNORE| D1
    SubAPI -.->|5. JSON Response| Form

    %% Sending Flow
    Cron -->|1. Triggers Monday @ 2pm UTC| Script
    Script -->|2. Read Last 7 Days| Content
    Script -->|3. SELECT * FROM subscribers| D1
    Script -->|4. Generate Personal Link| Script
    Script -->|5. Send via API| Resend
    Resend -->|6. Deliver Email| Email

    %% Unsubscribe Flow
    Email -->|1. Click Link with Token| UnsubPage
    UnsubPage -->|2. GET /unsubscribe?token=...| UnsubLogic
    UnsubLogic -->|3. SELECT & Validate| D1
    UnsubLogic -->|4. DELETE FROM subscribers| D1
    UnsubLogic -.->|5. Show Success/Error| UnsubPage

    %% Styling
    classDef frontend fill:#e0f2f1,stroke:#004d40,stroke-width:2px;
    classDef backend fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef db fill:#e8eaf6,stroke:#1a237e,stroke-width:2px;
    classDef auto fill:#f3e5f5,stroke:#4a148c,stroke-width:2px;

    class Form,Email,UnsubPage frontend;
    class SubAPI,UnsubLogic backend;
    class D1,Resend db;
    class Cron,Script,Content auto;
```

## Detailed Component Breakdown

### 1. Subscription (`src/pages/api/subscribe.ts`)
- **Method**: `POST`
- **Logic**: 
  - Validates email format.
  - Generates a unique UUID `token` for the subscriber.
  - Inserts into D1: `INSERT OR IGNORE INTO subscribers (email, token) VALUES (?, ?)`.
  - Returns JSON success/error to the frontend form.

### 2. Automation (`scripts/send-newsletter.js`)
- **Trigger**: GitHub Actions Cron (`0 14 * * 1` - Mondays at 2 PM UTC).
- **Process**:
  - Fetches markdown files from `src/content/slop` modified in the last 7 days.
  - Fetches all subscribers from D1 via Cloudflare API.
  - Iterates through subscribers:
    - Generates a personalized unsubscribe link: `https://kiranic.com/unsubscribe?token=[USER_TOKEN]`.
    - Renders the HTML email template.
    - Sends via Resend API to `kp@news.kiranic.com`.

### 3. Unsubscription (`src/pages/unsubscribe.astro`)
- **Method**: `GET` (SSR)
- **Logic**:
  - Extracts `token` from URL query parameters.
  - access D1 Database via `Astro.locals.runtime.env.DB`.
  - Verifies token existence.
  - Executes `DELETE FROM subscribers WHERE token = ?`.
  - Renders a success or error message to the user.
