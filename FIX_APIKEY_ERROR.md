# Fixing ApiKey Duplicate Key Error

## Problem
You're getting this error:
```
MongoServerError: E11000 duplicate key error collection: CrispDB.apikeys index: api_key_1 dup key: { api_key: null }
```

This happens because:
1. There's an old index `api_key_1` from a previous schema version
2. The current model uses `api_key_hash` but the old index still exists
3. MongoDB is trying to enforce uniqueness on a field that may have null values

## Solution

### Option 1: Run the Fix Script (Recommended)

Run this command in the backend directory:

```bash
cd backend
npm run fix:apikey-index
```

This script will:
- Drop the old `api_key_1` index
- Remove any documents with null `api_key_hash` values
- Prepare the database for the correct indexes

### Option 2: Manual MongoDB Fix

If you prefer to fix it manually, connect to MongoDB and run:

```javascript
// Connect to MongoDB
use CrispDB

// Drop the old index
db.apikeys.dropIndex("api_key_1")

// Remove any documents with null api_key_hash
db.apikeys.deleteMany({ api_key_hash: null })

// Verify indexes
db.apikeys.getIndexes()
```

### Option 3: Drop and Recreate Collection (⚠️ Data Loss)

**WARNING: This will delete all API keys!**

```javascript
use CrispDB
db.apikeys.drop()
```

Then restart your server - Mongoose will recreate the collection with correct indexes.

## After Fixing

1. Restart your backend server
2. The new sparse unique index will be created automatically
3. Try creating a company again - it should work now

## What Was Fixed

1. **Model Update**: Changed `api_key_hash` to use a sparse unique index
   - Sparse indexes only enforce uniqueness for non-null values
   - This prevents conflicts if any null values exist

2. **Index Structure**:
   - `api_key_hash_1`: Sparse unique index (allows multiple nulls, enforces uniqueness for non-nulls)
   - `company_id_1`: Unique index (one API key per company)

## Prevention

The model now ensures:
- `api_key_hash` is always required (cannot be null)
- Sparse index prevents issues if any legacy null values exist
- Proper error handling in API key creation
