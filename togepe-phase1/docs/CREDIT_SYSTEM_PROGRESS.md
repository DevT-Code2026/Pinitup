# Credit System Progress

## Phase 1 — Wallet Foundation ✅

| Component | Status | Location |
|---|---|---|
| User credits field | Done | `server/models/User.js:16` |
| CreditTransaction model | Done | `server/models/CreditTransaction.js` |
| CreditService | Done | `server/services/creditService.js` |
| Wallet API | Done | `GET /api/wallet` |
| Transaction History API | Done | `GET /api/wallet/transactions` |
| Transaction Types | Done | `server/utils/transactionTypes.js` |
| Wallet Routes | Done | `server/routes/walletRoutes.js` |

---

## Phase 2 — Authentication Integration ✅

| Component | Status | Location |
|---|---|---|
| Email signup bonus | Done | `server/controllers/authController.js:40-45` |
| Google OAuth signup bonus | Done | `server/config/passport.js:67-72` |
| Duplicate signup prevention | Done | `authController.js:23-26`, `passport.js:29-52` |
| Single CreditService integration | Done | Both flows call `CreditService.awardSignupBonus` |

---

## Phase 3 — Workflow Pricing 🚧

Not started.

Planned tasks:

- Define credit cost per workflow generation
- Integrate `CreditService.deductCredits` into workflow generation flow
- Add `WORKFLOW_GENERATION` transaction recording
- Implement balance check before workflow execution
- Return meaningful error when credits are insufficient

---

## Phase 4 — Credit Spending 🚧

Not started.

Planned tasks:

- Define pricing tiers for premium features
- Add spending endpoints
- Integrate with workflow pricing from Phase 3
- Add admin credit adjustment capability via `ADMIN_ADJUSTMENT` type

---

## Phase 5 — Refunds 🚧

Not started.

Planned tasks:

- Define refund eligibility rules
- Implement refund workflow using `REFUND` transaction type
- Add balance restoration logic
- Add admin refund controls

---

## Phase 6 — Payments 🚧

Not started.

Planned tasks:

- Payment gateway integration (Stripe or equivalent)
- Credit pack purchasing via `PURCHASE` transaction type
- Promo code system via `PROMOTION` transaction type
- Invoice and receipt generation

---

## Architecture

### Current Models

**User** (`server/models/User.js`)

- `credits: Number` — current balance, default 0, minimum 0
- All other fields unchanged from pre-credit system

**CreditTransaction** (`server/models/CreditTransaction.js`)

- `user: ObjectId` — references User
- `type: String` — enum validated against TransactionTypes
- `amount: Number` — positive for additions, negative for deductions
- `balanceBefore: Number` — balance before this transaction
- `balanceAfter: Number` — balance after this transaction
- `reference: String` — optional, unique when present (sparse index)
- `description: String` — human-readable label
- `metadata: Mixed` — arbitrary key-value data
- Indexed on `{ user: 1, createdAt: -1 }` for fast history queries

### Current Services

**CreditService** (`server/services/creditService.js`)

| Method | Purpose |
|---|---|
| `addCredits(userId, amount, type, options)` | Add credits and record transaction |
| `deductCredits(userId, amount, type, options)` | Deduct credits, rejects if insufficient |
| `getWallet(userId)` | Return current balance |
| `getTransactions(userId, options)` | Paginated transaction history |
| `awardSignupBonus(userId)` | Award 20-credit signup bonus |

### Current APIs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/wallet` | Protected | Current credit balance |
| GET | `/api/wallet/transactions?page=1&limit=20` | Protected | Paginated transaction history |

### Authentication Flow

**Email Registration**

```
POST /api/auth/register
    ↓
Validate input
    ↓
Check existing user → 409 if exists
    ↓
Create User (provider: "local")
    ↓
CreditService.awardSignupBonus()
  └─ On failure → delete user, return 500
    ↓
Generate JWT
    ↓
Return token + user object
```

**Google OAuth**

```
GET /api/auth/google → Google consent screen
    ↓
GET /api/auth/google/callback
    ↓
Passport strategy executes:
    ↓
Case 1: User exists with googleId → login, no bonus
Case 2: User exists with matching email → link Google ID, no bonus
Case 3: Brand-new user → create user
    ↓
  CreditService.awardSignupBonus()
    └─ On failure → delete user, propagate error
    ↓
Return JWT to client
```

---

## Implementation Notes

These are architectural rules that must be followed in all future phases.

1. **Only CreditService may modify `user.credits`.** No controller, route, or other service touches the credits field directly.

2. **Every balance change creates a CreditTransaction.** No silent or undocumented credit modifications.

3. **Signup bonus is awarded exactly once.** The three auth paths (existing Google user, link local account, new user) are mutually exclusive. Only the new-user path calls `awardSignupBonus`.

4. **Wallet APIs are protected.** Both `/api/wallet` and `/api/wallet/transactions` require a valid JWT via the `protect` middleware.

5. **Transaction history is paginated.** Defaults to page 1, 20 results per page. Both `page` and `limit` are configurable via query params.

6. **Balance cannot become negative.** `CreditService.deductCredits` checks `user.credits < amount` and throws before modifying anything.

7. **Bonus failure rolls back the user.** If `awardSignupBonus` fails during registration, the newly created User document is deleted to prevent orphaned accounts with no credits.

8. **Transaction reference is optional but unique.** When provided, it prevents duplicate transactions for the same operation (sparse unique index).

---

## Current Project Status

### Implemented

- Credit balance on User model
- Full credit transaction ledger with balance snapshots
- CreditService as single authority for all credit mutations
- Wallet balance and history APIs (protected, paginated)
- Signup bonus (20 credits) on both email and Google registration
- Duplicate signup prevention across all auth paths
- Six transaction types defined and ready for future phases

### Pending

- Workflow pricing and deduction
- Premium feature spending
- Refund system
- Payment gateway integration
- Admin credit management UI
- Client-side wallet components
- Credit balance display in navbar or dashboard

---

## Future Roadmap

```
Phase 1: Wallet Foundation              ✅ Complete
    ↓
Phase 2: Authentication Integration     ✅ Complete
    ↓
Phase 3: Workflow Pricing               🚧 Next
    ↓
Phase 4: Credit Spending                🚧 Planned
    ↓
Phase 5: Refund System                  🚧 Planned
    ↓
Phase 6: Payment Integration            🚧 Planned
```

Each phase builds on the previous one. Phase 3 requires no new models or services — it consumes the existing `CreditService.deductCredits` method. Phases 4–6 introduce new transaction types and external integrations but follow the same CreditService-first architecture.
