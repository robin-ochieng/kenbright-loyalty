# Supabase Migration Plan: "Full Supabase" Approach

This plan outlines the steps to migrate the Kenbright 360 backend from a local PostgreSQL + SQLAlchemy setup to a Supabase-powered backend using the Supabase Python SDK and Supabase Auth.

## Phase 1: Setup & Configuration

### 1.1 Install Dependencies
- [ ] Add `supabase` to `requirements.txt`.
- [ ] Install the package: `pip install supabase`.

### 1.2 Configure Supabase Client
- [ ] Create `backend/supabase_client.py`.
- [ ] Initialize the Supabase client using environment variables (`SUPABASE_URL`, `SUPABASE_KEY`).
- [ ] Ensure the client is a singleton to be imported across services.

### 1.3 Environment Variables
- [x] Update `.env` with Supabase credentials (Done).

## Phase 2: Database Schema Migration

### 2.1 Prepare Schema
- [ ] Review `database/schema.sql` to ensure it matches the current SQLAlchemy models in `backend/models/`.
- [ ] If `schema.sql` is outdated, generate a new DDL script from the SQLAlchemy models (or use a tool like `pg_dump` if the local DB has data).

### 2.2 Apply Schema to Supabase
- [ ] Log in to the Supabase Dashboard.
- [ ] Go to the **SQL Editor**.
- [ ] Run the schema scripts to create tables (`members`, `products`, `payments`, `loyalty_ledger`, etc.).
- [ ] Enable Row Level Security (RLS) policies (optional but recommended for future frontend direct access).

## Phase 3: Authentication Refactoring

### 3.1 Update Auth Service (`backend/auth/service.py`)
- [ ] Replace manual password hashing (`bcrypt`) with `supabase.auth.sign_up` and `supabase.auth.sign_in_with_password`.
- [ ] Replace manual OTP logic with `supabase.auth.sign_in_with_otp` and `supabase.auth.verify_otp`.
- [ ] Remove local `otp_storage` dictionary.

### 3.2 Update Auth Dependencies (`backend/auth/dependencies.py`)
- [ ] Update `get_current_member` to verify the JWT token using `supabase.auth.get_user(token)`.
- [ ] Map the Supabase User ID (UUID) to the internal `member_id` (Integer) if necessary, or switch `member_id` to UUIDs in the database to match Supabase Auth.
    *   *Decision Point*: Supabase Auth uses UUIDs. Your `members` table currently uses Integer IDs. It is highly recommended to add a `auth_user_id` (UUID) column to your `members` table to link it to `auth.users`.

### 3.3 Update Auth Routes (`backend/auth/routes.py`)
- [ ] Update login/signup endpoints to call the new service methods.
- [ ] Ensure the response returns the Supabase session/token.

## Phase 4: Data Access Layer Refactoring (The Heavy Lifting)

### 4.1 Strategy
- Replace SQLAlchemy `Session` dependency with `Supabase Client`.
- Replace ORM queries with Supabase JS-like syntax (`supabase.table('...').select(...)`).

### 4.2 Migrate Services
Iterate through each service in `backend/services/` and refactor:

#### `MemberService`
- [ ] `get_member_by_id`: `supabase.table('members').select('*').eq('member_id', id).single()`
- [ ] `create_member`: `supabase.table('members').insert(data)`
- [ ] `update_member`: `supabase.table('members').update(data).eq('member_id', id)`

#### `ProductService`
- [ ] `get_all_products`: `supabase.table('products').select('*')`
- [ ] `get_product_by_id`: `supabase.table('products').select('*').eq('product_id', id)`

#### `PaymentService`
- [ ] `record_payment`: `supabase.table('payments').insert(data)`
- [ ] `get_payments`: `supabase.table('payments').select('*').eq('member_id', id)`

#### `LoyaltyService` (Ledger)
- [ ] `add_transaction`: `supabase.table('loyalty_ledger').insert(data)`
- [ ] `get_balance`: Calculate via query or use a Database Function (RPC) in Supabase for performance.

## Phase 5: Route & Controller Updates

### 5.1 Remove SQLAlchemy Dependencies
- [ ] Go through all files in `backend/routes/`.
- [ ] Remove `db: Session = Depends(get_db)`.
- [ ] Remove `database.py` imports.

### 5.2 Update Route Logic
- [ ] Ensure routes pass the necessary data to the refactored services.
- [ ] Handle Supabase API errors (which differ from SQLAlchemy errors).

## Phase 6: Cleanup

### 6.1 Remove Legacy Code
- [ ] Delete `backend/database.py`.
- [ ] Delete `backend/models/` (or keep them as Pydantic schemas if they are used for validation, but remove SQLAlchemy inheritance).
- [ ] Remove `sqlalchemy` and `psycopg2` from `requirements.txt`.

## Phase 7: Frontend Integration (Future)
- [ ] When building the frontend, initialize the Supabase JS Client.
- [ ] Use Supabase Auth UI or SDK directly in React for login.
- [ ] Pass the `access_token` to the FastAPI backend for protected endpoints.
