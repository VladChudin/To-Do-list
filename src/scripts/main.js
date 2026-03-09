'use strict';

// #region DOM
const list = document.querySelector('.task-list');
const input = document.querySelector('.task-input');
const form = document.querySelector('.task-form');
const filterButtons = document.querySelectorAll('[data-filter]');
const allTasks = document.querySelector('.all-tasks');
const activeTasks = document.querySelector('.active-tasks');
const completedTasks = document.querySelector('.completed-tasks');
const sort = document.querySelector('.sort-btn');
// #endregion

// #region STATE
const state = {
  todos: [],
  dateFilter: 'new',
  filter: 'all',
};
// #endregion

// #region LOCALSTORAGE
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(state.todos));
}

function loadTodos() {
  const data = localStorage.getItem('todos');

  if (!data) {
    return;
  }

  const parsed = JSON.parse(data);

  state.todos = parsed.map((todo) => {
    const task = new Task(todo.text);

    task.id = todo.id;
    task.completed = todo.completed;
    task.createdAt = new Date(todo.createdAt);
    task.important = todo.important;

    return task;
  });
}
// #endregion

// #region TASK
class Task {
  constructor(text) {
    this.id = Date.now();
    this.text = text;
    this.completed = false;
    this.createdAt = new Date();
    this.important = text.includes('!');
  }

  toggle() {
    this.completed = !this.completed;
  }

  toggleImportant() {
    this.important = !this.important;
  }
}
// #endregion

// #region SORT
sort.addEventListener('click', () => {
  state.dateFilter = state.dateFilter === 'new' ? 'old' : 'new';
  renderTodos();
});

function sortByDate(arr) {
  return arr.sort((a, b) => {
    if (state.dateFilter === 'new') {
      return b.createdAt - a.createdAt;
    } else {
      return a.createdAt - b.createdAt;
    }
  });
}
// #endregion

// #region STATS
function renderStats() {
  const total = state.todos.length;
  const completed = state.todos.filter((t) => t.completed).length;
  const active = total - completed;

  allTasks.textContent = `Count of tasks: ${total}`;
  activeTasks.textContent = `Active tasks: ${active}`;
  completedTasks.textContent = `Completed tasks: ${completed}`;
}
// #endregion

// #region FILTER
function getFilteredTodos() {
  switch (state.filter) {
    case 'active':
      return state.todos.filter((t) => !t.completed);
    case 'completed':
      return state.todos.filter((t) => t.completed);
    default:
      return state.todos;
  }
}

function highlightFilter() {
  filterButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === state.filter);
  });
}
// #endregion

// #region RENDER
function renderTodos() {
  list.innerHTML = '';
  input.focus();

  renderStats();
  highlightFilter();

  let filtered = getFilteredTodos();

  filtered = sortByDate(filtered);

  filtered.forEach((task) => {
    const li = document.createElement('li');

    li.innerHTML = `
      <span class="task-text">${task.text}</span>

      <button class="task-menu-btn">
        <img src="icons/dots.svg" alt="menu">
      </button>

      <div class="task-menu">
        <button data-action="edit">Edit</button>
        <button data-action="delete">Delete</button>
      </div>
    `;

    li.dataset.id = task.id;
    li.classList.add('task-item');

    if (task.completed) {
      li.classList.add('completed');
    }

    if (task.important) {
      li.classList.add('important');
    }

    list.appendChild(li);
  });
}
// #endregion

// #region ADD TASK
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = input.value.trim();

  if (!text) {
    return;
  }

  state.todos.push(new Task(text));

  saveTodos();

  input.value = '';

  renderTodos();
});
// #endregion

// #region LIST EVENTS
list.addEventListener('click', (e) => {
  const taskItem = e.target.closest('.task-item');

  if (!taskItem) {
    return;
  }

  const task = state.todos.find((t) => t.id === Number(taskItem.dataset.id));

  if (e.target.closest('.task-menu-btn')) {
    // eslint-disable-next-line no-shadow
    const taskItem = e.target.closest('.task-item');

    document.querySelectorAll('.task-item.menu-open').forEach((item) => {
      if (item !== taskItem) {
        item.classList.remove('menu-open');
      }
    });

    taskItem.classList.toggle('menu-open');

    return;
  }

  if (e.target.dataset.action === 'delete') {
    state.todos = state.todos.filter(
      (t) => t.id !== Number(taskItem.dataset.id),
    );

    saveTodos();
    renderTodos();

    return;
  }

  if (e.target.dataset.action === 'edit') {
    const textElement = taskItem.querySelector('.task-text');

    // eslint-disable-next-line no-shadow
    const input = document.createElement('input');

    input.value = task.text;
    input.classList.add('edit-input');

    textElement.replaceWith(input);

    input.focus();

    // eslint-disable-next-line no-shadow
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        task.text = input.value.trim() || task.text;

        saveTodos();
        renderTodos();
      }
    });

    return;
  }

  if (!e.target.closest('.task-menu')) {
    task.toggle();

    saveTodos();
    renderTodos();
  }
});
// #endregion

// #region FILTER BUTTONS
filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    state.filter = btn.dataset.filter;
    renderTodos();
  });
});
// #endregion

// #region CLOSE MENU
document.addEventListener('click', (e) => {
  const isMenuButton = e.target.closest('.task-menu-btn');
  const isMenu = e.target.closest('.task-menu');

  if (!isMenuButton && !isMenu) {
    document.querySelectorAll('.task-menu').forEach((menu) => {
      menu.classList.remove('show');
    });
  }
});
// #endregion

loadTodos();
renderTodos();
