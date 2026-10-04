# Contributing to Django Virtual Lab

Thank you for your interest in contributing to the **Django Virtual Lab** project! We welcome contributions from educators, students, and open-source developers to help make interactive web development education accessible and engaging.

---

## Code of Conduct

Please be respectful, collaborative, and considerate of others when interacting in discussions, issues, and pull requests.

---

## How to Contribute

### 1. Reporting Bugs
- Search existing [Issues](https://github.com/Phaze19/django-virtual-lab/issues) to avoid duplicates.
- If not reported, open a new issue using the **Bug Report** template.
- Provide clear steps to reproduce, expected results, and environment details.

### 2. Suggesting Enhancements
- Open an issue using the **Feature Request** template.
- Describe the educational objective, target experiment, or UI improvement clearly.

### 3. Pull Requests
1. **Fork** the repository and create your feature branch:
   ```bash
   git checkout -b feature/awesome-experiment
   ```
2. **Set up local development environment**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   python manage.py migrate
   ```
3. **Write and run tests**:
   Ensure all existing and new tests pass:
   ```bash
   python manage.py test
   ```
4. **Commit with clear commit messages**:
   Follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`).
5. **Push and open a Pull Request** describing your changes.

---

## Coding Standards

- **Python**: Follow PEP 8 guidelines. Write clean, readable code with explicit type annotations where appropriate.
- **HTML & CSS**: Semantic HTML5 tags, standard CSS variables for color palettes, clean modular stylesheets.
- **JavaScript**: Vanilla ES6+ without unnecessary external bloat, structured into modular functions.
- **Security**: Do not commit secrets, database dumps (`db.sqlite3`), or virtual environments (`.venv`).
