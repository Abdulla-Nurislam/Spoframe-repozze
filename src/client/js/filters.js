document.addEventListener('DOMContentLoaded', function() {
    const styleCheckboxes = document.querySelectorAll('.filter-group:first-child input[type="checkbox"]');
    const functionCheckboxes = document.querySelectorAll('.filter-group:last-child input[type="checkbox"]');
    const products = document.querySelectorAll('.product-card');

    function updateFilters() {
        const selectedStyles = Array.from(styleCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const selectedFunctions = Array.from(functionCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        products.forEach(product => {
            const productStyles = product.getAttribute('data-style')?.split(',') || [];
            const productFunctions = product.getAttribute('data-function')?.split(',') || [];

            const matchesStyle = selectedStyles.length === 0 || 
                selectedStyles.some(style => productStyles.includes(style.trim()));
            const matchesFunction = selectedFunctions.length === 0 || 
                selectedFunctions.some(func => productFunctions.includes(func.trim()));

            product.style.display = (matchesStyle && matchesFunction) ? '' : 'none';
        });
    }

    styleCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });

    functionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });
});
