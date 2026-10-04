<div align="center">

# KJ Somaiya School of Engineering
### Department of Information Technology & Computer Engineering
## Django Virtual Lab: Interactive Template Engine Workbench

[![Python Version](https://img.shields.io/badge/python-3.11%20%7C%203.12%20%7C%203.13-blue.svg)](https://www.python.org/)
[![Django Version](https://img.shields.io/badge/django-5.0%20%7C%206.0-green.svg)](https://www.djangoproject.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Code Style](https://img.shields.io/badge/code%20style-PEP%208-orange.svg)]()

<p align="center">
  <b>An interactive, pedagogical virtual laboratory platform designed to master the Django Template Language (DTL) through hands-on simulations, instant rendering, and structured assessments.</b>
</p>

[Explore Experiments](#-experiment-catalog) • [Key Features](#-key-features) • [Quickstart](#-quickstart-guide) • [Architecture](#-project-architecture) • [Testing](#-running-automated-tests)

---

</div>

## 📌 Project Overview

The **Django Virtual Lab** is an educational engineering miniproject built for the **Full Stack Development Laboratory (FSDL)** at **KJ Somaiya School of Engineering**.

Modern web frameworks rely heavily on separation of concerns between business logic (views/models) and presentation (templates). For students learning Django, debugging template syntax errors through conventional terminal and server reload cycles can be friction-heavy. 

This platform bridges that gap by providing a self-contained, real-time **Interactive Simulation Workbench** alongside rigorous pedagogy—including theoretical foundations, pre-assessments, guided laboratory procedures, and post-assessments.

---

## 🔬 Experiment Catalog

| # | Experiment Module | Django Core Concepts Covered | Key Learning Objective |
|---|---|---|---|
| **01** | **Template Variables** | `{{ variable }}`, Context Dictionaries, Dot Notation (`user.name`) | Understand how views pass dynamic context data to HTML templates. |
| **02** | **Template Inheritance** | `{% extends 'base.html' %}`, `{% block content %}`, DRY Principle | Structure scalable layouts with master templates and child overrides. |
| **03** | **Template Loops** | `{% for item in items %}`, `forloop.counter`, `{% empty %}` | Iterate over collections, lists of dictionaries, and handle empty states. |
| **04** | **Template Filters** | `\|upper`, `\|lower`, `\|length`, `\|default`, `\|date`, Filter Chaining | Transform and format data directly inside templates cleanly. |

---

## ✨ Key Features

- **Interactive In-Browser Simulation Engine**:
  - Live template rendering that accurately parses variables, filters, loops, and block tags without needing server round-trips.
  - Real-time Context Inspector displaying the exact Python dictionary injected into the template.
  - Interactive "Fill-in-the-Blank" code editors guiding learners through deliberate practice.
  - Automated task verification checking output fidelity against expected results.

- **Standard Academic Virtual Lab Pedagogy**:
  - **Aim & Objectives**: Explicit Bloom's Taxonomy-aligned outcomes.
  - **Theory**: Clean, illustrated technical reference guides.
  - **Pretest**: Diagnostic multiple-choice questions with independent checking.
  - **Procedure**: Numbered, step-by-step laboratory guidelines.
  - **Simulation**: Safe, sandboxed workbench for active experimentation.
  - **Posttest**: Evaluative questions measuring conceptual mastery.
  - **Review Questions & References**: Further reading and documentation pointers.
  - **Feedback System**: Persisted student reviews stored and accessible via Django Admin.

- **Polished Institutional UI**:
  - Branded for **KJ Somaiya School of Engineering**.
  - Professional academic styling with high readability and semantic typography.
  - Smooth sequential pagination between experiment phases.
  - Fully responsive across desktop, tablet, and mobile displays.

---

## 🏗️ Project Architecture

```
FSDL-Virtual-Lab-Miniproject/
├── .github/
│   ├── workflows/
│   │   └── ci.yml              # Multi-Python GitHub Actions CI pipeline
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md       # Standardized bug submission form
│   │   └── feature_request.md  # Standardized feature proposal form
│   └── pull_request_template.md# Pull request validation checklist
├── config/
│   ├── __init__.py
│   ├── settings.py             # Django settings & static configuration
│   ├── urls.py                 # Root URL router (admin + lab routes)
│   └── wsgi.py                 # WSGI entry point
├── lab/
│   ├── migrations/             # Database migration history
│   ├── static/lab/
│   │   ├── css/
│   │   │   ├── site.css        # Academic design system & layout styles
│   │   │   └── simulation.css  # Dedicated workbench & editor theme
│   │   └── js/
│   │       └── simulation.js   # Client-side template parser & validator
│   ├── templates/lab/
│   │   ├── base.html           # Institutional shell & navigation
│   │   ├── home.html           # Lab overview & experiment directory
│   │   ├── lesson.html         # Unified pedagogy template (Theory, Tests, etc.)
│   │   ├── _pagination.html    # Previous / Next navigation component
│   │   ├── _sim_variables.html # Workbench for Experiment 1
│   │   ├── _sim_inheritance.html# Workbench for Experiment 2
│   │   ├── _sim_loops.html     # Workbench for Experiment 3
│   │   └── _sim_filters.html   # Workbench for Experiment 4
│   ├── admin.py                # Django Admin models & customized list displays
│   ├── apps.py                 # App configuration
│   ├── models.py               # Feedback persistence model
│   ├── tests.py                # Automated Django test suite
│   ├── urls.py                 # URL routes for experiments & pedagogy tabs
│   └── views.py                # View controllers & experiment metadata store
├── .editorconfig               # Cross-editor formatting specifications
├── .gitattributes              # Line-ending and binary file mappings
├── .gitignore                  # Git exclusion rules (venv, sqlite, cache)
├── CONTRIBUTING.md              # Open source contribution guidelines
├── LICENSE                     # MIT Open Source License
├── manage.py                   # Django CLI management utility
├── README.md                   # Main documentation & repository guide
├── requirements.txt            # Python dependencies
└── SECURITY.md                 # Security vulnerability disclosure policy
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Python 3.11+** installed (`python3 --version`)
- **Git** installed (`git --version`)

### 1. Clone the Repository
```bash
git clone https://github.com/Phaze19/django-virtual-lab.git
cd django-virtual-lab
```

### 2. Set Up Virtual Environment
```bash
# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
# On macOS/Linux:
source .venv/bin/activate
# On Windows (Command Prompt):
# .venv\Scripts\activate.bat
# On Windows (PowerShell):
# .venv\Scripts\Activate.ps1
```

### 3. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Run Database Migrations
```bash
python manage.py migrate
```

### 5. Create Superuser (Optional, for Admin Access)
```bash
python manage.py createsuperuser
```

### 6. Start the Development Server
```bash
python manage.py runserver
```

Open your browser and navigate to:
- **Virtual Lab**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Django Admin**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

## 🧪 Running Automated Tests

The project includes unit and integration tests covering views, experiment routes, simulation assets, pagination components, and the feedback submission workflow.

To run the complete test suite:
```bash
python manage.py test
```

Expected output:
```text
Found 6 test(s).
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
......
----------------------------------------------------------------------
Ran 6 tests in 0.020s

OK
Destroying test database for alias 'default'...
```

---

## 🛠️ Tech Stack

- **Backend**: [Python 3.13](https://www.python.org/) • [Django 5.x / 6.x](https://www.djangoproject.com/)
- **Frontend**: Semantic HTML5 • Vanilla CSS3 (Custom Design System) • Modern ES6+ JavaScript
- **Continuous Integration**: [GitHub Actions](https://github.com/features/actions)
- **Database**: SQLite3 (zero-configuration development database)

---

## 👥 Authors & Acknowledgments

- **Lead Developer**: Anurag Vedak ([@Phaze19](https://github.com/Phaze19))
- **Institution**: **KJ Somaiya School of Engineering**, Somaiya Vidyavihar University, Mumbai
- **Course**: Full Stack Development Laboratory (FSDL) - Miniproject

Special thanks to the faculty and mentors at KJ Somaiya School of Engineering for their guidance in developing virtual laboratory learning tools.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
