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

## Phase 3 — Workflow Pricing ✅

| Component | Status | Location |
|---|---|---|
| Workflow model (creditCost) | Done | `server/models/Workflow.js` |
| WorkflowService | Done | `server/services/workflowService.js` |
| Workflow CRUD (admin) | Done | `server/routes/adminWorkflowRoutes.js` |
| Public workflow listing | Done | `server/routes/workflowRoutes.js` |
| Seed script (5 workflows) | Done | `server/seedWorkflows.js` |

---

## Phase 4 — Workflow Execution + Credit Deduction ✅

| Component | Status | Location |
|---|---|---|
| WorkflowExecutionService | Done | `server/services/workflowExecutionService.js` |
| Execute endpoint | Done | `POST /api/workflows/:slug/execute` (protected) |
| Execute controller | Done | `server/controllers/workflowController.js` — `executeWorkflow` |
| Execute route | Done | `server/routes/workflowRoutes.js` |
| Client API function | Done | `client/src/services/api.js` — `executeWorkflow` |
| Generate button UI | Done | `client/src/pages/Workflows.jsx` |
| Execution status UI | Done | Success, error, insufficient credits states |
| CSS styles | Done | `client/src/pages/Workflows.css` |

### Execution Flow

```
POST /api/workflows/:slug/execute
    ↓
authenticateUser (protect middleware)
    ↓
WorkflowExecutionService.execute(userId, slug)
    ↓
1. Load workflow by slug → 404 if not found
2. Validate status === "active" → 403 if inactive
3. Check user.credits >= workflow.creditCost → 400 if insufficient
4. CreditService.deductCredits() → WORKFLOW_GENERATION transaction
5. executeMock(workflow, input) → mock output
6. On execution failure → CreditService.addCredits() rollback
    ↓
Return { success, workflow, creditsSpent, reference, output, wallet }
```

### Credit Deduction Flow

```
WorkflowExecutionService.execute()
    ↓
User.findById(userId).select("credits")
    ↓
user.credits >= workflow.creditCost ?
    ├── NO  → throw Error("Insufficient credits", { statusCode: 400 })
    └── YES ↓
CreditService.deductCredits(userId, cost, WORKFLOW_GENERATION, {
    reference: `execution_<uuid>`,
    description: workflow.name,
    metadata: { workflowId, workflowSlug }
})
    ↓
User.credits -= cost
CreditTransaction.create({ amount: -cost, balanceBefore, balanceAfter })
    ↓
executeMock(workflow, input)
    ├── Success → return result
    └── Failure → CreditService.addCredits() rollback (refund_<uuid>)
```

### Error Handling

| Scenario | HTTP Status | Message |
|---|---|---|
| Workflow not found | 404 | "Workflow not found" |
| Workflow inactive | 403 | "Workflow is not active" |
| Insufficient credits | 400 | "Insufficient credits" (with `currentCredits`, `requiredCredits`) |
| Execution failure | 500 | "Workflow execution failed" (wallet rolled back) |
| User not found | 404 | "User not found" |

### Frontend Integration

- **Authenticated users:** See "Generate" button on each workflow card
- **Unauthenticated users:** See "Log in to use this workflow" hint
- **Insufficient credits:** Warning with current balance and required amount
- **Executing:** Spinner animation, button disabled
- **Success:** Green checkmark with output message, wallet refreshes
- **Error:** Red alert with error message
- **Wallet refresh:** `AuthContext.refreshWallet()` called after every successful execution

### Future AI Provider Integration

The `executeMock()` function in `workflowExecutionService.js` is the single swap point.
To integrate Gemini/OpenAI/Claude:

1. Add provider-specific service files under `server/services/providers/`
2. Replace `executeMock` with a router that delegates based on `workflow.provider`
3. No changes needed to controller, route, or credit logic
4. Mock fallback preserved for development/testing

---

## Phase 5 — Execution Reliability, History & Transaction Safety ✅

| Component | Status | Location |
|---|---|---|
| WorkflowExecution model | Done | `server/models/WorkflowExecution.js` |
| Execution lifecycle (queued→running→completed/failed→refunded) | Done | `server/services/workflowExecutionService.js` |
| Idempotency (executionReference unique) | Done | `server/models/WorkflowExecution.js` + service check |
| Double-click guard (409 if running) | Done | `server/services/workflowExecutionService.js` |
| Refund reliability (auto-refund on failure) | Done | Service marks execution as `refunded` |
| Execution history API | Done | `GET /api/executions`, `GET /api/executions/:id` |
| Execution history routes | Done | `server/routes/executionRoutes.js` |
| Execution history page | Done | `client/src/pages/ExecutionHistory.jsx` + CSS |
| Execution detail modal | Done | `client/src/components/ExecutionDetailModal.jsx` + CSS |
| Updated Generate button states | Done | `client/src/pages/Workflows.jsx` |
| Refund toast notification | Done | Toast on refunded execution |
| Wallet description improvement | Done | `client/src/pages/Wallet.jsx` |
| Sidebar nav link | Done | `client/src/components/layout/Sidebar.jsx` |
| App.jsx route | Done | `/executions` (ProtectedRoute) |

### Execution Lifecycle

```
POST /api/workflows/:slug/execute
    ↓
1. Load workflow → 404 if not found
2. Validate active → 403 if inactive
3. Check credits → 400 if insufficient
4. Double-click guard → 409 if same workflow running
5. Create WorkflowExecution (status: queued)
    ↓
6. Mark execution running (status: running, startedAt)
7. CreditService.deductCredits()
8. executeMock(workflow, input)
    ├── Success → status: completed, output saved
    └── Failure → CreditService.addCredits() refund
                   status: refunded, refundReference saved
    ↓
Return { wallet, execution, refunded }
```

### Idempotency

- `executionReference` is unique (`execution_<uuid>`)
- If the same reference already exists, the existing execution is returned
- No duplicate credit deductions

### Double-Click Protection

- Before creating a new execution, checks for any `queued` or `running` execution for the same user + workflow
- Returns 409 "Workflow is already running" if found

### Refund Flow

```
Execution failure (mock throws)
    ↓
CreditService.addCredits(userId, cost, WORKFLOW_GENERATION, {
    reference: `refund_<uuid>`,
    description: `Refund: ${workflow.name} (execution failed)`,
    metadata: { executionId, originalTransactionId }
})
    ↓
WorkflowExecution.update({
    status: "refunded",
    refunded: true,
    refundReference: refundRef,
    completedAt: now,
    error: execError.message
})
    ↓
Return { wallet, execution, refunded: true, refundCredits }
    ↓
Frontend shows toast: "Execution failed. X credits were automatically refunded."
```

### Error Handling

| Scenario | HTTP Status | Message |
|---|---|---|
| Workflow not found | 404 | "Workflow not found" |
| Workflow inactive | 403 | "Workflow is not active" |
| Insufficient credits | 400 | "Insufficient credits" (with `currentCredits`, `requiredCredits`) |
| Already running | 409 | "Workflow is already running" |
| Execution failure | 200 | Success with `refunded: true` + refund info |
| User not found | 404 | "User not found" |

### Frontend Integration

- **Generate button:** Shows "Generating..." with spinner while running
- **Completed:** Shows "Completed" with green checkmark, button resets to "Generate"
- **Refund toast:** Red toast with refund credit amount, wallet auto-refreshes
- **Execution History page:** Paginated list with status badges, provider icons, credit cost, duration
- **Execution Detail modal:** Full details including references, input, output, error

### Future AI Provider Integration

The `executeMock()` function in `workflowExecutionService.js` is the single swap point.
To integrate Gemini/OpenAI/Claude:

1. Add provider-specific service files under `server/services/providers/`
2. Replace `executeMock` with a router that delegates based on `workflow.provider`
3. No changes needed to controller, route, or credit logic
4. Mock fallback preserved for development/testing

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
- `reference: String` — optional, unique when present (partial index on string type)
- `description: String` — human-readable label
- `metadata: Mixed` — arbitrary key-value data
- Indexed on `{ user: 1, createdAt: -1 }` for fast history queries
- Indexed on `{ reference: 1 }` with `partialFilterExpression: { reference: { $type: "string" } }`

**WorkflowExecution** (`server/models/WorkflowExecution.js`)

- `user: ObjectId` — references User
- `workflow: ObjectId` — references Workflow
- `workflowName: String` — denormalized for display
- `slug: String` — denormalized for queries
- `provider: String` — gemini/openai/claude
- `creditsSpent: Number` — credit cost at execution time
- `executionReference: String` — unique, `execution_<uuid>`
- `status: String` — enum: queued, running, completed, failed, refunded
- `input: Mixed` — user-provided input
- `output: Mixed` — execution result
- `error: String` — error message on failure
- `startedAt: Date` — when execution started
- `completedAt: Date` — when execution finished
- `refunded: Boolean` — whether credits were refunded
- `refundReference: String` — `refund_<uuid>` if refunded
- Indexed on `{ user: 1, createdAt: -1 }` for history queries
- Indexed on `{ user: 1, slug: 1, status: 1 }` for double-click guard

### Current Services

**CreditService** (`server/services/creditService.js`)

| Method | Purpose |
|---|---|
| `addCredits(userId, amount, type, options)` | Add credits and record transaction |
| `deductCredits(userId, amount, type, options)` | Deduct credits, rejects if insufficient |
| `getWallet(userId)` | Return current balance |
| `getTransactions(userId, options)` | Paginated transaction history |
| `awardSignupBonus(userId)` | Award 20-credit signup bonus |

**WorkflowExecutionService** (`server/services/workflowExecutionService.js`)

| Method | Purpose |
|---|---|
| `execute(userId, slug, input)` | Full lifecycle: validate → check → guard → deduct → execute → record |
| `getHistory(userId, options)` | Paginated execution history, newest first |
| `getById(executionId, userId, userRole)` | Single execution detail (owner or admin) |
| `isRunning(userId, slug)` | Check if workflow is currently running for user |

### Current APIs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/wallet` | Protected | Current credit balance |
| GET | `/api/wallet/transactions?page=1&limit=20` | Protected | Paginated transaction history |
| POST | `/api/workflows/:slug/execute` | Protected | Execute workflow with full lifecycle |
| GET | `/api/executions?page=1&limit=20` | Protected | Paginated execution history |
| GET | `/api/executions/:id` | Protected | Execution detail (owner or admin) |

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

8. **Transaction reference is optional but unique.** When provided, it prevents duplicate transactions for the same operation (partial unique index on string type).

9. **Execution failure rolls back credits.** If the AI provider (or mock) throws, `WorkflowExecutionService` calls `CreditService.addCredits` with a `refund_<uuid>` reference to restore the wallet.

10. **Every execution has a unique reference.** Uses `execution_<crypto.randomUUID()` for idempotent transactions.

11. **Double-click protection prevents spam.** If a user has a running execution for the same workflow, a 409 is returned.

12. **Execution history is immutable audit trail.** Every execution is recorded regardless of outcome (success, failure, refund).

13. **Execution failure returns 200 with refunded flag.** The execution was attempted, credits were deducted and refunded — this is a successful resolution, not a server error.

---

## CreditTransaction Reference Index Bug — Postmortem

### Root Cause

The `reference` field on `CreditTransaction` had `unique: true, sparse: true` at the schema level. MongoDB's `sparse` flag only excludes documents where the field is entirely absent (`undefined`). A `null` value IS a value, IS indexed, and `unique` then rejects multiple `null`s. When an admin user was deleted and re-created via Google OAuth, `CreditService.awardSignupBonus` tried to create a second CreditTransaction with `reference: null`, triggering `E11000 duplicate key error`.

### Why It Happened

The `sparse: true` option was intended to allow multiple documents without a reference, but MongoDB's implementation of `sparse` treats `null` differently from `undefined`. The schema field `reference: { type: String }` stores missing values as `null` in MongoDB, not `undefined`, so `sparse` did not exclude them from the unique constraint.

### Fix Applied

Replaced the schema-level `unique: true, sparse: true` with an explicit index using `partialFilterExpression`:

```js
creditTransactionSchema.index({ reference: 1 }, {
  unique: true,
  partialFilterExpression: { reference: { $type: "string" } },
});
```

This enforces uniqueness only on actual string references, allowing unlimited `null`/`undefined` values.

### Lessons Learned

1. `sparse: true` on a unique index does NOT exclude `null` values in MongoDB — only `undefined` (field absent)
2. Use `partialFilterExpression` with `$type: "string"` when you want unique-on-value but not unique-on-null
3. Always test unique indexes with explicit `null` inserts, not just missing fields
4. Schema-level `unique` and explicit `index({ ... }, { unique: true })` both create indexes — check for duplicates

---

## Current Project Status

### Implemented

- Credit balance on User model
- Full credit transaction ledger with balance snapshots
- CreditService as single authority for all credit mutations
- Wallet balance and history APIs (protected, paginated)
- Signup bonus (20 credits) on both email and Google registration
- Duplicate signup prevention across all auth paths
- Workflow execution with full lifecycle (queued→running→completed/failed→refunded)
- Idempotent execution via unique executionReference
- Double-click protection (409 if workflow already running)
- Automatic refund on execution failure with audit trail
- Insufficient credits validation (400 response + UI warning)
- Execution history model and APIs
- Frontend execution history page with status badges, pagination
- Frontend execution detail modal with references, input, output, error
- Frontend Generate button with Generating/Completed/Generate states
- Frontend refund toast notification
- Wallet transaction descriptions improved (workflow name instead of generic type)
- Six transaction types defined (`WORKFLOW_GENERATION` actively used for both deductions and refunds)

### Pending

- Real AI provider integration (Gemini/OpenAI/Claude)
- Payment gateway integration
- Admin credit management UI

---

## Future Roadmap

```
Phase 1: Wallet Foundation              ✅ Complete
    ↓
Phase 2: Authentication Integration     ✅ Complete
    ↓
Phase 3: Workflow Pricing               ✅ Complete
    ↓
Phase 4: Workflow Execution + Credits   ✅ Complete
    ↓
Phase 5: Execution Reliability + History ✅ Complete
    ↓
Phase 6: Payment Integration            🚧 Next
```

Phase 5 introduced `WorkflowExecution` model as an immutable audit trail and added full lifecycle management to `WorkflowExecutionService`. Every execution is recorded regardless of outcome. The mock execution remains isolated in `executeMock()` — swapping in a real AI provider requires only replacing that function.
