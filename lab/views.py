from django.http import Http404
from django.shortcuts import render
from django.urls import reverse

from .models import Feedback

EXPERIMENTS = [
    {"number": 1, "title": "Introduction to Django Template Variables", "slug": "template-variables", "summary": "Display data passed from a view using template variables."},
    {"number": 2, "title": "Template Inheritance using Base Templates", "slug": "template-inheritance", "summary": "Create common layouts with base.html and reusable blocks."},
    {"number": 3, "title": "Rendering Data using Template Loops", "slug": "template-loops", "summary": "Use for loops to display a collection of data."},
    {"number": 4, "title": "Formatting Output using Template Filters", "slug": "template-filters", "summary": "Transform text, dates, and values with built-in filters."},
]

LESSON_CONTENT = {
    "template-variables": {
        "aim": "To display values sent by a Django view inside an HTML template.",
        "overview": "A template is an HTML file with small Django placeholders. A view prepares useful data, and Django replaces each placeholder with the real value before the page reaches the browser.",
        "theory": [
            {"title": "The view provides the context", "text": "The context is a Python dictionary. Its keys become names that the template can use. Keep the data preparation in the view and keep the template focused on displaying it.", "code": "# views.py\ndef profile(request):\n    context = {\n        'student_name': 'Anurag',\n        'topic': 'Django Templates',\n    }\n    return render(request, 'lab/profile.html', context)"},
            {"title": "Double curly braces display a value", "text": "Inside a template, write a variable name between double curly braces. Django looks for that name in the context and inserts its value.", "code": "<!-- templates/lab/profile.html -->\n<h1>Hello, {{ student_name }}</h1>\n<p>Today we are learning {{ topic }}.</p>"},
            {"title": "Dot notation reaches inside data", "text": "A variable can also contain a dictionary, an object, or a related value. Dot notation is Django's friendly way to read it.", "code": "# Context: {'student': {'name': 'Anurag'}}\n<p>Welcome, {{ student.name }}.</p>"},
        ],
        "tips": ["Use {{ variable_name }} when you want to show data.", "A missing variable normally renders as an empty string, so check spelling carefully.", "Django escapes HTML in variables by default, which helps protect a page from unsafe input."],
        "procedure": ["Open the view and create a context dictionary with two values.", "Pass that context as the third argument to render().", "Use the same key names inside double curly braces in the template.", "Refresh the page and check that the placeholders have become real text."],
        "pretest": [
            {"question": "Which Django component usually prepares data before a template is rendered?", "options": ["A view", "A stylesheet", "A migration", "A URL slug"], "correct": 0, "explanation": "A view prepares data and sends it to a template through the context."},
            {"question": "Which syntax displays a variable named course in a Django template?", "options": ["{{ course }}", "{% course %}", "<course>", "[[ course ]]"], "correct": 0, "explanation": "Double curly braces are used to display a value."},
            {"question": "What is the usual Python type for a Django template context?", "options": ["Dictionary", "Tuple", "CSS class", "URL pattern"], "correct": 0, "explanation": "A context is usually a dictionary of names and values."},
        ],
        "posttest": [
            {"question": "If the view sends {'name': 'Mira'}, what does {{ name }} render as?", "options": ["Mira", "name", "{'name': 'Mira'}", "An error every time"], "correct": 0, "explanation": "Django replaces the placeholder with the matching context value."},
            {"question": "Which expression reads the name property of student?", "options": ["{{ student.name }}", "{{ student->name }}", "{% student.name %}", "<student.name>"], "correct": 0, "explanation": "Django templates use dot notation for nested values."},
            {"question": "Why should a template variable and its context key have matching names?", "options": ["So Django can find and display the value", "So CSS can color it", "To create a database table", "To start the server"], "correct": 0, "explanation": "Django resolves a template variable by looking it up in the context."},
        ],
    },
    "template-inheritance": {
        "aim": "To create one shared layout and reuse it in multiple Django pages.",
        "overview": "Template inheritance prevents repeated header, navigation, and footer HTML. A base template defines named spaces called blocks. Child templates extend the base and fill only the page-specific block.",
        "theory": [
            {"title": "Build the shared base template", "text": "base.html contains the parts that are common to many pages. The content block is a placeholder where a child page will place its own content.", "code": "<!-- templates/lab/base.html -->\n<header>Django Template Learning Lab</header>\n<main>\n  {% block content %}{% endblock %}\n</main>\n<footer>Virtual Lab</footer>"},
            {"title": "Extend the base in a child template", "text": "The {% extends %} tag tells Django which base template to use. The child template then replaces the block with its own HTML.", "code": "<!-- templates/lab/lesson.html -->\n{% extends 'lab/base.html' %}\n\n{% block content %}\n  <h1>Template Inheritance</h1>\n  <p>This text belongs only to this page.</p>\n{% endblock %}"},
            {"title": "Use more than one block when needed", "text": "A page can have a title block, a content block, and a scripts block. Use clear block names so other developers can understand where each piece belongs.", "code": "<title>{% block title %}Django Lab{% endblock %}</title>\n{% block content %}{% endblock %}\n{% block extra_js %}{% endblock %}"},
        ],
        "tips": ["Put the {% extends %} tag at the top of a child template.", "Use inheritance for repeated structure, not for every small visual fragment.", "Use {% include %} for small reusable parts such as a sidebar or footer."],
        "procedure": ["Create base.html and add the shared header, main element, and footer.", "Place {% block content %}{% endblock %} inside the main element.", "Create a child template and use {% extends 'lab/base.html' %} at the top.", "Fill the content block and load the page to confirm the shared layout appears."],
        "pretest": [
            {"question": "What problem does template inheritance mainly solve?", "options": ["Repeated layout code", "Slow internet", "Database migrations", "Python indentation"], "correct": 0, "explanation": "Inheritance lets one base layout be reused by many pages."},
            {"question": "Which tag tells a child template to use base.html?", "options": ["{% extends 'lab/base.html' %}", "{{ base.html }}", "{% render base.html %}", "<extends base.html>"], "correct": 0, "explanation": "The extends tag selects the parent template."},
            {"question": "What is a block in a base template?", "options": ["A named area a child can replace", "A Python class", "A database record", "A URL redirect"], "correct": 0, "explanation": "Blocks are named placeholders in the parent template."},
        ],
        "posttest": [
            {"question": "Where should {% block content %} normally appear?", "options": ["In the base template", "Only in views.py", "Inside settings.py", "Inside a CSS file"], "correct": 0, "explanation": "The base template defines the replaceable block."},
            {"question": "Which statement is true about child templates?", "options": ["They can fill blocks from a base template", "They cannot contain HTML", "They must repeat the whole header", "They replace Python views"], "correct": 0, "explanation": "A child template adds its own content to blocks defined by the base."},
            {"question": "When is {% include %} especially useful?", "options": ["For a small reusable component", "For starting the server", "For creating a model", "For installing Django"], "correct": 0, "explanation": "Include is a simple way to reuse small template fragments."},
        ],
    },
    "template-loops": {
        "aim": "To render a sequence of values in a Django template using a for loop.",
        "overview": "When a page needs to show many similar items, a loop is clearer than writing the same HTML many times. Django repeats the HTML inside a {% for %} tag once for each item in the supplied collection.",
        "theory": [
            {"title": "Send a list from the view", "text": "A list can contain strings, dictionaries, or model objects. Give the list a clear context name, such as lessons or students.", "code": "# views.py\ndef topics(request):\n    context = {'topics': ['Variables', 'Loops', 'Filters']}\n    return render(request, 'lab/topics.html', context)"},
            {"title": "Repeat HTML with a for tag", "text": "Everything between {% for %} and {% endfor %} is repeated. Use double curly braces to display the current item.", "code": "<ul>\n  {% for topic in topics %}\n    <li>{{ topic }}</li>\n  {% endfor %}\n</ul>"},
            {"title": "Use forloop and empty", "text": "Django gives you helpful loop values such as forloop.counter. The optional {% empty %} section gives the user a useful message when the collection has no items.", "code": "{% for topic in topics %}\n  <p>{{ forloop.counter }}. {{ topic }}</p>\n{% empty %}\n  <p>No topics are available yet.</p>\n{% endfor %}"},
        ],
        "tips": ["Use a meaningful singular name for each item, such as student in students.", "Use forloop.counter when learners should see human-friendly numbering starting at 1.", "Use {% empty %} so an empty list never looks like a broken page."],
        "procedure": ["Create a list in a view and send it through the context.", "Open a template and write a {% for item in items %} loop.", "Place HTML and {{ item }} inside the loop.", "Add an {% empty %} message, then test with an empty list."],
        "pretest": [
            {"question": "Which tag begins a Django template loop?", "options": ["{% for item in items %}", "{{ for item in items }}", "<loop items>", "{% repeat items %}"], "correct": 0, "explanation": "Django template loops begin with the for tag."},
            {"question": "What should items normally be?", "options": ["An iterable such as a list or queryset", "A CSS selector", "A secret key", "A URL name only"], "correct": 0, "explanation": "A loop needs a collection that Django can iterate over."},
            {"question": "Which tag ends a Django for loop?", "options": ["{% endfor %}", "{% stop %}", "{{ endfor }}", "</for>"], "correct": 0, "explanation": "Every Django for block closes with endfor."},
        ],
        "posttest": [
            {"question": "What does forloop.counter return in the first loop iteration?", "options": ["1", "0", "The item text", "The length of the list"], "correct": 0, "explanation": "forloop.counter starts from 1; forloop.counter0 starts from 0."},
            {"question": "What is the purpose of {% empty %} inside a loop?", "options": ["Show content when the collection has no items", "Delete the list", "End the loop early", "Create a blank database row"], "correct": 0, "explanation": "The empty branch gives a useful fallback for an empty collection."},
            {"question": "Which is the clearest variable pair?", "options": ["student in students", "x in y", "style in CSS", "url in HTML"], "correct": 0, "explanation": "A singular item name and plural collection name make the template easier to read."},
        ],
    },
    "template-filters": {
        "aim": "To format displayed data using Django's built-in template filters.",
        "overview": "A filter changes how a value is shown without changing the original value in Python. Filters are placed after a variable using a vertical bar. They are useful for formatting text, dates, and numbers close to where they are displayed.",
        "theory": [
            {"title": "Apply a simple filter", "text": "The vertical bar sends a value through a filter. For example, upper converts the displayed text to capital letters.", "code": "<p>{{ student_name|upper }}</p>\n<!-- Anurag becomes ANURAG -->"},
            {"title": "Filters can accept an argument", "text": "Some filters need an additional value after a colon. truncatechars:35 keeps a description short enough for a preview card.", "code": "<p>{{ description|truncatechars:35 }}</p>\n<p>{{ biography|default:'No biography yet.' }}</p>"},
            {"title": "Format dates and inspect collections", "text": "The date filter makes dates readable, while length tells you how many values a collection has. These filters only affect the output, not the original Python value.", "code": "<p>Joined: {{ joined_on|date:'d M Y' }}</p>\n<p>Lessons: {{ lessons|length }}</p>"},
        ],
        "tips": ["Use filters for display formatting, not for complicated business logic.", "Read a filter's documentation before using it with user-provided data.", "The original context value is not changed by a filter."],
        "procedure": ["Pass a text value and a date value from the view.", "Display the text with upper or lower.", "Display the date with date:'d M Y'.", "Try a default filter, then remove the original value to observe the fallback text."],
        "pretest": [
            {"question": "What symbol comes before a Django template filter?", "options": ["|", ":", "#", "@"], "correct": 0, "explanation": "A vertical bar separates a variable from its filter."},
            {"question": "Which expression displays name in uppercase?", "options": ["{{ name|upper }}", "{{ upper(name) }}", "{% name.upper %}", "{{ name:upper }}"], "correct": 0, "explanation": "Django uses the pipe syntax for filters."},
            {"question": "What does a template filter normally change?", "options": ["How a value is displayed", "The database schema", "The URL pattern", "The installed Django version"], "correct": 0, "explanation": "Filters transform output for presentation."},
        ],
        "posttest": [
            {"question": "Which filter gives fallback text when a value is empty?", "options": ["default", "upper", "length", "date"], "correct": 0, "explanation": "The default filter displays a fallback when the value is false or empty."},
            {"question": "What does {{ lessons|length }} display?", "options": ["The number of items in lessons", "The first lesson", "A shortened lesson", "The database ID"], "correct": 0, "explanation": "length returns the size of a collection or string."},
            {"question": "Which expression formats joined_on as 21 Sep 2026?", "options": ["{{ joined_on|date:'d M Y' }}", "{{ date(joined_on) }}", "{% joined_on|date %}", "{{ joined_on:date }}"], "correct": 0, "explanation": "The date filter accepts a format string after a colon."},
        ],
    },
}

INFORMATION = {
    "introduction": ("Introduction", "Django Template Learning Lab introduces the fundamental tools used to create dynamic HTML pages in Django."),
    "objective": ("Objective", "To help learners understand template inheritance, variables, loops, and filters through short guided experiments."),
    "target_audience": ("Target Audience", "Undergraduate students and beginners who have completed the basics of Python and Django views."),
    "course_alignment": ("Course Alignment", "Web Technologies, Python Programming, Full Stack Development, and Django Framework courses."),
    "feedback": ("Feedback", "Your feedback helps us improve this learning lab. The feedback form will be added in the next phase."),
}


MAIN_SECTIONS = [
    {"section": "introduction", "title": "Introduction", "url_name": "introduction"},
    {"section": "objective", "title": "Objective", "url_name": "objective"},
    {"section": "experiments", "title": "List of experiments", "url_name": "experiments"},
    {"section": "target_audience", "title": "Target Audience", "url_name": "target_audience"},
    {"section": "course_alignment", "title": "Course Alignment", "url_name": "course_alignment"},
    {"section": "feedback", "title": "Feedback", "url_name": "feedback"},
]

LESSON_SECTIONS = [
    ("aim", "Aim"),
    ("theory", "Theory"),
    ("pretest", "Pretest"),
    ("procedure", "Procedure"),
    ("simulation", "Simulation"),
    ("posttest", "Posttest"),
    ("feedback", "Feedback"),
]


def get_main_pagination(current_section):
    try:
        idx = next(i for i, item in enumerate(MAIN_SECTIONS) if item["section"] == current_section)
    except StopIteration:
        return None, None

    prev_page = None
    next_page = None

    if idx > 0:
        prev_item = MAIN_SECTIONS[idx - 1]
        prev_page = {"title": prev_item["title"], "url": reverse(prev_item["url_name"])}

    if idx < len(MAIN_SECTIONS) - 1:
        next_item = MAIN_SECTIONS[idx + 1]
        next_page = {"title": next_item["title"], "url": reverse(next_item["url_name"])}

    return prev_page, next_page


def get_lesson_pagination(slug, current_section):
    try:
        exp_idx = next(i for i, item in enumerate(EXPERIMENTS) if item["slug"] == slug)
    except StopIteration:
        return None, None
    try:
        sec_idx = next(i for i, item in enumerate(LESSON_SECTIONS) if item[0] == current_section)
    except StopIteration:
        return None, None

    prev_page = None
    next_page = None

    # Previous navigation
    if sec_idx > 0:
        prev_sec = LESSON_SECTIONS[sec_idx - 1]
        prev_page = {
            "title": prev_sec[1],
            "url": reverse("lesson_section", args=[slug, prev_sec[0]]),
        }
    else:
        # At first section (aim) of this experiment
        if exp_idx > 0:
            prev_exp = EXPERIMENTS[exp_idx - 1]
            prev_page = {
                "title": f"Exp {prev_exp['number']}: {prev_exp['title']}",
                "url": reverse("lesson_section", args=[prev_exp["slug"], "feedback"]),
            }
        else:
            prev_page = {
                "title": "List of experiments",
                "url": reverse("experiments"),
            }

    # Next navigation
    if sec_idx < len(LESSON_SECTIONS) - 1:
        next_sec = LESSON_SECTIONS[sec_idx + 1]
        next_page = {
            "title": next_sec[1],
            "url": reverse("lesson_section", args=[slug, next_sec[0]]),
        }
    else:
        # At last section (feedback) of this experiment
        if exp_idx < len(EXPERIMENTS) - 1:
            next_exp = EXPERIMENTS[exp_idx + 1]
            next_page = {
                "title": f"Exp {next_exp['number']}: {next_exp['title']}",
                "url": reverse("lesson_section", args=[next_exp["slug"], "aim"]),
            }
        else:
            next_page = {
                "title": "List of experiments",
                "url": reverse("experiments"),
            }

    return prev_page, next_page


def experiments(request):
    prev_page, next_page = get_main_pagination("experiments")
    return render(request, "lab/experiments.html", {
        "experiments": EXPERIMENTS,
        "active": "experiments",
        "prev_page": prev_page,
        "next_page": next_page,
    })


def information(request, section):
    try:
        title, content = INFORMATION[section]
    except KeyError as exc:
        raise Http404 from exc
    prev_page, next_page = get_main_pagination(section)
    return render(request, "lab/information.html", {
        "title": title,
        "content": content,
        "active": section,
        "prev_page": prev_page,
        "next_page": next_page,
    })


def lesson(request, slug):
    return lesson_section(request, slug, "aim")


def experiment_feedback(request, slug):
    experiment = next((item for item in EXPERIMENTS if item["slug"] == slug), None)
    if experiment is None:
        raise Http404

    prev_page, next_page = get_lesson_pagination(slug, "feedback")

    if request.method == "POST":
        message = (request.POST.get("message") or "").strip()
        if not message:
            return render(request, "lab/lesson.html", {
                "experiment": experiment,
                "lesson": LESSON_CONTENT[slug],
                "section": "feedback",
                "feedback_error": "Please write a short comment before sending.",
                "prev_page": prev_page,
                "next_page": next_page,
            })

        Feedback.objects.create(message=message, experiment_slug=slug)
        return render(request, "lab/lesson.html", {
            "experiment": experiment,
            "lesson": LESSON_CONTENT[slug],
            "section": "feedback",
            "feedback_success": "Thank you. Your feedback has been noted for this prototype.",
            "prev_page": prev_page,
            "next_page": next_page,
        })

    return render(request, "lab/lesson.html", {
        "experiment": experiment,
        "lesson": LESSON_CONTENT[slug],
        "section": "feedback",
        "prev_page": prev_page,
        "next_page": next_page,
    })


def lesson_section(request, slug, section):
    experiment = next((item for item in EXPERIMENTS if item["slug"] == slug), None)
    allowed_sections = {"aim", "theory", "pretest", "procedure", "simulation", "posttest", "feedback"}
    if experiment is None or section not in allowed_sections:
        raise Http404
    prev_page, next_page = get_lesson_pagination(slug, section)
    return render(request, "lab/lesson.html", {
        "experiment": experiment,
        "lesson": LESSON_CONTENT[slug],
        "section": section,
        "prev_page": prev_page,
        "next_page": next_page,
    })
