# Ehime Base Development Rules

This file documents the mandatory rules for developing the Ehime Base application.
These rules must be followed to ensure development context is never lost and server stability is maintained.

## 1. Development Logging Protocol
*   **Persistent Context**: Before starting any new task or ending a session, the current status must be documented in `DEV_JOURNAL.md`.
*   **Status Check**: At the beginning of every turn, read `task.md` and `DEV_JOURNAL.md` to understand:
    *   What was just completed?
    *   What is currently in progress?
    *   What is the immediate next step?
*   **Explicit Handoffs**: When stopping development or asking for user review, explicitly state the current state of the code and database.

## 2. Server Management
*   **Port Consistency**: Always target **localhost:3000**.
    *   If port 3000 is busy, **DO NOT** silently switch to another port.
    *   Kill the existing process on port 3000 and restart, or ask the user for permission.
*   **Verification**: After restarting the server, verify it is accessible at the expected URL.

## 3. Database Management
*   **Migration Tracking**: All DB changes must be captured in SQL migration files in `supabase/migrations`.
*   **Execution Verification**: After creating a migration, explicitly remind the user to run it in the SQL Editor or run it programmatically if possible.

## 4. Communication Protocol
*   **Language**: All communication, documentation, and comments must be in **Japanese**. This is a strict rule.

