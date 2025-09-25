# Branching Strategy

We will follow a **Git Flow–inspired lightweight strategy** to keep the workflow clean but not overly complex.

---

## Main Branches

- **`main`**
  - Always stable, production-ready code.
  - Only receives merges from `develop` after testing.

- **`develop`**
  - Active development branch.
  - Base branch for feature branches.
  - Regularly integrated and tested.

---

## Supporting Branches

### Feature Branches
- Naming convention: `feature/<short-name>`
- Purpose: Used for new features or enhancements.
- Branched from: `develop`
- Merged back into: `develop` via Merge Request (MR).
- Example: `feature/user-auth`

### Bugfix Branches
- Naming convention: `bugfix/<short-name>`
- Purpose: Used for urgent fixes during development.
- Branched from: `develop`
- Merged back into: `develop`
- Example: `bugfix/login-crash`

### Hotfix Branches
- Naming convention: `hotfix/<short-name>`
- Purpose: Used to quickly patch production (`main`).
- Branched from: `main`
- Merged back into: `main` and `develop`
- Example: `hotfix/payment-error`

### Release Branches
- Naming convention: `release/<version>`
- Purpose: Used to prepare a production release.
- Branched from: `develop`
- Merged into: `main` (for release) and `develop` (to sync updates).
- Example: `release/1.0.0`

---

## Workflow Summary

1. Start new work on a `feature/` branch from `develop`.
2. Commit and push changes to the feature branch.
3. Open a Merge Request into `develop`.
4. After testing/integration, `develop` is merged into `main` during a release cycle.
5. Critical production issues use `hotfix/` branches directly off `main`.

---