# Changelog

## 0.1.0

Initial release.

- `files` table with path index and full-text search indexes
- CRUD operations: `upsert`, `batchUpsert`, `remove`, `removeDir`, `get`, `count`
- Shell commands: `ls`, `ls -l`, `cat`, `head`, `tail`, `grep`, `grep -i`, `grep -c`, `find`, `tree`, `wc`, `stat`, `pwd`, `cd`, `echo`, `help`
- HTTP endpoints: `/tree` (GET), `/exec` (POST), `/file` (GET) with CORS support
- `VirtualFs` client class for calling from app mutations, queries, and actions
- Test helpers for `convex-test`
- Example app with sync patterns
