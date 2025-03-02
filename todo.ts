interface TodoItem {
    id: number;
    task: string;
    completed: boolean;
    dueDate: Date;
}

class TodoList {
    private todos: TodoItem[] = [];
    private nextId: number = 1;
    private currentFilter: 'all' | 'completed' | 'active' = 'all';

    addTodo(task: string, dueDate: Date): void {
        this.todos.push({
            id: this.nextId++,
            task,
            completed: false,
            dueDate
        });
        this.saveToLocalStorage();
        this.renderTodos();
    }

    completeTodo(id: number): void {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.renderTodos();
        }
    }

    removeTodo(id: number): void {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToLocalStorage();
        this.renderTodos();
    }

    updateTodoTask(id: number, newTask: string): void {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.task = newTask;
            this.saveToLocalStorage();
            this.renderTodos();
        } else {
            this.showError(`Todo with ID ${id} not found`);
        }
    }

    filterTodos(type: 'all' | 'completed' | 'active'): void {
        this.currentFilter = type;
        this.renderTodos();
    }

    clearCompletedTodos(): void {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveToLocalStorage();
        this.renderTodos();
    }

    private get filteredTodos(): TodoItem[] {
        switch (this.currentFilter) {
            case 'completed': return this.todos.filter(t => t.completed);
            case 'active': return this.todos.filter(t => !t.completed);
            default: return this.todos;
        }
    }

    private saveToLocalStorage(): void {
        localStorage.setItem('todos', JSON.stringify(this.todos));
        localStorage.setItem('nextId', this.nextId.toString());
    }

    private loadFromLocalStorage(): void {
        const savedTodos = localStorage.getItem('todos');
        const savedId = localStorage.getItem('nextId');
        
        if (savedTodos) this.todos = JSON.parse(savedTodos);
        if (savedId) this.nextId = parseInt(savedId);
    }

    renderTodos(): void {
        const container = document.getElementById('todoList')!;
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

    showError(message: string): void {
        const errorDiv = document.getElementById('errorMessage')!;
        errorDiv.textContent = message;
        setTimeout(() => errorDiv.textContent = '', 3000);
    }
}

// Initialize and setup
const todoList = new TodoList();
todoList.loadFromLocalStorage();
todoList.renderTodos();

// Global functions for HTML interaction
declare global {
    interface Window {
        todoList: TodoList;
        addTodo: () => void;
        updateTodo: () => void;
        clearCompleted: () => void;
        filterTodos: () => void;
    }
}

window.todoList = todoList;

window.addTodo = () => {
    const taskInput = document.getElementById('taskInput') as HTMLInputElement;
    const dueDateInput = document.getElementById('dueDateInput') as HTMLInputElement;
    
    if (taskInput.value && dueDateInput.valueAsDate) {
        todoList.addTodo(taskInput.value, dueDateInput.valueAsDate);
        taskInput.value = '';
        dueDateInput.value = '';
    }
};

window.updateTodo = () => {
    const updateInput = document.getElementById('updateTaskInput') as HTMLInputElement;
    const idInput = document.getElementById('updateIdInput') as HTMLInputElement;
    
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
    const filterSelect = document.getElementById('filterSelect') as HTMLSelectElement;
    todoList.filterTodos(filterSelect.value as 'all' | 'completed' | 'active');
};