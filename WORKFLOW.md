# Development Workflow — POS Adeq

## Branch Strategy

`main` is always stable and production-ready. All work happens on feature/fix branches.

### Branch Naming
- `feature/<short-description>` — new functionality
- `fix/<short-description>` — bug fixes

Examples:
- `feature/receipt-print`
- `feature/staff-report-page`
- `fix/cart-calculation-bug`

## Workflow Steps

1. **Start a branch** before any new feature or fix
   ```bash
   git checkout -b feature/<name>
   ```

2. **Dev + test locally** at http://localhost:3000
   - Run `npm run dev` if not already running
   - Test on mobile view (DevTools → Ctrl+Shift+M)

3. **Commit** when feature is complete and tested
   ```bash
   git add <files>
   git commit -m "descriptive message"
   ```

4. **Push branch** to GitHub
   ```bash
   git push origin feature/<name>
   ```

5. **Open PR** — user verifies before merge to main
   ```bash
   gh pr create --title "..." --body "..."
   ```

6. **Wait for user approval** — do NOT merge without confirmation

7. **After merge** — switch back to main and pull
   ```bash
   git checkout main && git pull
   ```

## Rules
- Never commit directly to `main`
- Always reference what was tested in PR description
- One feature per branch — keep PRs focused
