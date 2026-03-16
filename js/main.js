
AOS.init({ duration: 800, once: true });

(function() { emailjs.init('wPCLTrIcEBzfItGS0'); })();

const SUPABASE_URL = 'https://qcumtfdgasjnbwlypezh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_JqqF_yL_7Lfj8bTH2Id2_A_68y9gpgv';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadServices() {
    const container = document.getElementById('services-list');
    

    const { data: categories } = await supabaseClient
        .from('categories')
        .select('id, name');
    
    const { data: services } = await supabaseClient
        .from('services')
        .select('name, category_id');
    


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

document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    emailjs.send('service_mepd1vs', 'template_hqdzx99', {
        name: document.getElementById('name').value,
        contact: document.getElementById('contact').value
    })
    .then(() => {
        alert('Сообщение отправлено!');
        this.reset();
    });
});