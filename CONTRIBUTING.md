# Contributing Guide – VT Student Eats

Welcome to **VT Student Eats** 👋  
This guide explains exactly how our team (Gargantua Gang) works on the project codebase.

The rules below apply to **both repositories**:
- [`vt-student-eats-fe`](https://github.com/marianalu1za/vt-student-eats-fe) – Frontend (React)
- [`vt-student-eats-be`](https://github.com/marianalu1za/vt-student-eats-be) – Backend (Django)

---

## 🧭 Workflow Overview

We use a **feature-branch workflow** with **Pull Requests (PRs)** and required code reviews.  
You should **never commit directly to `main`**.

### Branch naming convention

Branches should describe the work being done using this format:

`<type>/<short-but-clear-description>`

**Examples:**
- `feature/add-restaurant-filter`
- `fix/login-error-handling`
- `docs/update-readme`
- `chore/upgrade-dependencies`
- `dev/experimental-feature`

**Allowed types:**
| Type | Purpose |
|------|----------|
| `feature/` | New feature or functionality |
| `fix/` | Bug fix |
| `docs/` | Documentation only |
| `chore/` | Maintenance or configuration (e.g., CI updates) |
| `test/` | New or updated tests |
| `dev/` | Work-in-progress by individual developer (experimental, not ready for review) |

> "Short" means **5–7 words max**, using lowercase and hyphens to separate words.

---

## 📝 Commit Messages

Write clear, descriptive commit messages:
- Use present tense ("Add feature" not "Added feature")
- Keep the first line under 50 characters
- Add more details in the body if needed

**Examples:**
- `fix: resolve login authentication error`
- `feature: add restaurant filter by cuisine type`
- `docs: update README with setup instructions`

---

## 🔄 Pull Request Process

1. **Create a branch** from `main` using the naming convention above
2. **Make your changes** and commit them with clear messages
3. **Push your branch** to the remote repository
4. **Create a Pull Request** with:
   - Clear title describing the changes
   - Description of what was changed and why
   - Reference any related issues
5. **Wait for code review** - address any feedback
6. **Once approved**, merge the PR

---

## ✅ Before Submitting

- Ensure your code follows React best practices
- Test your changes in the browser
- Verify the app builds successfully: `npm run build`
- Check that API calls work correctly
- Ensure responsive design works on mobile and desktop

---

## 🧪 Testing

- Test your changes manually in the browser
- Verify all user flows work as expected
- Check for console errors
- Test on different screen sizes

---

## 📚 Code Style

- Use functional components with hooks
- Follow React naming conventions (PascalCase for components)
- Keep components focused and reusable
- Use meaningful variable and function names
- Add comments for complex logic
