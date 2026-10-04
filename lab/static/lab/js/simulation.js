/**
 * Django Template Virtual Lab Simulation Engine
 * KJ Somaiya School of Engineering
 * Clean Academic Engine (No Emojis, No Clutter, Fill-in-the-blanks)
 */

(function () {
  'use strict';

  // Helper: show brief render feedback next to the button
  function flashRenderFeedback(feedbackEl) {
    if (!feedbackEl) return;
    feedbackEl.classList.add('active');
    setTimeout(() => {
      feedbackEl.classList.remove('active');
    }, 1200);
  }

  // Helper: Resolve dotted path in context
  function resolveContextPath(context, path) {
    if (!path) return undefined;
    const parts = path.trim().split('.');
    let curr = context;
    for (let part of parts) {
      if (curr === undefined || curr === null) return undefined;
      curr = curr[part];
    }
    return curr;
  }

  // Built-in Django Filters
  const DJANGO_FILTERS = {
    upper: (val) => String(val ?? '').toUpperCase(),
    lower: (val) => String(val ?? '').toLowerCase(),
    capfirst: (val) => {
      const s = String(val ?? '');
      return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    },
    title: (val) => {
      return String(val ?? '').replace(/\b\w/g, (c) => c.toUpperCase());
    },
    length: (val) => {
      if (Array.isArray(val) || typeof val === 'string') return val.length;
      if (typeof val === 'object' && val !== null) return Object.keys(val).length;
      return 0;
    },
    wordcount: (val) => {
      const s = String(val ?? '').trim();
      return s ? s.split(/\s+/).length : 0;
    },
    truncatechars: (val, arg) => {
      const s = String(val ?? '');
      const limit = parseInt(arg, 10);
      if (isNaN(limit) || s.length <= limit) return s;
      return s.slice(0, Math.max(0, limit - 3)) + '...';
    },
    truncatewords: (val, arg) => {
      const s = String(val ?? '').trim();
      const limit = parseInt(arg, 10);
      if (isNaN(limit)) return s;
      const words = s.split(/\s+/);
      if (words.length <= limit) return s;
      return words.slice(0, limit).join(' ') + '...';
    },
    default: (val, arg) => {
      if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
        return (arg ?? '').replace(/^['"]|['"]$/g, '');
      }
      return val;
    },
    date: (val, arg) => {
      if (!val) return '';
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      const format = (arg || 'd M Y').replace(/^['"]|['"]$/g, '');
      const pad = (n) => (n < 10 ? '0' + n : n);

      return format
        .replace(/d/g, pad(d.getDate()))
        .replace(/j/g, d.getDate())
        .replace(/m/g, pad(d.getMonth() + 1))
        .replace(/M/g, months[d.getMonth()])
        .replace(/F/g, fullMonths[d.getMonth()])
        .replace(/Y/g, d.getFullYear())
        .replace(/y/g, String(d.getFullYear()).slice(-2))
        .replace(/l/g, days[d.getDay()]);
    },
    add: (val, arg) => {
      const cleanArg = (arg || '').replace(/^['"]|['"]$/g, '');
      const numVal = Number(val);
      const numArg = Number(cleanArg);
      if (!isNaN(numVal) && !isNaN(numArg)) {
        return numVal + numArg;
      }
      return String(val ?? '') + cleanArg;
    }
  };

  // Django Template Evaluator
  function renderDjangoTemplate(templateStr, context, inspectorCallback) {
    const rawInspected = [];
    let output = templateStr;

    // 1. Process Loops: {% for item in collection %} ... {% empty %} ... {% endfor %}
    const loopRegex = /{%\s*for\s+(\w+)\s+in\s+([\w\.]+)\s*%}([\s\S]*?)(?:{%\s*empty\s*%}([\s\S]*?))?{%\s*endfor\s*%}/g;
    output = output.replace(loopRegex, function (match, itemVar, collectionPath, loopBody, emptyBody) {
      const collection = resolveContextPath(context, collectionPath);
      rawInspected.push({
        name: collectionPath,
        resolved: collection !== undefined,
        value: Array.isArray(collection) ? `[List of ${collection.length} items]` : String(collection)
      });

      if (!Array.isArray(collection) || collection.length === 0) {
        return emptyBody !== undefined ? emptyBody : '';
      }

      let loopOutput = '';
      collection.forEach((item, index) => {
        const loopContext = Object.assign({}, context, {
          [itemVar]: item,
          forloop: {
            counter: index + 1,
            counter0: index,
            first: index === 0,
            last: index === collection.length - 1
          }
        });

        // Inner conditionals
        let renderedItem = loopBody;
        const ifRegex = /{%\s*if\s+([\w\.]+)\s*%}([\s\S]*?)(?:{%\s*else\s*%}([\s\S]*?))?{%\s*endif\s*%}/g;
        renderedItem = renderedItem.replace(ifRegex, function (_, condPath, trueBlock, falseBlock) {
          const condVal = resolveContextPath(loopContext, condPath);
          return condVal ? trueBlock : (falseBlock || '');
        });

        // Inner variables
        renderedItem = renderVariables(renderedItem, loopContext, () => {});
        loopOutput += renderedItem;
      });

      return loopOutput;
    });

    // 2. Process Conditionals outside loops: {% if cond %} ... {% else %} ... {% endif %}
    const ifRegex = /{%\s*if\s+([\w\.]+)\s*%}([\s\S]*?)(?:{%\s*else\s*%}([\s\S]*?))?{%\s*endif\s*%}/g;
    output = output.replace(ifRegex, function (_, condPath, trueBlock, falseBlock) {
      const condVal = resolveContextPath(context, condPath);
      return condVal ? trueBlock : (falseBlock || '');
    });

    // 3. Process Variables and Filters: {{ var|filter:arg }}
    output = renderVariables(output, context, (item) => rawInspected.push(item));

    if (inspectorCallback) {
      // Deduplicate inspected variables by name so inspector does not repeat items
      const seen = new Set();
      const uniqueVars = [];
      for (let item of rawInspected) {
        if (!seen.has(item.name)) {
          seen.add(item.name);
          uniqueVars.push(item);
        }
      }
      inspectorCallback(uniqueVars);
    }

    return output;
  }

  function renderVariables(templateStr, context, trackInspection) {
    const varRegex = /{{\s*([^}]+?)\s*}}/g;
    return templateStr.replace(varRegex, function (match, expression) {
      const filterParts = expression.split('|');
      const varPath = filterParts[0].trim();
      let value = resolveContextPath(context, varPath);

      const inspectionItem = {
        name: varPath,
        resolved: value !== undefined,
        value: value !== undefined ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : '"" (missing -> empty string)'
      };

      // Apply Filters sequentially
      for (let i = 1; i < filterParts.length; i++) {
        const filterExpr = filterParts[i].trim();
        const colonIdx = filterExpr.indexOf(':');
        let filterName = filterExpr;
        let filterArg = null;
        if (colonIdx !== -1) {
          filterName = filterExpr.slice(0, colonIdx).trim();
          filterArg = filterExpr.slice(colonIdx + 1).trim();
        }

        if (DJANGO_FILTERS[filterName]) {
          value = DJANGO_FILTERS[filterName](value, filterArg);
        }
      }

      if (trackInspection) {
        trackInspection(inspectionItem);
      }

      return value !== undefined ? value : '';
    });
  }

  // ==========================================================
  // Simulation 1: Template Variables
  // ==========================================================
  window.initVariablesSimulation = function () {
    const editor = document.getElementById('var-template-editor');
    const preview = document.getElementById('var-rendered-output');
    const inspector = document.getElementById('var-inspector-grid');
    const runBtn = document.getElementById('var-run-btn');
    const resetBtn = document.getElementById('var-reset-btn');
    const statusPill = document.getElementById('var-challenge-status');
    const feedbackPill = document.getElementById('var-render-feedback');

    if (!editor || !preview) return;

    const defaultContext = {
      student_name: 'Anurag',
      course: 'Web Development (Django)',
      student: {
        roll_no: '2026BTECH01',
        department: 'Computer Engineering'
      },
      status: 'Active'
    };

    let activeContext = JSON.parse(JSON.stringify(defaultContext));
    let activeTask = 1;

    // Clean fill in the blanks starter code
    const starterCode = `<div class="sim-rendered-card">
  <h3>Student Profile</h3>
  <p><strong>Name:</strong> {{ student_name }}</p>
  <p><strong>Course:</strong> ____</p>
  <p><strong>Department:</strong> ____</p>
  <p><strong>Semester:</strong> ____</p>
</div>`;

    function run(showFeedback) {
      const code = editor.value;
      const inspected = [];
      const resultHtml = renderDjangoTemplate(code, activeContext, (vars) => {
        vars.forEach((v) => inspected.push(v));
      });

      preview.innerHTML = resultHtml;

      if (inspector) {
        inspector.innerHTML = '';
        if (inspected.length === 0) {
          inspector.innerHTML = '<div style="color:#64748b;font-size:12px;">No template variables detected. Type a variable like <code>{{ student_name }}</code> in the editor.</div>';
        } else {
          inspected.forEach((item) => {
            const el = document.createElement('div');
            el.className = 'sim-inspector-item';
            el.innerHTML = `
              <div class="sim-inspector-key">{{ ${item.name} }}</div>
              <div class="sim-inspector-val ${item.resolved ? '' : 'missing'}">
                ${item.resolved ? 'Resolved: ' + item.value : '(Not found in context -> resolved as empty string)'}
              </div>`;
            inspector.appendChild(el);
          });
        }
      }

      checkChallenge(code);
      if (showFeedback && feedbackPill) {
        flashRenderFeedback(feedbackPill);
      }
    }

    function checkChallenge(code) {
      if (!statusPill) return;
      if (activeTask === 1) {
        const hasCourseVar = /\{\{\s*course\s*\}\}/.test(code);
        if (hasCourseVar) {
          statusPill.className = 'sim-challenge-status sim-status-passed';
          statusPill.innerText = 'Completed: Course variable {{ course }} rendered successfully.';
        } else {
          statusPill.className = 'sim-challenge-status sim-status-pending';
          statusPill.innerText = 'Task 1 (In Progress): Replace ____ on Course line with {{ course }} and click Render.';
        }
      } else if (activeTask === 2) {
        const hasDeptVar = /\{\{\s*student\.department\s*\}\}/.test(code);
        if (hasDeptVar) {
          statusPill.className = 'sim-challenge-status sim-status-passed';
          statusPill.innerText = 'Completed: Dot notation {{ student.department }} resolved successfully.';
        } else {
          statusPill.className = 'sim-challenge-status sim-status-pending';
          statusPill.innerText = 'Task 2 (In Progress): Replace ____ on Department line with {{ student.department }}.';
        }
      } else if (activeTask === 3) {
        const hasSemesterVar = /\{\{\s*semester\s*\}\}/.test(code);
        if (hasSemesterVar) {
          statusPill.className = 'sim-challenge-status sim-status-passed';
          statusPill.innerText = 'Completed: Missing variable {{ semester }} rendered safely as empty string.';
        } else {
          statusPill.className = 'sim-challenge-status sim-status-pending';
          statusPill.innerText = 'Task 3 (In Progress): Replace ____ on Semester line with {{ semester }} (not in views.py).';
        }
      }
    }

    document.querySelectorAll('[data-var-task]').forEach((pill) => {
      pill.addEventListener('click', function () {
        document.querySelectorAll('[data-var-task]').forEach((p) => p.classList.remove('active'));
        this.classList.add('active');
        activeTask = parseInt(this.getAttribute('data-var-task'), 10);
        const desc = document.getElementById('var-task-desc');
        if (desc) {
          if (activeTask === 1) desc.innerText = 'Task 1: Replace ____ on the Course line with {{ course }}.';
          if (activeTask === 2) desc.innerText = 'Task 2: Replace ____ on the Department line with {{ student.department }}.';
          if (activeTask === 3) desc.innerText = 'Task 3: Replace ____ on the Semester line with {{ semester }} to test missing variables.';
        }
        checkChallenge(editor.value);
      });
    });

    if (runBtn) {
      runBtn.addEventListener('click', () => run(true));
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        editor.value = starterCode;
        activeContext = JSON.parse(JSON.stringify(defaultContext));
        run(false);
      });
    }

    editor.addEventListener('input', () => run(false));
    run(false);
  };

  // ==========================================================
  // Simulation 2: Template Inheritance
  // ==========================================================
  window.initInheritanceSimulation = function () {
    const baseEditor = document.getElementById('inh-base-editor');
    const childEditor = document.getElementById('inh-child-editor');
    const preview = document.getElementById('inh-rendered-output');
    const blueprint = document.getElementById('inh-blueprint');
    const runBtn = document.getElementById('inh-run-btn');
    const resetBtn = document.getElementById('inh-reset-btn');
    const statusPill = document.getElementById('inh-challenge-status');
    const feedbackPill = document.getElementById('inh-render-feedback');

    if (!baseEditor || !childEditor || !preview) return;

    let activeTab = 'child';
    let activeTask = 1;

    const defaultBase = `<!-- base.html (Parent Layout) -->
<div class="virtual-lab-frame" style="border:1px solid #dce4eb;border-radius:4px;overflow:hidden;background:#fff;">
  <header style="background:#337ab7;color:#fff;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;">
    <strong>KJ Somaiya School of Engineering</strong>
    <span style="font-size:12px;opacity:0.9;">Virtual Lab</span>
  </header>
  <nav style="background:#eef4fa;padding:8px 18px;font-size:13px;border-bottom:1px solid #dce4eb;">
    {% block nav %}<a href="#" style="color:#337ab7;text-decoration:none;margin-right:12px;">Home</a><a href="#" style="color:#337ab7;text-decoration:none;">Experiments</a>{% endblock %}
  </nav>
  <main style="padding:18px;min-height:120px;">
    {% block content %}
      <p style="color:#64748b;font-style:italic;">[Parent Default Content] Replace ____ in child.html to inject page content here.</p>
    {% endblock %}
  </main>
  <footer style="background:#222;color:#eee;padding:10px 18px;font-size:12px;text-align:center;">
    {% block footer %}&copy; 2026 KJ Somaiya School of Engineering - Learning Django{% endblock %}
  </footer>
</div>`;

    const starterChild = `{% extends 'base.html' %}

{% block content %}
____
{% endblock %}`;

    function run(showFeedback) {
      const childCode = childEditor.value;
      const baseCode = baseEditor.value;

      // Extract blocks defined
      const blockRegex = /{%\s*block\s+(\w+)\s*%}([\s\S]*?){%\s*endblock\s*%}/g;
      const childBlocks = {};
      let match;
      while ((match = blockRegex.exec(childCode)) !== null) {
        childBlocks[match[1]] = match[2];
      }

      const hasExtends = /{%\s*extends\s+['"]base\.html['"]\s*%}/.test(childCode);

      let finalHtml = '';
      if (!hasExtends) {
        finalHtml = `<div style="background:#fff8f0;color:#9a3412;padding:12px 16px;border:1px solid #fed7aa;border-radius:4px;margin-bottom:12px;font-size:13px;">
          Notice: {% extends 'base.html' %} is missing. Without inheritance, only the child template's raw text is rendered.
        </div>` + childCode;
      } else {
        finalHtml = baseCode.replace(blockRegex, function (_, blockName, defaultContent) {
          if (childBlocks[blockName] !== undefined) {
            return childBlocks[blockName];
          }
          return defaultContent;
        });
      }

      preview.innerHTML = finalHtml;

      // Blueprint Inspector
      if (blueprint) {
        const blocksInBase = ['nav', 'content', 'footer'];
        let bpHtml = '<div class="sim-blueprint-box"><strong>Parent &lt;base.html&gt; Block Mapping:</strong>';
        blocksInBase.forEach((bName) => {
          const isFilled = hasExtends && childBlocks[bName] !== undefined && childBlocks[bName].trim() !== '____';
          bpHtml += `
            <div class="sim-block-slot ${isFilled ? 'filled' : ''}">
              <span class="sim-block-tag ${bName === 'content' ? 'content' : ''}">{% block ${bName} %}</span>
              <span style="font-size:12px;margin-left:8px;color:${isFilled ? '#15803d' : '#64748b'};font-weight:${isFilled ? '600' : '400'};">
                ${isFilled ? 'Injected from child.html' : 'Using parent default fallback'}
              </span>
            </div>`;
        });
        bpHtml += '</div>';
        blueprint.innerHTML = bpHtml;
      }

      checkChallenge(childCode, hasExtends, childBlocks);
      if (showFeedback && feedbackPill) {
        flashRenderFeedback(feedbackPill);
      }
    }

    function checkChallenge(code, hasExtends, childBlocks) {
      if (!statusPill) return;
      if (activeTask === 1) {
        const contentVal = childBlocks['content'] ? childBlocks['content'].trim() : '';
        if (hasExtends && contentVal && contentVal !== '____') {
          statusPill.className = 'sim-challenge-status sim-status-passed';
          statusPill.innerText = 'Completed: Defined {% block content %} and injected into parent layout.';
        } else {
          statusPill.className = 'sim-challenge-status sim-status-pending';
          statusPill.innerText = 'Task 1 (In Progress): Replace ____ in {% block content %} with your page content.';
        }
      } else if (activeTask === 2) {
        const navVal = childBlocks['nav'] ? childBlocks['nav'].trim() : '';
        if (hasExtends && navVal && navVal.length > 0) {
          statusPill.className = 'sim-challenge-status sim-status-passed';
          statusPill.innerText = 'Completed: Custom navigation defined in {% block nav %}.';
        } else {
          statusPill.className = 'sim-challenge-status sim-status-pending';
          statusPill.innerText = 'Task 2 (In Progress): Add {% block nav %}...{% endblock %} in child.html to override navigation.';
        }
      } else if (activeTask === 3) {
        if (!hasExtends) {
          statusPill.className = 'sim-challenge-status sim-status-passed';
          statusPill.innerText = 'Completed: Observed behavior when {% extends %} is removed.';
        } else {
          statusPill.className = 'sim-challenge-status sim-status-pending';
          statusPill.innerText = 'Task 3 (In Progress): Remove {% extends "base.html" %} from child.html.';
        }
      }
    }

    const tabChildBtn = document.getElementById('inh-tab-child');
    const tabBaseBtn = document.getElementById('inh-tab-base');
    if (tabChildBtn && tabBaseBtn) {
      tabChildBtn.addEventListener('click', () => {
        tabChildBtn.classList.add('active');
        tabBaseBtn.classList.remove('active');
        childEditor.style.display = 'block';
        baseEditor.style.display = 'none';
        activeTab = 'child';
      });
      tabBaseBtn.addEventListener('click', () => {
        tabBaseBtn.classList.add('active');
        tabChildBtn.classList.remove('active');
        baseEditor.style.display = 'block';
        childEditor.style.display = 'none';
        activeTab = 'base';
      });
    }

    document.querySelectorAll('[data-inh-task]').forEach((pill) => {
      pill.addEventListener('click', function () {
        document.querySelectorAll('[data-inh-task]').forEach((p) => p.classList.remove('active'));
        this.classList.add('active');
        activeTask = parseInt(this.getAttribute('data-inh-task'), 10);
        const desc = document.getElementById('inh-task-desc');
        if (desc) {
          if (activeTask === 1) desc.innerText = 'Task 1: In child.html, replace ____ inside {% block content %} with custom page content.';
          if (activeTask === 2) desc.innerText = 'Task 2: Add {% block nav %}...{% endblock %} in child.html to provide custom navigation.';
          if (activeTask === 3) desc.innerText = 'Task 3: Remove {% extends "base.html" %} to observe behavior without inheritance.';
        }
        run(false);
      });
    });

    if (runBtn) {
      runBtn.addEventListener('click', () => run(true));
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        baseEditor.value = defaultBase;
        childEditor.value = starterChild;
        run(false);
      });
    }

    childEditor.addEventListener('input', () => run(false));
    baseEditor.addEventListener('input', () => run(false));
    run(false);
  };

  // ==========================================================
  // Simulation 3: Template Loops
  // ==========================================================
  window.initLoopsSimulation = function () {
    const editor = document.getElementById('loop-template-editor');
    const preview = document.getElementById('loop-rendered-output');
    const runBtn = document.getElementById('loop-run-btn');
    const stepBtn = document.getElementById('loop-step-btn');
    const resetDataBtn = document.getElementById('loop-reset-data-btn');
    const clearDataBtn = document.getElementById('loop-clear-data-btn');
    const statusPill = document.getElementById('loop-challenge-status');
    const stepperInfo = document.getElementById('loop-stepper-info');
    const feedbackPill = document.getElementById('loop-render-feedback');

    if (!editor || !preview) return;

    const defaultItems = [
      { id: 1, title: 'Introduction to Template Variables', status: 'Completed', level: 'Beginner' },
      { id: 2, title: 'Template Inheritance using Base Templates', status: 'In Progress', level: 'Intermediate' },
      { id: 3, title: 'Rendering Data using Template Loops', status: 'Active Lab', level: 'Intermediate' },
      { id: 4, title: 'Formatting Output using Template Filters', status: 'Upcoming', level: 'Advanced' }
    ];

    let currentItems = JSON.parse(JSON.stringify(defaultItems));
    let stepIndex = -1;
    let activeTask = 1;

    const starterCode = `<table style="width:100%;border-collapse:collapse;font-size:14px;">
  <thead>
    <tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;text-align:left;">
      <th style="padding:8px 10px;">#</th>
      <th style="padding:8px 10px;">Experiment</th>
      <th style="padding:8px 10px;">Status</th>
    </tr>
  </thead>
  <tbody>
  {% for exp in experiments %}
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 10px;font-weight:bold;">____</td>
      <td style="padding:8px 10px;color:#337ab7;">{{ exp.title }}</td>
      <td style="padding:8px 10px;">{{ exp.status }}</td>
    </tr>
  {% empty %}
    <tr>
      <td colspan="3" style="padding:16px;text-align:center;color:#b45309;background:#fffbeb;">
        No experiments found! (Rendered by {% empty %})
      </td>
    </tr>
  {% endfor %}
  </tbody>
</table>`;

    function run(stepLimit, showFeedback) {
      const code = editor.value;
      const context = {
        experiments: stepLimit !== undefined ? currentItems.slice(0, stepLimit) : currentItems
      };

      const html = renderDjangoTemplate(code, context);
      preview.innerHTML = html;

      if (stepperInfo) {
        if (currentItems.length === 0) {
          stepperInfo.innerHTML = '<span class="sim-empty-highlight">Collection is empty. The {% empty %} fallback block is active.</span>';
        } else if (stepLimit !== undefined && stepLimit > 0) {
          const curr = currentItems[stepLimit - 1];
          stepperInfo.innerHTML = `
            <div class="sim-loop-vars">
              <span class="sim-loop-var-badge">forloop.counter = ${stepLimit}</span>
              <span class="sim-loop-var-badge">forloop.counter0 = ${stepLimit - 1}</span>
              <span class="sim-loop-var-badge">forloop.first = ${stepLimit === 1 ? 'True' : 'False'}</span>
              <span class="sim-loop-var-badge">forloop.last = ${stepLimit === currentItems.length ? 'True' : 'False'}</span>
              <span style="font-size:12px;color:#475569;">Active Item: <strong>${curr.title}</strong></span>
            </div>`;
        } else {
          stepperInfo.innerHTML = `<span style="font-size:12px;color:#64748b;">Rendering all <strong>${currentItems.length}</strong> items. Click "Step Next Item" to inspect loop iterations one by one.</span>`;
        }
      }

      checkChallenge(code);
      if (showFeedback && feedbackPill) {
        flashRenderFeedback(feedbackPill);
      }
    }

    function checkChallenge(code) {
      if (!statusPill) return;
      if (activeTask === 1) {
        const hasCounter = /forloop\.counter\b/.test(code);
        if (hasCounter) {
          statusPill.className = 'sim-challenge-status sim-status-passed';
          statusPill.innerText = 'Completed: Used {{ forloop.counter }} to number rows.';
        } else {
          statusPill.className = 'sim-challenge-status sim-status-pending';
          statusPill.innerText = 'Task 1 (In Progress): Replace ____ with {{ forloop.counter }} in the table row.';
        }
      } else if (activeTask === 2) {
        if (currentItems.length === 0 && /{%\s*empty\s*%}/.test(code)) {
          statusPill.className = 'sim-challenge-status sim-status-passed';
          statusPill.innerText = 'Completed: Verified {% empty %} fallback with empty collection.';
        } else {
          statusPill.className = 'sim-challenge-status sim-status-pending';
          statusPill.innerText = 'Task 2 (In Progress): Click "Clear Items" to test {% empty %} branch.';
        }
      } else if (activeTask === 3) {
        if (/forloop\.first\b/.test(code) || /forloop\.last\b/.test(code)) {
          statusPill.className = 'sim-challenge-status sim-status-passed';
          statusPill.innerText = 'Completed: Used forloop condition tag.';
        } else {
          statusPill.className = 'sim-challenge-status sim-status-pending';
          statusPill.innerText = 'Task 3 (In Progress): Add {% if forloop.first %} condition.';
        }
      }
    }

    document.querySelectorAll('[data-loop-task]').forEach((pill) => {
      pill.addEventListener('click', function () {
        document.querySelectorAll('[data-loop-task]').forEach((p) => p.classList.remove('active'));
        this.classList.add('active');
        activeTask = parseInt(this.getAttribute('data-loop-task'), 10);
        const desc = document.getElementById('loop-task-desc');
        if (desc) {
          if (activeTask === 1) desc.innerText = 'Task 1: Replace ____ with {{ forloop.counter }} to number the rows starting from 1.';
          if (activeTask === 2) desc.innerText = 'Task 2: Click "Clear Items" to verify the {% empty %} fallback block renders.';
          if (activeTask === 3) desc.innerText = 'Task 3: Add {% if forloop.first %} (First){% endif %} to highlight the first experiment.';
        }
        run(undefined, false);
      });
    });

    if (runBtn) {
      runBtn.addEventListener('click', () => {
        stepIndex = -1;
        run(undefined, true);
      });
    }

    if (stepBtn) {
      stepBtn.addEventListener('click', () => {
        if (currentItems.length === 0) return;
        stepIndex = (stepIndex + 1) % (currentItems.length + 1);
        if (stepIndex === 0) stepIndex = 1;
        run(stepIndex, true);
      });
    }

    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => {
        currentItems = [];
        stepIndex = -1;
        run(undefined, true);
      });
    }

    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        currentItems = JSON.parse(JSON.stringify(defaultItems));
        editor.value = starterCode;
        stepIndex = -1;
        run(undefined, true);
      });
    }

    editor.addEventListener('input', () => run(undefined, false));
    run(undefined, false);
  };

  // ==========================================================
  // Simulation 4: Template Filters
  // ==========================================================
  window.initFiltersSimulation = function () {
    const editor = document.getElementById('flt-template-editor');
    const preview = document.getElementById('flt-rendered-output');
    const pipeline = document.getElementById('flt-pipeline');
    const runBtn = document.getElementById('flt-run-btn');
    const resetBtn = document.getElementById('flt-reset-btn');
    const statusPill = document.getElementById('flt-challenge-status');
    const feedbackPill = document.getElementById('flt-render-feedback');

    if (!editor || !preview) return;

    let activeTask = 1;

    const sampleContext = {
      student_name: 'anurag vedak',
      joined_date: '2026-10-04',
      bio: 'Django templates separate presentation from business logic using variables, loops, filters, and inheritance.',
      missing_phone: '',
      course_fee: 15000
    };

    const starterCode = `<div class="sim-rendered-card">
  <h3>Learner Profile</h3>
  <p><strong>Student Name:</strong> {{ student_name }}</p>
  <p><strong>Bio:</strong> {{ bio }}</p>
  <p><strong>Contact Phone:</strong> {{ missing_phone }}</p>
</div>`;

    function run(showFeedback) {
      const code = editor.value;
      const html = renderDjangoTemplate(code, sampleContext);
      preview.innerHTML = html;

      // Extract filter transformations for pipeline visualizer
      if (pipeline) {
        const matches = [...code.matchAll(/\{\{\s*(\w+)\s*(\|\s*[^}]+)\s*\}\}/g)];
        if (matches.length > 0) {
          let pipeHtml = '';
          matches.slice(0, 3).forEach((m) => {
            const rawKey = m[1];
            const filterChain = m[2];
            const rawVal = sampleContext[rawKey] !== undefined ? sampleContext[rawKey] : '';
            const filteredVal = renderDjangoTemplate(`{{ ${rawKey}${filterChain} }}`, sampleContext);

            pipeHtml += `
              <div class="sim-pipeline-flow">
                <span class="sim-pipeline-node raw">Input: "${rawVal}"</span>
                <span class="sim-pipeline-arrow">&rarr;</span>
                <span class="sim-pipeline-node filter">${filterChain}</span>
                <span class="sim-pipeline-arrow">&rarr;</span>
                <span class="sim-pipeline-node result">Output: "${filteredVal}"</span>
              </div>`;
          });
          pipeline.innerHTML = pipeHtml;
        } else {
          pipeline.innerHTML = '<span style="font-size:12px;color:#64748b;">No filters applied yet. Type <code>|title</code> or <code>|upper</code> after <code>student_name</code> to see the transformation pipeline.</span>';
        }
      }

      checkChallenge(code);
      if (showFeedback && feedbackPill) {
        flashRenderFeedback(feedbackPill);
      }
    }

    function checkChallenge(code) {
      if (!statusPill) return;
      if (activeTask === 1) {
        if (/student_name\s*\|\s*(title|upper|capfirst)/.test(code)) {
          statusPill.className = 'sim-challenge-status sim-status-passed';
          statusPill.innerText = 'Completed: Applied text filter to {{ student_name }}.';
        } else {
          statusPill.className = 'sim-challenge-status sim-status-pending';
          statusPill.innerText = 'Task 1 (In Progress): Apply |title or |upper to {{ student_name }} (e.g. {{ student_name|title }}).';
        }
      } else if (activeTask === 2) {
        if (/bio\s*\|\s*(truncatechars|truncatewords)/.test(code)) {
          statusPill.className = 'sim-challenge-status sim-status-passed';
          statusPill.innerText = 'Completed: Truncated bio text using filter.';
        } else {
          statusPill.className = 'sim-challenge-status sim-status-pending';
          statusPill.innerText = 'Task 2 (In Progress): Apply |truncatechars:35 or |truncatewords:6 to {{ bio }}.';
        }
      } else if (activeTask === 3) {
        if (/missing_phone\s*\|\s*default/.test(code)) {
          statusPill.className = 'sim-challenge-status sim-status-passed';
          statusPill.innerText = 'Completed: Applied default fallback to missing_phone.';
        } else {
          statusPill.className = 'sim-challenge-status sim-status-pending';
          statusPill.innerText = 'Task 3 (In Progress): Apply |default:"Not provided" to {{ missing_phone }}.';
        }
      }
    }

    document.querySelectorAll('[data-flt-task]').forEach((pill) => {
      pill.addEventListener('click', function () {
        document.querySelectorAll('[data-flt-task]').forEach((p) => p.classList.remove('active'));
        this.classList.add('active');
        activeTask = parseInt(this.getAttribute('data-flt-task'), 10);
        const desc = document.getElementById('flt-task-desc');
        if (desc) {
          if (activeTask === 1) desc.innerText = 'Task 1: Format student_name in Title Case or Uppercase using |title or |upper.';
          if (activeTask === 2) desc.innerText = 'Task 2: Truncate the long bio using |truncatechars:35 or |truncatewords:6.';
          if (activeTask === 3) desc.innerText = 'Task 3: Provide a graceful fallback for missing_phone using |default:"Not provided".';
        }
        run(false);
      });
    });

    if (runBtn) {
      runBtn.addEventListener('click', () => run(true));
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        editor.value = starterCode;
        run(false);
      });
    }

    editor.addEventListener('input', () => run(false));
    run(false);
  };

  // Auto-Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('var-template-editor')) window.initVariablesSimulation();
    if (document.getElementById('inh-child-editor')) window.initInheritanceSimulation();
    if (document.getElementById('loop-template-editor')) window.initLoopsSimulation();
    if (document.getElementById('flt-template-editor')) window.initFiltersSimulation();
  });
})();
