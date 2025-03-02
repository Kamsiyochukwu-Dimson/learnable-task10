class TodoList {
    constructor() {
        this.todos = [];
        this.nextId = 1;
        this.currentFilter = 'all';
    }
    addTodo(task, dueDate) {
        this.todos.push({
            id: this.nextId++,
            task,
            completed: false,
            dueDate
        });
        this.saveToLocalStorage();
        this.renderTodos();
    }
    completeTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.renderTodos();
        }
    }
    removeTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToLocalStorage();
        this.renderTodos();
    }
    updateTodoTask(id, newTask) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.task = newTask;
            this.saveToLocalStorage();
            this.renderTodos();
        }
        else {
            this.showError(`Todo with ID ${id} not found`);
        }
    }
    filterTodos(type) {
        this.currentFilter = type;
        this.renderTodos();
    }
    clearCompletedTodos() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveToLocalStorage();
        this.renderTodos();
    }
    get filteredTodos() {
        switch (this.currentFilter) {
            case 'completed': return this.todos.filter(t => t.completed);
            case 'active': return this.todos.filter(t => !t.completed);
            default: return this.todos;
        }
    }
    saveToLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
        localStorage.setItem('nextId', this.nextId.toString());
    }
    loadFromLocalStorage() {
        const savedTodos = localStorage.getItem('todos');
        const savedId = localStorage.getItem('nextId');
        if (savedTodos)
            this.todos = JSON.parse(savedTodos);
        if (savedId)
            this.nextId = parseInt(savedId);
    }
    renderTodos() {
        const container = document.getElementById('todoList');
        const filtered = this.filteredTodos;
        container.innerHTML = filtered.map(todo => `
            <div class="todo-item ${todo.completed ? 'completed' : ''}">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                    onchange="todoList.completeTodo(${todo.id})">
                <span>#${todo.id} - ${todo.task}</span>
                <span> (Due: ${todo.dueDate.toISOString().split('T')[0]})</span>
                <button onclick="todoList.removeTodo(${todo.id})">Remove</button>
            </div>
        `).join('');
    }
    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        setTimeout(() => errorDiv.textContent = '', 3000);
    }
}
// Initialize and setup
const todoList = new TodoList();
todoList.loadFromLocalStorage();
todoList.renderTodos();
window.todoList = todoList;
window.addTodo = () => {
    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    if (taskInput.value && dueDateInput.valueAsDate) {
        todoList.addTodo(taskInput.value, dueDateInput.valueAsDate);
        taskInput.value = '';
        dueDateInput.value = '';
    }
};
window.updateTodo = () => {
    const updateInput = document.getElementById('updateTaskInput');
    const idInput = document.getElementById('updateIdInput');
    if (updateInput.value && idInput.value) {
        todoList.updateTodoTask(parseInt(idInput.value), updateInput.value);
        updateInput.value = '';
        idInput.value = '';
    }
};
window.clearCompleted = () => {
    todoList.clearCompletedTodos();
};
window.filterTodos = () => {
    const filterSelect = document.getElementById('filterSelect');
    todoList.filterTodos(filterSelect.value);
};
