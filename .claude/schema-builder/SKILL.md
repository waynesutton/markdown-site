---
name: schema-builder
description: Design and generate Convex database schemas with proper validation, indexes, and relationships. Use when creating schema.ts or modifying table definitions.
---

# Convex Schema Builder

Build well-structured Convex schemas following best practices for relationships, indexes, and validators.

## When to Use

- Creating a new `convex/schema.ts` file
- Adding tables to existing schema
- Designing data model relationships
- Adding or optimizing indexes
- Converting nested data to relational structure

## Schema Design Principles

1. **Document-Relational**: Use flat documents with ID references, not deep nesting
2. **Index Foreign Keys**: Always index fields used in lookups (userId, teamId, etc.)
3. **Limit Arrays**: Only use arrays for small, bounded collections (<8192 items)
4. **Type Safety**: Use strict validators with `v.*` types

## Schema Template

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tableName: defineTable({
    field: v.string(),
    optional: v.optional(v.number()),
    userId: v.id("users"),
    status: v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("archived")
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_created", ["createdAt"]),
});
```

## Common Patterns

### One-to-Many Relationship

```typescript
export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
  }).index("by_email", ["email"]),

  posts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
  }).index("by_user", ["userId"]),
});
```

### Many-to-Many with Junction Table

```typescript
export default defineSchema({
  users: defineTable({ name: v.string() }),
  projects: defineTable({ name: v.string() }),
  projectMembers: defineTable({
    userId: v.id("users"),
    projectId: v.id("projects"),
    role: v.union(v.literal("owner"), v.literal("member")),
  })
    .index("by_user", ["userId"])
    .index("by_project", ["projectId"])
    .index("by_project_and_user", ["projectId", "userId"]),
});
```

### Hierarchical Data

```typescript
export default defineSchema({
  comments: defineTable({
    postId: v.id("posts"),
    parentId: v.optional(v.id("comments")),
    userId: v.id("users"),
    text: v.string(),
  })
    .index("by_post", ["postId"])
    .index("by_parent", ["parentId"]),
});
```

## Validator Reference

```typescript
v.string()
v.number()
v.boolean()
v.null()
v.id("tableName")
v.optional(v.string())
v.union(v.literal("a"), v.literal("b"))
v.object({ key: v.string(), nested: v.number() })
v.array(v.string())
v.record(v.string(), v.boolean())
v.any()
```

## Index Strategy

1. **Single-field indexes**: For simple lookups (`by_user: ["userId"]`)
2. **Compound indexes**: For filtered queries (`by_user_and_status: ["userId", "status"]`)
3. **Remove redundant**: `by_a_and_b` usually covers `by_a`

## Checklist

- [ ] All foreign keys have indexes
- [ ] Common query patterns have compound indexes
- [ ] Arrays are small and bounded (or converted to relations)
- [ ] All fields have proper validators
- [ ] Enums use `v.union(v.literal(...))` pattern
- [ ] Timestamps use `v.number()` (milliseconds since epoch)

Source: https://github.com/get-convex/convex-agent-plugins
