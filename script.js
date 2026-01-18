// グローバル変数
let todos = [];
let currentFilter = 'all';
let editingId = null;

// DOM要素
const todoInput = document.getElementById('todoInput');
const prioritySelect = document.getElementById('prioritySelect');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderTodos();
    updateStats();
});

// TODOの追加
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

function addTodo() {
    const text = todoInput.value.trim();
    const priority = prioritySelect.value;

    if (text === '') {
        alert('タスクを入力してください');
        return;
    }

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        priority: priority
    };

    todos.push(newTodo);
    todoInput.value = '';
    prioritySelect.value = 'medium';

    saveToLocalStorage();
    renderTodos();
    updateStats();
}

// TODOの削除
function deleteTodo(id) {
    if (confirm('このタスクを削除しますか?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveToLocalStorage();
        renderTodos();
        updateStats();
    }
}

// 完了状態の切り替え
function toggleComplete(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveToLocalStorage();
        renderTodos();
        updateStats();
    }
}

// 編集モードの開始
function startEdit(id) {
    editingId = id;
    renderTodos();
}

// 編集のキャンセル
function cancelEdit() {
    editingId = null;
    renderTodos();
}

// TODOの保存（編集後）
function saveTodo(id) {
    const inputElement = document.querySelector(`#edit-input-${id}`);
    const newText = inputElement.value.trim();

    if (newText === '') {
        alert('タスクを入力してください');
        return;
    }

    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.text = newText;
        editingId = null;
        saveToLocalStorage();
        renderTodos();
    }
}

// フィルタの設定
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// TODOのレンダリング
function renderTodos() {
    todoList.innerHTML = '';

    const filteredTodos = getFilteredTodos();

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item priority-${todo.priority} ${todo.completed ? 'completed' : ''}`;

        const isEditing = editingId === todo.id;

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text ${isEditing ? 'editing' : ''}">${todo.text}</span>
            <input type="text" id="edit-input-${todo.id}" class="todo-input ${isEditing ? 'active' : ''}" value="${todo.text}">
            <span class="priority-badge ${todo.priority}">${getPriorityText(todo.priority)}</span>
            <div class="todo-actions">
                ${isEditing ? `
                    <button class="save-btn">保存</button>
                    <button class="cancel-btn">キャンセル</button>
                ` : `
                    <button class="edit-btn">編集</button>
                    <button class="delete-btn">削除</button>
                `}
            </div>
        `;

        // チェックボックスのイベント
        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => toggleComplete(todo.id));

        if (isEditing) {
            // 保存ボタン
            const saveBtn = li.querySelector('.save-btn');
            saveBtn.addEventListener('click', () => saveTodo(todo.id));

            // キャンセルボタン
            const cancelBtn = li.querySelector('.cancel-btn');
            cancelBtn.addEventListener('click', cancelEdit);

            // Enterキーで保存
            const editInput = li.querySelector(`#edit-input-${todo.id}`);
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveTodo(todo.id);
                }
            });
            editInput.focus();
        } else {
            // 編集ボタン
            const editBtn = li.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => startEdit(todo.id));

            // 削除ボタン
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        }

        todoList.appendChild(li);
    });
}

// フィルタ済みTODOの取得
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// 優先度テキストの取得
function getPriorityText(priority) {
    switch (priority) {
        case 'high':
            return '高';
        case 'medium':
            return '中';
        case 'low':
            return '低';
        default:
            return '中';
    }
}

// 統計情報の更新
function updateStats() {
    const total = todos.length;
    const active = todos.filter(todo => !todo.completed).length;
    const completed = todos.filter(todo => todo.completed).length;

    document.getElementById('totalCount').textContent = `全て: ${total}`;
    document.getElementById('activeCount').textContent = `未完了: ${active}`;
    document.getElementById('completedCount').textContent = `完了: ${completed}`;
}

// localStorageへの保存
function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// localStorageからの読み込み
function loadFromLocalStorage() {
    const stored = localStorage.getItem('todos');
    if (stored) {
        todos = JSON.parse(stored);
    }
}
