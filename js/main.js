AOS.init({ duration: 800, once: true });

(function() { emailjs.init('wPCLTrIcEBzfItGS0'); })();

const SUPABASE_URL = 'https://qcumtfdgasjnbwlypezh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JqqF_yL_7Lfj8bTH2Id2_A_68y9gpgv';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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


//Emailjs
function showToast(message, isError = false) {
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.classList.add(isError ? 'error' : 'success');
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function checkName(name) {
    if (name.trim().length < 2) {
        return 'Имя должно содержать минимум 2 символа';
    }
    return '';
}

function checkEmailOrPhone(inputValue) {
    const cleanedValue = inputValue.replace(/[\s\-\(\)\+]/g, '');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{11}$/;
    
    if (emailRegex.test(inputValue)) {
        return '';
    }
    
    if (phoneRegex.test(cleanedValue)) {
        return '';
    }
    return 'Введите корректный email (ivan@mail.ru) или телефон (11 цифр, например 79123456789)';
}


document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const contact = document.getElementById('email').value;
    
    const nameError = checkName(name);
    if (nameError) {
        showToast(nameError, true);
        return;
    }
    

    const contactError = checkEmailOrPhone(contact);
    if (contactError) {
        showToast(contactError, true);
        return;
    }
    
    emailjs.send('service_mepd1vs', 'template_hqdzx99', {
        name: name,
        contact: contact
    })
    .then(() => {
        showToast('Сообщение успешно отправлено!', false);
        document.getElementById('contact-form').reset();
    })
    .catch(() => {
        showToast('Ошибка отправки. Попробуйте позже.', true);
    });
});