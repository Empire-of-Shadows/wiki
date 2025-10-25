


document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.nav-buttons .nav-button');
    const currentUrl = window.location.href;

    buttons.forEach((button) => {
        if (currentUrl.includes(button.getAttribute('href'))) {
            button.classList.add('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        fetch('/global/buttons/html/nav-buttons.html')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to load navigation buttons.');
                }
                return response.text();
            })
            .then((html) => {
                navPlaceholder.innerHTML = html;
                // Optionally, call any script for button interactivity
                activateCurrentNavLink();
            })
            .catch((error) => {
                console.error('Error loading navigation buttons:', error);
            });
    }

    function activateCurrentNavLink() {
        const buttons = document.querySelectorAll('.nav-button');
        const currentUrl = window.location.href;

        buttons.forEach((button) => {
            if (currentUrl.includes(button.getAttribute('href'))) {
                button.classList.add('active');
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded.');

    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        fetch('/global/buttons/html/nav-buttons.html')
            .then((response) => {
                if (!response.ok) throw new Error('Failed to load navigation buttons.');
                return response.text();
            })
            .then((html) => {
                navPlaceholder.innerHTML = html;
                initializeHamburgerMenu(); // Called after injecting the HTML.
            })
            .catch((error) => console.error('Error loading navigation buttons:', error));
    } else {
        console.error('No nav-placeholder found in DOM.');
    }
});
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (!hamburger || !navLinks) {
        console.error('Hamburger or NavLinks not found in the DOM.');
        return;
    }

    // Toggle menu visibility on hamburger click
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('show');
    });

    // Ensure proper classes/styles
    if (!navLinks.classList.contains('nav-buttons')) {
        console.warn('NavLinks is missing the expected class "nav-buttons". Make sure the HTML is structured correctly.');
    }
});
document.addEventListener('DOMContentLoaded', initializeNavigation);

function initializeNavigation() {
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        fetch('/global/buttons/html/nav-buttons.html')
            .then((response) => {
                if (!response.ok) throw new Error('Failed to load navigation buttons.');
                return response.text();
            })
            .then((html) => {
                navPlaceholder.innerHTML = html;

                console.log('Navigation HTML loaded.');
                // Safely initialize the hamburger menu AFTER HTML is injected
                initializeHamburgerMenu();
            })
            .catch((error) => console.error('Error loading navigation buttons:', error));
    } else {
        console.error('No nav-placeholder found in DOM.');
    }
}

function initializeHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            console.log('Hamburger clicked!');
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('show');
        });
    } else {
        console.error('Hamburger or NavLinks not found in the DOM.');
    }
}