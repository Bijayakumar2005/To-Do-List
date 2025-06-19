document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const countElement = document.getElementById('count');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const emptyState = document.getElementById('emptyState');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize
    renderTasks();
    updateEmptyState();
    
    // Event Listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // Task List Events (delegation)
    taskList.addEventListener('click', function(e) {
        // Handle delete button clicks
        if (e.target.closest('.delete-btn')) {
            const taskItem = e.target.closest('.task-item');
            deleteTask(parseInt(taskItem.dataset.id));
            return;
        }
        
        // Handle checkbox and text clicks
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const taskId = parseInt(taskItem.dataset.id);
        
        if (e.target.classList.contains('task-checkbox') || e.target.classList.contains('task-text')) {
            toggleTaskCompletion(taskId);
        }
    });
    
    // Filter Buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
    
    // Functions
    function addTask() {
        const text = taskInput.value.trim();
        if (text) {
            const newTask = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            tasks.unshift(newTask);
            saveTasks();
            taskInput.value = '';
            renderTasks();
            updateEmptyState();
            
            // Animation feedback
            addBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
            setTimeout(() => {
                addBtn.innerHTML = '<i class="fas fa-plus"></i> Add';
            }, 1000);
        }
    }
    
    function renderTasks() {
        taskList.innerHTML = '';
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
        });
        
        if (filteredTasks.length === 0) {
            updateEmptyState();
            return;
        }
        
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;
            
            li.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${task.text}</span>
                </div>
                <button class="delete-btn" title="Delete task" aria-label="Delete task">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            
            taskList.appendChild(li);
        });
        
        updateTaskCount();
    }
    
    function toggleTaskCompletion(taskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
    }
    
    function deleteTask(taskId) {
        const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (taskItem) {
            taskItem.style.transform = 'translateX(100px)';
            taskItem.style.opacity = '0';
            setTimeout(() => {
                tasks = tasks.filter(task => task.id !== taskId);
                saveTasks();
                renderTasks();
                updateEmptyState();
            }, 300);
        }
    }
    
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateEmptyState();
    }
    
    function updateTaskCount() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        countElement.textContent = activeTasks;
    }
    
    function updateEmptyState() {
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
    });

    if (filteredTasks.length === 0) {
        emptyState.style.display = 'flex'; 
        taskList.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        taskList.style.display = 'block'; 
    }
}
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});