document.addEventListener('DOMContentLoaded', function() {
    // Создаем частицы для фона
    createParticles();
    
    // Инициализация базы данных
    let db;
    const DB_NAME = 'AuthDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'users';
    
    // Элементы DOM
    const tabs = document.querySelectorAll('.tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginContainer = document.getElementById('loginContainer');
    const welcomeContainer = document.getElementById('welcomeContainer');
    const userNameSpan = document.getElementById('userName');
    const userEmailSpan = document.getElementById('userEmail');
    const userCountEl = document.getElementById('userCount');
    const dbSizeEl = document.getElementById('dbSize');
    
    // Переключение между вкладками
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            loginForm.classList.remove('active');
            registerForm.classList.remove('active');
            
            if (tab.dataset.tab === 'login') {
                loginForm.classList.add('active');
            } else {
                registerForm.classList.add('active');
            }
        });
    });
    
    // Инициализация базы данных
    const initDB = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = (event) => {
                console.error("Ошибка открытия базы данных:", event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                db = event.target.result;
                console.log("База данных успешно открыта");
                updateDBStats();
                resolve(db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'email' });
                    store.createIndex('name', 'name', { unique: false });
                    console.log("Хранилище объектов создано");
                }
            };
        });
    };
    
    // Добавление пользователя
    const addUser = (user) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            const request = store.add(user);
            
            request.onsuccess = () => {
                console.log("Пользователь добавлен:", user.email);
                resolve();
            };
            
            request.onerror = (event) => {
                console.error("Ошибка добавления пользователя:", event.target.error);
                reject(event.target.error);
            };
        });
    };
    
    // Получение пользователя по email
    const getUser = (email) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            
            const request = store.get(email);
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onerror = (event) => {
                console.error("Ошибка получения пользователя:", event.target.error);
                reject(event.target.error);
            };
        });
    };
    
    // Получение всех пользователей
    const getAllUsers = () => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const users = [];
            
            const request = store.openCursor();
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    users.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(users);
                }
            };
            
            request.onerror = (event) => {
                console.error("Ошибка получения пользователей:", event.target.error);
                reject(event.target.error);
            };
        });
    };
    
    // Обновление статистики БД
    const updateDBStats = async () => {
        try {
            const users = await getAllUsers();
            userCountEl.textContent = users.length;
            
            // Оценка размера БД (примерная)
            const size = JSON.stringify(users).length;
            dbSizeEl.textContent = Math.round(size / 1024 * 100) / 100 + " KB";
        } catch (error) {
            console.error("Ошибка обновления статистики:", error);
        }
    };
    
    // Регистрация пользователя
    registerBtn.addEventListener('click', async () => {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();
        const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();
        
        // Валидация
        let isValid = true;
        
        if (!name) {
            document.getElementById('registerNameError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('registerNameError').style.display = 'none';
        }
        
        if (!email || !validateEmail(email)) {
            document.getElementById('registerEmailError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('registerEmailError').style.display = 'none';
        }
        
        if (password.length < 6) {
            document.getElementById('registerPasswordError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('registerPasswordError').style.display = 'none';
        }
        
        if (password !== confirmPassword) {
            document.getElementById('registerConfirmPasswordError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('registerConfirmPasswordError').style.display = 'none';
        }
        
        if (!isValid) return;
        
        try {
            // Проверка, существует ли пользователь
            const existingUser = await getUser(email);
            if (existingUser) {
                alert('Пользователь с таким email уже зарегистрирован');
                return;
            }
            
            // Добавление пользователя
            await addUser({
                name: name,
                email: email,
                password: password // В реальном приложении храните хеш пароля!
            });
            
            // Показываем сообщение об успехе
            document.getElementById('registerSuccess').style.display = 'block';
            
            // Обновляем статистику
            await updateDBStats();
            
            // Очищаем форму
            setTimeout(() => {
                document.getElementById('registerSuccess').style.display = 'none';
                document.getElementById('registerName').value = '';
                document.getElementById('registerEmail').value = '';
                document.getElementById('registerPassword').value = '';
                document.getElementById('registerConfirmPassword').value = '';
                
                // Переключаем на вкладку входа
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelector('[data-tab="login"]').classList.add('active');
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
            }, 2000);
            
        } catch (error) {
            console.error("Ошибка регистрации:", error);
            alert('Произошла ошибка при регистрации');
        }
    });
    
    // Вход пользователя
    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        
        // Валидация
        let isValid = true;
        
        if (!email || !validateEmail(email)) {
            document.getElementById('loginEmailError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('loginEmailError').style.display = 'none';
        }
        
        if (password.length < 6) {
            document.getElementById('loginPasswordError').style.display = 'block';
            isValid = false;
        } else {
            document.getElementById('loginPasswordError').style.display = 'none';
        }
        
        if (!isValid) return;
        
        try {
            // Получаем пользователя
            const user = await getUser(email);
            
            if (!user) {
                alert('Пользователь с таким email не найден');
                return;
            }
            
            if (user.password !== password) {
                alert('Неверный пароль');
                return;
            }
            
            // Успешная авторизация
            showWelcomeScreen(user.name, user.email);
            
        } catch (error) {
            console.error("Ошибка входа:", error);
            alert('Произошла ошибка при входе');
        }
    });
    
    // Выход пользователя
    logoutBtn.addEventListener('click', function() {
        // Показываем форму входа
        loginContainer.style.display = 'block';
        welcomeContainer.style.display = 'none';
        
        // Очищаем поля
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
    });
    
    // Ссылка "Забыли пароль?"
    document.querySelector('.forgot-password').addEventListener('click', function(e) {
        e.preventDefault();
        alert('В демонстрационной версии восстановление пароля недоступно. Используйте зарегистрированный аккаунт.');
    });
    
    // Показать экран приветствия
    function showWelcomeScreen(name, email) {
        userNameSpan.textContent = name;
        userEmailSpan.textContent = email;
        loginContainer.style.display = 'none';
        welcomeContainer.style.display = 'block';
    }
    
    // Валидация email
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Создание частиц для фона
    function createParticles() {
        const container = document.getElementById('particles');
        const count = 50;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = `${Math.random() * 5 + 2}px`;
            particle.style.height = particle.style.width;
            particle.style.background = `rgba(110, 72, 170, ${Math.random() * 0.5 + 0.1})`;
            particle.style.borderRadius = '50%';
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animation = `float ${Math.random() * 10 + 5}s infinite ease-in-out`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            container.appendChild(particle);
        }
    }
    
    // Инициализация приложения
    async function initApp() {
        await initDB();
        await updateDBStats();
    }
    
    // Запуск приложения
    initApp();
});
