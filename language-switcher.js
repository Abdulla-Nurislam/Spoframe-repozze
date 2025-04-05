document.addEventListener('DOMContentLoaded', function() {
    const languageSelect = document.getElementById('languageSelect');
    
    if (languageSelect) {
        // Set initial language from cookie or localStorage
        const currentLang = getCookie('locale') || localStorage.getItem('language') || 'ru';
        languageSelect.value = currentLang;
        
        languageSelect.addEventListener('change', function() {
            const selectedLang = this.value;
            
            // Update both cookie and localStorage
            document.cookie = `locale=${selectedLang};path=/;max-age=31536000`;
            localStorage.setItem('language', selectedLang);
            
            // Send request to server to change language
            fetch(`/api/language/${selectedLang}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.reload();
                    } else {
                        console.error('Failed to change language');
                    }
                })
                .catch(error => {
                    console.error('Error changing language:', error);
                });
        });
    }
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}