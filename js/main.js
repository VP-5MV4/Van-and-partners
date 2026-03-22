// ==================== ИНИЦИАЛИЗАЦИЯ ====================
AOS.init({ duration: 800, once: true });

(function() { emailjs.init('wPCLTrIcEBzfItGS0'); })();

// ==================== SUPABASE КОНФИГУРАЦИЯ ====================
const SUPABASE_URL = 'https://qcumtfdgasjnbwlypezh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JqqF_yL_7Lfj8bTH2Id2_A_68y9gpgv';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== ЗАГРУЗКА УСЛУГ ИЗ SUPABASE ====================
async function loadServices() {
    const container = document.getElementById('services-list');
    if (!container) return;

    const { data: categories } = await supabaseClient
        .from('categories')
        .select('id, name');
    
    const { data: services } = await supabaseClient
        .from('services')
        .select('name, category_id');

    if (!categories || categories.length === 0) {
        container.innerHTML = '<div class="col-12 text-center">Категории не найдены</div>';
        return;
    }

    const servicesByCategory = {};
    services.forEach(s => {
        if (!servicesByCategory[s.category_id]) {
            servicesByCategory[s.category_id] = [];
        }
        servicesByCategory[s.category_id].push(s.name);
    });
    
    let html = '';
    categories.forEach(cat => {
        const catServices = servicesByCategory[cat.id] || [];
        html += `
            <div class="col-md-4 mb-4">
                <div class="service-category">
                    <h3>${cat.name}</h3>
                    <ul>${catServices.map(name => `<li>${name}</li>`).join('')}</ul>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

loadServices();

// ==================== ВСПЛЫВАЮЩЕЕ СООБЩЕНИЕ (TOAST) ====================
function showToast(message, isError = false) {
    // Удаляем существующий toast, если есть
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Создаём новый toast
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    if (isError) {
        toast.classList.add('error');
    } else {
        toast.classList.add('success');
    }
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Показываем toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// ==================== ВАЛИДАЦИЯ ФОРМЫ ====================
// Функция валидации имени
function validateName(name) {
    if (name.trim().length < 2) {
        return { valid: false, message: 'Имя должно содержать минимум 2 символа' };
    }
    return { valid: true, message: '' };
}

// Функция валидации email (с регулярным выражением)
function validateEmail(email) {
    // Регулярное выражение для проверки email
    // Проверяет: что-то@что-то.что-то (без пробелов, с точкой в домене)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Некорректная почта, пример ввода: vanp@gmail.com' };
    }
    
    return { valid: true, message: '' };
}

// Функция для показа ошибок полей
function showFieldError(fieldId, message) {
    const errorDiv = document.getElementById(`${fieldId}-error`);
    const inputField = document.getElementById(fieldId);
    
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }
    
    if (inputField) {
        inputField.classList.add('error-input');
    }
}

function clearFieldError(fieldId) {
    const errorDiv = document.getElementById(`${fieldId}-error`);
    const inputField = document.getElementById(fieldId);
    
    if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.classList.remove('show');
    }
    
    if (inputField) {
        inputField.classList.remove('error-input');
    }
}

// ==================== ОТПРАВКА ФОРМЫ ====================
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Очищаем предыдущие ошибки
    clearFieldError('name');
    clearFieldError('email');
    
    // Получаем значения полей
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    // Валидация имени
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
        showFieldError('name', nameValidation.message);
        showToast(nameValidation.message, true);
        return;
    }
    
    // Валидация email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
        showFieldError('email', emailValidation.message);
        showToast(emailValidation.message, true);
        return;
    }
    
    // Если всё валидно, отправляем форму
    emailjs.send('service_mepd1vs', 'template_hqdzx99', {
        name: name,
        email: email
    })
    .then(() => {
        showToast('Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.', false);
        this.reset();
        // Очищаем классы ошибок после успешной отправки
        clearFieldError('name');
        clearFieldError('email');
    })
    .catch(err => {
        console.error('Ошибка отправки формы:', err);
        showToast('Произошла ошибка при отправке. Попробуйте позже или позвоните нам.', true);
        showFieldError('email', 'Произошла ошибка при отправке. Попробуйте позже или позвоните нам.');
    });
});