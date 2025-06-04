document.addEventListener('DOMContentLoaded', function() {
    // Создаем частицы для фона
    createParticles();
    
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
    
    // Регистрация пользователя
    registerBtn.addEventListener('click', () => {
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
        
        // Демонстрация успешной регистрации
        document.getElementById('registerSuccess').style.display = 'block';
        
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
    });
    
    // Вход пользователя
    loginBtn.addEventListener('click', () => {
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
        
        // Демонстрация успешного входа
        showWelcomeScreen(
            document.getElementById('loginEmail').value.split('@')[0] || 'Пользователь',
            document.getElementById('loginEmail').value
        );
    });
    
    // Выход пользователя
    logoutBtn.addEventListener('click', function() {
        loginContainer.style.display = 'block';
        welcomeContainer.style.display = 'none';
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
    });
    
    // Ссылка "Забыли пароль?"
    document.querySelector('.forgot-password').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Функция восстановления пароля не реализована в демо-версии');
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
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
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
});
