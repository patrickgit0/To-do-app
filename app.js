/**
 * Taskflow - JavaScript Principal (app.js)
 * Desenvolvido em Vanilla JS para gerenciar autenticação e simulação de banco de dados no localStorage.
 */

// ==========================================
// 1. INICIALIZAÇÃO DO BANCO DE DADOS LOCAL
// ==========================================
const initDatabase = () => {
    // Inicializa a lista de usuários se não existir
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    // Inicializa a lista de tarefas se não existir
    if (!localStorage.getItem('todos')) {
        localStorage.setItem('todos', JSON.stringify([]));
    }
};

// Executa a inicialização do DB simulado
initDatabase();

// ==========================================
// 2. SELEÇÃO DE ELEMENTOS DO DOM
// ==========================================

// Telas
const loginScreen = document.getElementById('login-screen');
const registerScreen = document.getElementById('register-screen');
const mainScreen = document.getElementById('main-screen');

// Formulários e Inputs de Login
const loginForm = document.getElementById('login-form');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginEmailError = document.getElementById('login-email-error');
const loginPasswordError = document.getElementById('login-password-error');
const loginGeneralError = document.getElementById('login-general-error');
const loginErrorText = document.getElementById('login-error-text');

// Formulários e Inputs de Cadastro
const registerForm = document.getElementById('register-form');
const registerNameInput = document.getElementById('register-name');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const registerNameError = document.getElementById('register-name-error');
const registerEmailError = document.getElementById('register-email-error');
const registerPasswordError = document.getElementById('register-password-error');
const registerGeneralError = document.getElementById('register-general-error');
const registerErrorText = document.getElementById('register-error-text');

// Elementos da Tela Principal (Dashboard)
const userDisplayName = document.getElementById('user-display-name');
const userDisplayEmail = document.getElementById('user-display-email');
const logoutBtn = document.getElementById('logout-btn');

// Elementos do Painel To-Do
const todoForm = document.getElementById('todo-form');
const todoTitleInput = document.getElementById('todo-title');
const todoTypeSelect = document.getElementById('todo-type');
const todoDescriptionTextarea = document.getElementById('todo-description');
const todoTitleError = document.getElementById('todo-title-error');
const todoList = document.getElementById('todo-list');
const todoCounter = document.getElementById('todo-counter');

// Botões de Alternância de Tela
const goToRegisterBtn = document.getElementById('go-to-register');
const goToLoginBtn = document.getElementById('go-to-login');

// ==========================================
// 3. GERENCIAMENTO DE ESTADO E TELAS (Navegação)
// ==========================================

/**
 * Transição suave entre duas telas
 * @param {HTMLElement} fromScreen - Tela que será ocultada
 * @param {HTMLElement} toScreen - Tela que será exibida
 */
const transitionScreens = (fromScreen, toScreen) => {
    // Inicia o fade-out da tela atual
    fromScreen.classList.remove('scale-100', 'opacity-100');
    fromScreen.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
        fromScreen.classList.add('hidden');
        toScreen.classList.remove('hidden');

        // Pequeno atraso para engajar a transição de fade-in no navegador
        setTimeout(() => {
            toScreen.classList.remove('scale-95', 'opacity-0');
            toScreen.classList.add('scale-100', 'opacity-100');
        }, 50);
    }, 300);
};

/**
 * Verifica se há um usuário logado e exibe a tela correta ao carregar o app
 */
const checkAuthState = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        // Usuário logado: Exibe Dashboard diretamente
        userDisplayName.textContent = `Olá, ${currentUser.name}`;
        userDisplayEmail.textContent = currentUser.email;

        loginScreen.classList.add('hidden');
        registerScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden', 'scale-95', 'opacity-0');
        mainScreen.classList.add('scale-100', 'opacity-100');

        // Renderiza as tarefas deste usuário
        renderTodos();
    } else {
        // Nenhum usuário logado: Exibe Tela de Login
        mainScreen.classList.add('hidden');
        registerScreen.classList.add('hidden');
        loginScreen.classList.remove('hidden', 'scale-95', 'opacity-0');
        loginScreen.classList.add('scale-100', 'opacity-100');
    }
};

// ==========================================
// 4. AUXILIARES DE ERRO E VALIDAÇÃO
// ==========================================

/**
 * Exibe uma mensagem de erro inline para um campo de entrada
 * @param {HTMLInputElement} inputElement - O input associado
 * @param {HTMLSpanElement} errorSpan - O elemento span para o texto do erro
 * @param {string} message - A mensagem de erro
 */
const showError = (inputElement, errorSpan, message) => {
    errorSpan.textContent = message;
    errorSpan.classList.remove('hidden');
    inputElement.classList.remove('border-slate-700/50', 'focus:border-blue-500', 'focus:border-indigo-500');
    inputElement.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
};

/**
 * Remove o estado de erro de um campo de entrada
 * @param {HTMLInputElement} inputElement - O input associado
 * @param {HTMLSpanElement} errorSpan - O elemento span do erro
 */
const clearError = (inputElement, errorSpan) => {
    errorSpan.classList.add('hidden');
    errorSpan.textContent = '';
    inputElement.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');

    // Devolve as bordas padrão dependendo de qual form o campo pertence
    if (inputElement.id.startsWith('login')) {
        inputElement.classList.add('border-slate-700/50', 'focus:border-blue-500');
    } else if (inputElement.id.startsWith('register')) {
        inputElement.classList.add('border-slate-700/50', 'focus:border-indigo-500');
    } else {
        inputElement.classList.add('border-slate-700/50', 'focus:border-blue-500');
    }
};

/**
 * Limpa erros gerais de notificação de form
 * @param {HTMLElement} errorDiv - Div contendo o erro geral
 */
const clearGeneralError = (errorDiv) => {
    errorDiv.classList.add('hidden');
};

/**
 * Exibe erro geral no cabeçalho do form
 * @param {HTMLElement} errorDiv - Div do erro geral
 * @param {HTMLElement} errorTextSpan - Span do texto do erro geral
 * @param {string} message - Mensagem
 */
const showGeneralError = (errorDiv, errorTextSpan, message) => {
    errorTextSpan.textContent = message;
    errorDiv.classList.remove('hidden');
};

// ==========================================
// 5. LÓGICA DE GERENCIAMENTO DE TAREFAS (To-Do)
// ==========================================

/**
 * Renderiza as tarefas cadastradas do usuário logado na listagem
 */
const renderTodos = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const allTodos = JSON.parse(localStorage.getItem('todos')) || [];

    // Filtra as tarefas para mostrar apenas as do usuário atual
    const userTodos = allTodos.filter(todo => todo.userId.toLowerCase() === currentUser.email.toLowerCase());

    // Atualiza o contador de tarefas
    todoCounter.textContent = `${userTodos.length} ${userTodos.length === 1 ? 'tarefa' : 'tarefas'}`;

    if (userTodos.length === 0) {
        todoList.innerHTML = `
            <div class="flex flex-col items-center justify-center py-16 text-center text-slate-500 bg-slate-900/10 border border-slate-800/40 rounded-2xl p-6">
                <div class="w-12 h-12 bg-slate-800/50 border border-slate-700/30 rounded-full flex items-center justify-center text-slate-400 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                    </svg>
                </div>
                <p class="text-sm font-medium text-slate-400">Nenhuma tarefa cadastrada ainda.</p>
                <p class="text-xs text-slate-500 mt-1">Crie uma nova tarefa no painel lateral.</p>
            </div>
        `;
        return;
    }

    // Ordenação: Pendentes primeiro (falso), Concluídas no final (verdadeiro).
    // Dentro de cada grupo de status, as criadas mais recentemente vêm primeiro (maior timestamp).
    userTodos.sort((a, b) => {
        if (a.done === b.done) {
            return b.id - a.id;
        }
        return a.done ? 1 : -1;
    });

    // Mapeamento dos cards de tarefas
    todoList.innerHTML = userTodos.map(todo => {
        // Cores dos Badges dependendo da categoria
        let typeBadgeClass = '';
        if (todo.type === 'Trabalho') {
            typeBadgeClass = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
        } else if (todo.type === 'Pessoal') {
            typeBadgeClass = 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
        } else {
            typeBadgeClass = 'bg-green-500/10 text-green-400 border border-green-500/20';
        }

        // Classes de estilo condicional de conclusão
        const cardClass = todo.done
            ? 'bg-slate-900/20 border-slate-800/40 opacity-60 transition-all duration-300'
            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700/80 transition-all duration-300';

        const titleClass = todo.done
            ? 'line-through text-slate-500 font-medium'
            : 'text-slate-100 font-semibold';

        const descClass = todo.done
            ? 'line-through text-slate-600'
            : 'text-slate-400';

        // Renderiza o botão ou o status de concluído
        const actionButtonHtml = todo.done
            ? `
            <div class="flex items-center space-x-1 bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-xl text-xs font-semibold select-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>Concluída</span>
            </div>
            `
            : `
            <button onclick="completeTodo(${todo.id})" class="bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold transition duration-200 flex items-center space-x-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Concluir</span>
            </button>
            `;

        // Renderiza a descrição somente se existir
        const descriptionHtml = todo.description
            ? `<p class="text-sm ${descClass} mt-1.5 leading-relaxed break-words">${todo.description}</p>`
            : '';

        return `
            <div class="border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardClass}">
                <div class="space-y-1 max-w-xl">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${typeBadgeClass}">
                            ${todo.type}
                        </span>
                        <h4 class="text-base ${titleClass} break-words">${todo.title}</h4>
                    </div>
                    ${descriptionHtml}
                </div>
                
                <div class="flex items-center space-x-3 self-end md:self-center flex-shrink-0">
                    ${actionButtonHtml}
                    <button onclick="deleteTodo(${todo.id})" class="text-slate-500 hover:text-red-400 p-2 rounded-xl hover:bg-slate-800/60 transition duration-150" title="Excluir tarefa">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
};

/**
 * Marca uma tarefa específica como concluída no localStorage
 * @param {number} todoId - O timestamp/id do To-Do
 */
window.completeTodo = (todoId) => {
    const allTodos = JSON.parse(localStorage.getItem('todos')) || [];
    const todoIndex = allTodos.findIndex(todo => todo.id === todoId);

    if (todoIndex !== -1) {
        allTodos[todoIndex].done = true;
        localStorage.setItem('todos', JSON.stringify(allTodos));
        renderTodos();
    }
};

/**
 * Deleta uma tarefa específica do localStorage
 * @param {number} todoId - O timestamp/id do To-Do
 */
window.deleteTodo = (todoId) => {
    const allTodos = JSON.parse(localStorage.getItem('todos')) || [];
    const filteredTodos = allTodos.filter(todo => todo.id !== todoId);

    localStorage.setItem('todos', JSON.stringify(filteredTodos));
    renderTodos();
};

// ==========================================
// 6. PROCESSAMENTO DE CADASTRO
// ==========================================

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = registerNameInput.value.trim();
    const email = registerEmailInput.value.trim();
    const password = registerPasswordInput.value;

    let hasError = false;

    clearError(registerNameInput, registerNameError);
    clearError(registerEmailInput, registerEmailError);
    clearError(registerPasswordInput, registerPasswordError);
    clearGeneralError(registerGeneralError);

    if (!name) {
        showError(registerNameInput, registerNameError, 'O nome é obrigatório.');
        hasError = true;
    }

    if (!email) {
        showError(registerEmailInput, registerEmailError, 'O e-mail é obrigatório.');
        hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        showError(registerEmailInput, registerEmailError, 'Insira um formato de e-mail válido.');
        hasError = true;
    }

    if (!password) {
        showError(registerPasswordInput, registerPasswordError, 'A senha é obrigatória.');
        hasError = true;
    } else if (password.length < 6) {
        showError(registerPasswordInput, registerPasswordError, 'A senha deve ter pelo menos 6 caracteres.');
        hasError = true;
    }

    if (hasError) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const emailExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());

    if (emailExists) {
        showGeneralError(registerGeneralError, registerErrorText, 'Este e-mail já está cadastrado.');
        showError(registerEmailInput, registerEmailError, 'E-mail em uso.');
        return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    const currentUser = { name, email };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    userDisplayName.textContent = `Olá, ${currentUser.name}`;
    userDisplayEmail.textContent = currentUser.email;

    registerForm.reset();

    // Renderiza a lista de tarefas vazia para este novo usuário
    renderTodos();

    transitionScreens(registerScreen, mainScreen);
});

// ==========================================
// 7. PROCESSAMENTO DE LOGIN
// ==========================================

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value;

    let hasError = false;

    clearError(loginEmailInput, loginEmailError);
    clearError(loginPasswordInput, loginPasswordError);
    clearGeneralError(loginGeneralError);

    if (!email) {
        showError(loginEmailInput, loginEmailError, 'O e-mail é obrigatório.');
        hasError = true;
    }

    if (!password) {
        showError(loginPasswordInput, loginPasswordError, 'A senha é obrigatória.');
        hasError = true;
    }

    if (hasError) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const matchedUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());

    if (!matchedUser) {
        showGeneralError(loginGeneralError, loginErrorText, 'Esta conta não existe em nossa base de dados.');
        showError(loginEmailInput, loginEmailError, 'E-mail não cadastrado.');
        return;
    }

    if (matchedUser.password !== password) {
        showGeneralError(loginGeneralError, loginErrorText, 'Senha incorreta. Tente novamente.');
        showError(loginPasswordInput, loginPasswordError, 'Senha incorreta.');
        return;
    }

    const currentUser = { name: matchedUser.name, email: matchedUser.email };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    userDisplayName.textContent = `Olá, ${currentUser.name}`;
    userDisplayEmail.textContent = currentUser.email;

    loginForm.reset();

    // Renderiza as tarefas do usuário que acabou de logar
    renderTodos();

    transitionScreens(loginScreen, mainScreen);
});

// ==========================================
// 8. CRIAÇÃO DE NOVA TAREFA (To-Do)
// ==========================================

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const title = todoTitleInput.value.trim();
    const type = todoTypeSelect.value;
    const description = todoDescriptionTextarea.value.trim();

    clearError(todoTitleInput, todoTitleError);

    // Validação de título obrigatório
    if (!title) {
        showError(todoTitleInput, todoTitleError, 'O título da tarefa é obrigatório.');
        todoTitleInput.focus();
        return;
    }

    // Nova tarefa no formato definido
    const newTodo = {
        id: Date.now(),
        userId: currentUser.email,
        title,
        type,
        description,
        done: false
    };

    // Obter e salvar no localStorage
    const allTodos = JSON.parse(localStorage.getItem('todos')) || [];
    allTodos.push(newTodo);
    localStorage.setItem('todos', JSON.stringify(allTodos));

    // Resetar campos e erros
    todoForm.reset();
    clearError(todoTitleInput, todoTitleError);

    // Recarregar a lista de tarefas
    renderTodos();
});

// Limpa erro do título do To-Do inline enquanto o usuário digita
todoTitleInput.addEventListener('input', () => clearError(todoTitleInput, todoTitleError));

// ==========================================
// 9. PROCESSAMENTO DE LOGOUT
// ==========================================

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');

    loginEmailInput.value = '';
    loginPasswordInput.value = '';
    clearError(loginEmailInput, loginEmailError);
    clearError(loginPasswordInput, loginPasswordError);
    clearGeneralError(loginGeneralError);

    // Limpar o formulário de tarefas e sua listagem
    todoForm.reset();
    clearError(todoTitleInput, todoTitleError);
    todoList.innerHTML = '';

    transitionScreens(mainScreen, loginScreen);
});

// ==========================================
// 10. OUVINTES PARA EVENTOS DE DIGITAÇÃO (Real-time Feedback)
// ==========================================

loginEmailInput.addEventListener('input', () => clearError(loginEmailInput, loginEmailError));
loginPasswordInput.addEventListener('input', () => clearError(loginPasswordInput, loginPasswordError));

registerNameInput.addEventListener('input', () => clearError(registerNameInput, registerNameError));
registerEmailInput.addEventListener('input', () => clearError(registerEmailInput, registerEmailError));
registerPasswordInput.addEventListener('input', () => clearError(registerPasswordInput, registerPasswordError));

// ==========================================
// 11. EVENTOS DE ALTERNÂNCIA DE TELA
// ==========================================

goToRegisterBtn.addEventListener('click', () => {
    loginForm.reset();
    clearError(loginEmailInput, loginEmailError);
    clearError(loginPasswordInput, loginPasswordError);
    clearGeneralError(loginGeneralError);

    transitionScreens(loginScreen, registerScreen);
});

goToLoginBtn.addEventListener('click', () => {
    registerForm.reset();
    clearError(registerNameInput, registerNameError);
    clearError(registerEmailInput, registerEmailError);
    clearError(registerPasswordInput, registerPasswordError);
    clearGeneralError(registerGeneralError);

    transitionScreens(registerScreen, loginScreen);
});

// ==========================================
// 12. VERIFICAÇÃO INICIAL AO CARREGAR PÁGINA
// ==========================================
document.addEventListener('DOMContentLoaded', checkAuthState);
