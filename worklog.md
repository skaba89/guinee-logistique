# Worklog — Guinée Logistique Rename & Bug Fixes

**Date:** 2026-03-05
**Task ID:** 1
**Scope:** Rename LogisWay → Guinée Logistique + Fix 4 bugs with non-functional interactive elements

---

## Task 1: Rename "LogisWay" → "Guinée Logistique" across all files

### Replacements Made

| Pattern | Replacement | Files Affected |
|---------|-------------|----------------|
| `logisway.pro` | `guinee-logistique.pro` | chatbot-widget, users-page, reports-page, tracking-page, hr-page, login-page, drivers-page, settings-page, parcels-page, test-data |
| `freightflow-storage` | `guinee-logistique-storage` | cargo-store.ts |
| `LOGISWAY` | `GUINÉE LOGISTIQUE` | login-page.tsx |
| `FlowBot` | `GL Bot` | chatbot-widget.tsx, dashboard-layout.tsx |
| `Navigation LogisWay` | `Navigation Guinée Logistique` | dashboard-layout.tsx |
| `LogisWay` | `Guinée Logistique` | 30+ component and lib files |
| `logisway-` prefixed localStorage keys | `guinee-logistique-` prefix | All lib files with localStorage keys |
| `logisway-*` file download names | `guinee-logistique-*` prefix | All component files with download exports |

### Specific localStorage Key Replacements
- `logisway-salt-2026` → `guinee-logistique-salt-2026`
- `logisway-pin-hash-` → `guinee-logistique-pin-hash-`
- `logisway-pin-session` → `guinee-logistique-pin-session`
- `logisway-pin-hash` → `guinee-logistique-pin-hash`
- `logisway-chatbot-history` → `guinee-logistique-chatbot-history`
- `logisway-chatbot-open` → `guinee-logistique-chatbot-open`
- `logisway-sidebar-collapse` → `guinee-logistique-sidebar-collapse`
- `logisway-printers` → `guinee-logistique-printers`
- `logisway-default-printer` → `guinee-logistique-default-printer`
- `logisway-label-settings` → `guinee-logistique-label-settings`
- `logisway-audit-trail` → `guinee-logistique-audit-trail`
- `logisway-delegations` → `guinee-logistique-delegations`
- `logisway-batch-jobs` → `guinee-logistique-batch-jobs`
- `logisway-print-history` → `guinee-logistique-print-history`
- `logisway-printer-groups` → `guinee-logistique-printer-groups`
- `logisway-label-templates` → `guinee-logistique-label-templates`
- `logisway-proof-photos` → `guinee-logistique-proof-photos`
- `logisway-business-rules-config` → `guinee-logistique-business-rules-config`
- `logisway-reminder-config` → `guinee-logistique-reminder-config`
- `logisway-reminders` → `guinee-logistique-reminders`
- `logisway-validation-sessions` → `guinee-logistique-validation-sessions`
- `logisway-notifications` → `guinee-logistique-notifications`
- `logisway-notification-prefs` → `guinee-logistique-notification-prefs`
- `logisway-approvals` → `guinee-logistique-approvals`
- `logisway-permissions-config` → `guinee-logistique-permissions-config`
- `logisway-messages` → `guinee-logistique-messages`
- `logisway-conversations` → `guinee-logistique-conversations`
- `logisway-storage` → `guinee-logistique-storage`

### File Download Name Replacements
- `logisway-shipments` → `guinee-logistique-shipments`
- `logisway-customer-portal` → `guinee-logistique-customer-portal`
- `logisway-hr` → `guinee-logistique-hr`
- `logisway-expenses` → `guinee-logistique-expenses`
- `logisway-factures` → `guinee-logistique-factures`
- `logisway-dashboard` → `guinee-logistique-dashboard`
- `logisway-claims` → `guinee-logistique-claims`
- `logisway-temperature` → `guinee-logistique-temperature`
- `logisway-documents` → `guinee-logistique-documents`
- `logisway-insurance` → `guinee-logistique-insurance`
- `logisway-quotations` → `guinee-logistique-quotations`
- `logisway-analytique` → `guinee-logistique-analytique`
- `logisway-colis` → `guinee-logistique-colis`
- `logisway-devis` → `guinee-logistique-devis`
- `logisway-expeditions` → `guinee-logistique-expeditions`

### Verification
- Ran `grep -i logisway` on `/home/z/my-project/src/` — **0 results**. All references removed.

---

## Task 2: Bug Fixes

### Bug 1: Expenses Page — Three dots menu (⋮) hidden on mobile

**Root Cause:** The "Actions" column header and data cells had `hidden md:table-cell` class, making the dropdown menu invisible on screens smaller than 768px.

**Fix:** Removed `hidden md:table-cell` from both the `<th>` header and `<td>` data cells in the Actions column.

**File:** `src/components/cargo/expenses-page.tsx`

---

### Bug 2: HR Page — Recruitment detail dialog doesn't update jobOpenings state

**Root Cause:** The `jobOpenings` array was a const (not state), so clicking "Démarrer le recrutement", "Fermer le poste", or "Réouvrir le poste" only updated `selectedJob` state — the visual cards and KPIs never reflected the change.

**Fix:**
1. Added `const [jobOpeningsList, setJobOpeningsList] = useState<JobOpening[]>(jobOpenings);`
2. Replaced all references to `jobOpenings` (for rendering and KPIs) with `jobOpeningsList`
3. Updated dialog button handlers to also call `setJobOpeningsList()` with the updated job

**File:** `src/components/cargo/hr-page.tsx`

---

### Bug 3: Contracts Page — "Modifier" button only closes dialog

**Root Cause:** The "Modifier" button's `onClick` handler was `() => setShowDetailDialog(false)`, which simply closed the dialog without enabling any edit functionality.

**Fix:**
1. Added `isEditing` state and `editForm` state for editable fields
2. When "Modifier" is clicked, populate `editForm` with current contract values and set `isEditing` to true
3. Show editable input/textarea fields when `isEditing` is true (terms, paymentTerms, slaDeliveryDays, slaDamageLimit, penaltyClause, specialConditions)
4. Added "Sauvegarder" button that saves changes to both `selectedContract` and `data` state arrays, with toast notification
5. Added "Annuler" button to cancel editing
6. Reset `isEditing` when dialog closes

**File:** `src/components/cargo/contracts-page.tsx`

---

### Bug 4: Customer Portal — Documents section needs better visibility

**Root Cause:** The documents table was buried at the bottom of the "Suivi" tab, making it hard to find.

**Fix:**
1. Changed TabsList from `grid-cols-4` to `grid-cols-5`
2. Added a new "Documents" tab trigger with Paperclip icon
3. Moved documents from a table at the bottom of "Suivi" to a dedicated "Documents" tab
4. Redesigned documents as card-based layout (responsive grid of 1/2/3 columns) with better visual hierarchy
5. Each document card shows: icon, name, type badge, shipment ref, date, size, and Voir/Télécharger buttons

**File:** `src/components/cargo/customer-portal-page.tsx`

---

## Summary of All Changes

| File | Change | Description |
|------|--------|-------------|
| 30+ component files | Rename LogisWay → Guinée Logistique | Display names, URLs, emails |
| 15+ lib files | Rename localStorage keys & storage | All logisway- prefixed keys |
| `expenses-page.tsx` | Remove `hidden md:table-cell` from Actions column | Bug 1 fix |
| `hr-page.tsx` | Add `jobOpeningsList` state + update handlers | Bug 2 fix |
| `contracts-page.tsx` | Add edit mode with `isEditing` state + editable fields | Bug 3 fix |
| `customer-portal-page.tsx` | Add Documents tab + card layout | Bug 4 fix |
