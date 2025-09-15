# Contributing to [Project Name]

Thank you for your interest in contributing! 🎉  
We welcome all kinds of contributions—bug reports, feature requests, documentation improvements, and code changes.

---

## 📋 How to Contribute

### Reporting Issues
- Use the **Issues tab** to report bugs or suggest features.
- Provide clear steps to reproduce the issue (if a bug).
- Add screenshots or logs if helpful.

### Proposing Changes
- For larger changes, please **open an issue** first to discuss.
- For small fixes (typos, docs, minor bugs), you can open a merge request directly.

---

## 🔀 Branching Strategy
- The `main` branch is **stable** and always deployable.  
- Create feature branches from `main`:  
  ```bash
  git checkout -b feature/my-feature
Use these prefixes:

feature/ → new functionality

bugfix/ → bug fixes

hotfix/ → urgent fixes on main

release/ -> release candidates

✅ Commit Guidelines
Use clear, descriptive messages.

Follow Conventional Commits:

feat: new feature

fix: bug fix

docs: documentation changes

test: adding or updating tests

chore: maintenance or tooling

Example:

text
Copy code
feat(auth): add login with OAuth
📥 Merge Requests
Keep merge requests small and focused.

Reference related issue(s) (e.g., Closes #42).

Update documentation and add tests where needed.

Ensure your branch is up to date with main before opening a merge request.

Steps to submit a contribution:

Fork the repository.

Create your branch:

bash
Copy code
git checkout -b feature/my-feature
Commit your changes following the guidelines.

Push to your fork:

bash
Copy code
git push origin feature/my-feature
Open a Merge Request.

🔍 Review Process
At least one reviewer must approve before merging.

Be responsive to feedback and make changes as requested.

Squash commits if needed to keep history clean.

🧑‍💻 Coding Guidelines
Follow the project’s code style and linting rules.

Keep functions small and focused.

Add comments for complex or non-obvious logic.

Write or update tests when changing functionality.

✅ Testing
Run all tests locally before pushing changes.

Ensure new code includes test coverage.

Tests should be reliable and easy to reproduce.

📜 License
By contributing, you agree that your contributions will be licensed under the same license as the project (LICENSE).