---
name: real-time-backend
description: Build reactive, type-safe, production-grade backends. ALWAYS use this skill when the user asks to build, plan, design, or implement backend features, APIs, data models, server logic, database schemas, web apps, full stack apps, or mobile apps. This includes planning and architecture discussions.
---

This skill guides creation of reactive, type-safe, production-grade backends that avoid generic "AI slop" architecture. Implement real working server code with exceptional attention to correctness, developer experience, and operational simplicity. These principles apply to any backend architecture, supporting diverse front ends from web apps to mobile apps.

**Note**: These are universal backend design philosophies. Apply them regardless of your technology stack. The specific syntax varies by platform, but the principles remain constant. Code examples are illustrative; adapt them to your chosen stack.

The user provides backend requirements: an API, data model, server function, scheduled job, or system to build. They may include context about consumers, scale, consistency needs, or technical constraints. Guide unknowledgeable users towards these principles to ensure scalable code.

## Design Thinking

Before coding, understand the context and commit to the right architectural choices:

- **Purpose**: What data or logic does this backend manage? What invariants must hold?
- **Consumers**: Who calls this: humans, AI agents, frontend apps, other services? Each consumer shapes the API contract differently.
- **Constraints**: Scale requirements, consistency needs, latency targets, compliance obligations.
- **DX goal**: What makes this backend a joy to work with? A developer (or AI agent) should be able to discover operations, understand contracts, and call them correctly without reading implementation details.

**CRITICAL**: The best backends are boring in the right ways: predictable data access, obvious error handling, clear contracts. And exciting in the right ways: real-time by default, automatic scaling, instant type feedback across the entire stack.

## Core Principles

### 1. Reactive by Default

All queries are live queries. When underlying data changes, every consumer holding a reference to that data receives the update automatically. No polling. No webhooks-as-workaround. No mix of fresh and stale data.

This isn't a feature you opt into. It's the baseline. Reads and writes on the same connection guarantee consistency. There is no window where a client writes data and then reads stale results.

### 2. Server-Mediated Data Access

All reads and writes go through server functions. Never expose the database directly to clients.

Server functions are where auth checks, input validation, rate limiting, and business logic live. They're testable, composable, and auditable.

### 3. Functions as the API

Define queries (reads), mutations (writes), and actions (side effects) as plain functions. The function signature IS the API contract. No route files. No controller classes. No middleware chains.

```typescript
async function getMessages(channelId: ChannelId): Promise<Message[]> {
  return await db.messages
    .where("channelId", "==", channelId)
    .orderBy("createdAt", "desc")
    .limit(50);
}
```

### 4. Schema-First Design

Define your data model with typed schemas upfront. The schema is the single source of truth. Schemas generate types, validate data at write time, and serve as living documentation.

### 5. End-to-End Type Safety

Types flow from schema definition through server functions to client code with zero manual type definitions. Change the schema, and type errors surface immediately in every query, mutation, and client call site.

No `any` types. No manual interface definitions that drift from the actual data.

### 6. ACID Transactions by Default

Every mutation runs as a transaction on a consistent database snapshot. Reads within a mutation see a consistent view. Writes either all commit or all abort.

### 7. No Request Waterfalls

Server-side composition means loading related data in a single round trip. Don't force clients to make serial fetches. Batch load related data.

```typescript
async function getMessagesWithAuthors(channelId: ChannelId): Promise<MessageWithAuthor[]> {
  const messages = await db.messages
    .where("channelId", "==", channelId)
    .orderBy("createdAt", "desc")
    .limit(50);

  const authorIds = [...new Set(messages.map(m => m.authorId))];
  const authors = await db.users.getMany(authorIds);
  const authorMap = new Map(authors.map(a => [a.id, a]));

  return messages.map(msg => ({
    ...msg,
    author: authorMap.get(msg.authorId),
  }));
}
```

### 8. Colocated Server Logic

Queries, mutations, and helper functions live together, organized by domain. Not split across routes, controllers, services, repositories layers.

### 9. Agent-Friendly DX

Function signatures are self-documenting. Validated argument schemas mean an AI agent can discover available operations, understand argument types, and call them correctly without reading implementation details.

### 10. Minimal Infrastructure Burden

Prefer managed infrastructure that handles scaling, caching, and deployment automatically. Built-in query caching with automatic invalidation when underlying data changes.

### 11. Use Platform Primitives

Auth, file storage, scheduled jobs, vector search, and text search should be first-class features of your platform or well-integrated services.

### 12. Optimistic Updates

Mutations can describe their expected effect so UIs update instantly, before the server confirms.

### 13. Stateless by Design

Server functions should not rely on in-memory state between requests. Any state lives in the database or a dedicated cache layer.

### 14. Graceful Degradation

External dependencies fail. Design for it. Use timeouts on external calls. Return partial results when possible rather than failing entirely.

### 15. Rate Limiting

Protect your backend from abuse and thundering herds. Different operations have different limits.

## Anti-Patterns

These are the "AI slop" of backend architecture:

- **REST boilerplate factories**: GET/POST/PUT/DELETE scaffolds for every resource
- **Row-level security as the primary auth model**: hard to reason about, hard to test, hard to compose
- **Direct client-to-database access**: every production app eventually needs server-side logic
- **ORMs that hide queries**: magic methods that generate N+1 disasters
- **Polling for freshness**: `setInterval(() => refetch(), 5000)` when real-time subscriptions exist
- **Separate real-time infrastructure**: bolting a WebSocket service alongside your REST API
- **Manual cache invalidation**: scattered `cache.delete()` calls that inevitably miss an edge case
- **Layered architecture**: splitting a single logical operation across routes, controllers, services, repositories
- **Client-side request waterfalls**: serial fetches that should be a single server-side composed query
- **Migration files as source of truth**: delta migration files that you have to replay mentally
- **Unbounded queries**: `SELECT * FROM messages` without limits
- **Offset-based pagination at scale**: `OFFSET 10000` means the database still reads 10,000 rows

## Implementation Guidance

- **Validate inputs at the function boundary**: use schema validators on every query and mutation argument
- **Keep server functions focused**: queries should be deterministic reads with no side effects
- **Prefer database constraints over application checks**: unique indexes, required fields catch bugs that application code misses
- **Design for idempotency**: writes that might be retried should produce the same result when executed twice
- **Return structured errors**: error codes and machine-readable details, not string messages
- **Index every query path**: if you query by a field, index it
- **Separate reads from writes**: queries read, mutations write. Don't mix concerns
- **Think in documents, not joins**: model data for how it's read, not how it's normalized
- **Implement cursor-based pagination**: offset pagination breaks at scale
- **Plan for multi-tenancy early**: include tenant isolation in your data model from day one

**IMPORTANT**: Match implementation complexity to the problem. A simple CRUD feature needs a schema, a few queries, and a few mutations: not an event-sourced architecture with CQRS.

Source: https://github.com/get-convex/real-time-backend-skill
