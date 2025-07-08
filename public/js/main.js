// JavaScript principal pentru interfața utilizator

document.addEventListener('DOMContentLoaded', function() {
    // Evidențiază link-ul activ în meniu
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
    
    // Auto-hide pentru alerte
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s';
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 500);
        }, 5000);
    });
    
    // Confirmare pentru acțiuni periculoase
    const dangerousActions = document.querySelectorAll('[data-confirm]');
    dangerousActions.forEach(element => {
        element.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm');
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });
    
    // Validare formular înregistrare
    const registerForm = document.querySelector('form[action="/auth/register"]');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                e.preventDefault();
                alert('Parolele nu coincid!');
            }
        });
    }
});

// Funcții helper pentru viitoare funcționalități AJAX
const api = {
    // Funcție generică pentru request-uri
    request: async (url, options = {}) => {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin'
        };
        
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    },
    
    // GET request
    get: (url) => api.request(url),
    
    // POST request
    post: (url, data) => api.request(url, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    
    // PUT request
    put: (url, data) => api.request(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    
    // DELETE request
    delete: (url) => api.request(url, {
        method: 'DELETE'
    })
};

// Export pentru utilizare în alte scripturi
window.phishingPlatform = { api };