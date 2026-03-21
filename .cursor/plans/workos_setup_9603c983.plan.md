---
name: WorkOS Setup
overview: Complete WorkOS AuthKit integration for the dashboard by creating the Callback page, adding auth protection to Dashboard, and adding the callback route.
todos:
  - id: create-callback
    content: Create src/pages/Callback.tsx with auth redirect handling
    status: completed
  - id: add-callback-route
    content: Add /callback route handling to src/App.tsx
    status: completed
  - id: update-dashboard
    content: Add WorkOS auth protection to Dashboard.tsx
    status: completed
  - id: test-flow
    content: Test authentication flow locally
    status: completed
  - id: todo-1767049823884-2nns40kqq
    content: ""
    status: pending
isProject: false
---

# WorkOS AuthKit Setup Plan

## Current Status

| Step     | Description                         | Status             |
| -------- | ----------------------------------- | ------------------ |
| Part 1-2 | Create WorkOS account and configure | Done               |
| Part 3   | Install dependencies                | Done               |
| Part 4   | Environment variables               | Done               |
| Part 5   | Convex auth config                  | Done               |
| Part 6   | Update main.tsx                     | Done               |
| Part 7   | Create Callback route               | Missing            |
| Part 8   | Protected Dashboard                 | Needs auth wrapper |
| Part 9   | Add routes to App.tsx               | Missing /callback  |
| Part 10  | Test                                | Pending            |

---

## Tasks

### 1. Create Callback.tsx (Part 7)

Create `src/pages/Callback.tsx` that handles OAuth callback and redirects to dashboard.

### 2. Add /callback route to App.tsx (Part 9)

Add callback route handling similar to how dashboard is handled.

### 3. Update Dashboard.tsx (Part 8)

Wrap existing dashboard with auth guards using Authenticated, Unauthenticated, and AuthLoading from convex/react.

### 4. Test (Part 10)

Test the full authentication flow locally.

---

## Files

| File                    | Action              |
| ----------------------- | ------------------- |
| src/pages/Callback.tsx  | Create              |
| src/App.tsx             | Add /callback route |
| src/pages/Dashboard.tsx | Add auth wrapper    |
