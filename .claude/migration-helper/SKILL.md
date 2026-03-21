---
name: migration-helper
description: Plan and execute Convex schema migrations safely, including adding fields, creating tables, and data transformations. Use when schema changes affect existing data.
---

# Convex Migration Helper

Safely migrate Convex schemas and data when making breaking changes.

## When to Use

- Adding new required fields to existing tables
- Changing field types or structure
- Splitting or merging tables
- Renaming fields
- Migrating from nested to relational data

## Migration Principles

1. **No Automatic Migrations**: Convex doesn't automatically migrate data
2. **Additive Changes are Safe**: Adding optional fields or new tables is safe
3. **Breaking Changes Need Code**: Required fields, type changes need migration code
4. **Zero-Downtime**: Write migrations to keep app running during migration

## Safe Changes (No Migration Needed)

- Adding optional fields
- Adding new tables
- Adding indexes

## Breaking Changes (Migration Required)

### Adding Required Field

**Solution**: Add as optional first, backfill data, then make required.

```typescript
// Step 1: Add as optional
users: defineTable({
  name: v.string(),
  email: v.optional(v.string()),
})

// Step 2: Create migration
export const backfillEmails = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      if (!user.email) {
        await ctx.db.patch(user._id, {
          email: `user-${user._id}@example.com`,
        });
      }
    }
  },
});

// Step 3: Run migration via dashboard or CLI
// npx convex run migrations:backfillEmails

// Step 4: Make field required (after all data migrated)
users: defineTable({
  name: v.string(),
  email: v.string(),
})
```

### Renaming Field

```typescript
// Step 1: Add new field (optional)
// Step 2: Copy data with internalMutation
// Step 3: Update schema (remove old field)
// Step 4: Update all code to use new field name
```

## Migration Patterns

### Batch Processing

For large tables, process in batches:

```typescript
export const migrateBatch = internalMutation({
  args: {
    cursor: v.optional(v.string()),
    batchSize: v.number(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("largeTable").take(args.batchSize);

    for (const item of items) {
      await ctx.db.patch(item._id, { /* migration logic */ });
    }

    return {
      processed: items.length,
      hasMore: items.length === args.batchSize,
    };
  },
});
```

### Dual-Write Pattern

For zero-downtime migrations, write to both old and new structure during transition.

### Scheduled Migration

Use cron jobs for gradual migration:

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval(
  "migrate-batch",
  { minutes: 5 },
  internal.migrations.migrateBatch,
  { batchSize: 100 }
);
export default crons;
```

## Migration Checklist

- [ ] Identify breaking change
- [ ] Add new structure as optional/additive
- [ ] Write migration function (internal mutation)
- [ ] Test migration on sample data
- [ ] Run migration in batches if large dataset
- [ ] Verify migration completed (all records updated)
- [ ] Update application code to use new structure
- [ ] Deploy new code
- [ ] Remove old fields from schema
- [ ] Clean up migration code

## Common Pitfalls

1. **Don't make field required immediately**: Always add as optional first
2. **Don't migrate in a single transaction**: Batch large migrations
3. **Don't forget to update queries**: Update all code using old field
4. **Don't delete old field too soon**: Wait until all data migrated
5. **Test thoroughly**: Verify migration on dev environment first

Source: https://github.com/get-convex/convex-agent-plugins
