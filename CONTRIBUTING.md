# Contributing Guide – VT Student Eats

Welcome to **VT Student Eats** 👋  
This guide explains exactly how our team (Gargantua Gang) works on the project codebase.

The rules below apply to **both repositories**:
- [`vt-student-eats-fe`](https://github.com/your-org/vt-student-eats-fe) – Frontend (React)
- [`vt-student-eats-be`](https://github.com/your-org/vt-student-eats-be) – Backend (Django)

---

## 🧭 Workflow Overview
We use a **feature-branch workflow** with **Pull Requests (PRs)** and required code reviews.  
You should **never commit directly to `main`**.

### Branch naming convention
Branches should describe the work being done using this format:

<type>/<short-but-clear-description>


**Examples:**
- `feature/add-restaurant-filter`
- `fix/login-error-handling`
- `docs/update-readme`
- `chore/upgrade-dependencies`

**Allowed types:**
| Type | Purpose |
|------|----------|
| `feature/` | New feature or functionality |
| `fix/` | Bug fix |
| `docs/` | Documentation only |
| `chore/` | Maintenance or configuration (e.g., CI updates) |
| `test/` | New or updated tests |

> “Short” means **5–7 words max**, using lowercase and hyphens to separate words.


