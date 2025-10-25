/* javascript */
/* Additions: mobile toggle button injection + aria syncing + small tweaks */

let navWired = false;
let escListenerAdded = false;

function setExpanded(el, expanded) {
    if (!el) return;
    el.setAttribute('aria-expanded', expanded ? 'true' : 'false');
}

/* Ensure a floating mobile toggle exists and is wired */
function ensureMobileToggle() {
    if (document.getElementById('nav-toggle-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'nav-toggle-btn';
    btn.className = 'nav-toggle-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Open navigation');
    btn.setAttribute('aria-controls', 'side-nav');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '☰'; // simple hamburger glyph
    btn.addEventListener('click', () => {
        const side = document.getElementById('side-nav');
        if (!side) return;
        if (side.classList.contains('open')) {
            closeSideNav();
        } else {
            openSideNav();
        }
    });

    document.body.appendChild(btn);
}

function findArrowForPanel(panelId) {
    let arrow =
        document.querySelector(`.category[aria-controls="${panelId}"] .arrow`) ||
        document.querySelector(`.subcategory-title[aria-controls="${panelId}"] .arrow`);
    if (arrow) return arrow;

    const panel = document.getElementById(panelId);
    if (!panel) return null;

    const header = panel.previousElementSibling &&
        (panel.previousElementSibling.matches('.category, .subcategory-title')
            ? panel.previousElementSibling
            : null);

    if (header) {
        arrow = header.querySelector('.arrow');
    }
    return arrow || null;
}

function animatePanel(panelEl, expand) {
    if (!panelEl) return;

    if (expand) {
        panelEl.classList.add('active');
        panelEl.style.display = 'block';
        const target = panelEl.scrollHeight;
        panelEl.style.overflow = 'hidden';
        panelEl.style.maxHeight = target + 'px';

        const onOpenEnd = (e) => {
            if (e.propertyName !== 'max-height') return;
            panelEl.style.maxHeight = 'none';
            panelEl.style.overflow = 'visible';
            panelEl.removeEventListener('transitionend', onOpenEnd);
        };
        panelEl.addEventListener('transitionend', onOpenEnd);
    } else {
        const current = panelEl.scrollHeight;
        panelEl.style.maxHeight = current + 'px';
        // eslint-disable-next-line no-unused-expressions
        panelEl.offsetHeight;
        panelEl.style.overflow = 'hidden';
        panelEl.style.maxHeight = '0px';

        const onCloseEnd = (e) => {
            if (e.propertyName !== 'max-height') return;
            panelEl.classList.remove('active');
            panelEl.style.overflow = 'hidden';
            panelEl.removeEventListener('transitionend', onCloseEnd);
        };
        panelEl.addEventListener('transitionend', onCloseEnd);
    }
}

function toggleCategory(id, forceState) {
    const el = document.getElementById(id);
    if (!el) return;

    const header =
        document.querySelector(`.category[aria-controls="${id}"]`) ||
        (el.previousElementSibling && el.previousElementSibling.matches('.category')
            ? el.previousElementSibling
            : null);

    const expanded = typeof forceState === 'boolean'
        ? forceState
        : !el.classList.contains('active');

    animatePanel(el, expanded);
    setExpanded(header, expanded);

    const arrow = findArrowForPanel(id);
    if (arrow) arrow.classList.toggle('rotated', expanded);

    saveNavState();
}

function toggleSubcategory(id, forceState) {
    const el = document.getElementById(id);
    if (!el) return;

    const header =
        document.querySelector(`.subcategory-title[aria-controls="${id}"]`) ||
        (el.previousElementSibling && el.previousElementSibling.matches('.subcategory-title')
            ? el.previousElementSibling
            : null);

    const expanded = typeof forceState === 'boolean'
        ? forceState
        : !el.classList.contains('active');

    animatePanel(el, expanded);
    setExpanded(header, expanded);

    const arrow = findArrowForPanel(id);
    if (arrow) arrow.classList.toggle('rotated', expanded);

    saveNavState();
}

function saveNavState() {
    const all = document.querySelectorAll('.subcategory[id]');
    const state = {};
    all.forEach((el) => {
        state[el.id] = el.classList.contains('active');
    });
    try {
        localStorage.setItem('navState', JSON.stringify(state));
    } catch (e) {
        // ignore storage errors
    }
}

function restoreNavState() {
    let saved = {};
    try {
        saved = JSON.parse(localStorage.getItem('navState') || '{}');
    } catch {
        saved = {};
    }

    const all = document.querySelectorAll('.subcategory[id]');
    all.forEach((el) => {
        const shouldBeActive = !!saved[el.id];
        if (shouldBeActive) {
            el.classList.add('active');
            el.style.display = 'block';
            el.style.maxHeight = 'none';
            el.style.overflow = 'visible';
        } else {
            el.classList.remove('active');
            el.style.maxHeight = '0px';
            el.style.overflow = 'hidden';
        }

        const header =
            document.querySelector(`.category[aria-controls="${el.id}"]`) ||
            document.querySelector(`.subcategory-title[aria-controls="${el.id}"]`);
        setExpanded(header, shouldBeActive);

        const arrow = findArrowForPanel(el.id);
        if (arrow) arrow.classList.toggle('rotated', shouldBeActive);
    });

    highlightCurrentAndEnsureVisible();
}

function highlightCurrentAndEnsureVisible() {
    const links = document.querySelectorAll('.side-nav a[href]');
    if (!links.length) return;

    const currentPath = normalizePath(location.pathname);
    let best = null;
    let score = -1;

    links.forEach((a) => {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:')) return;
        const p = normalizePath(href);
        const s = matchScore(currentPath, p);
        if (s > score) {
            score = s;
            best = a;
        }
    });

    if (best) {
        best.classList.add('is-current');
        expandAncestors(best);

        const nav = document.getElementById('side-nav');
        if (nav) {
            // Center the item inside the sidebar without scrolling the whole page
            setTimeout(() => {
                const targetTop = best.offsetTop - (nav.clientHeight / 2) + (best.clientHeight / 2);
                nav.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
            }, 50);
        }
    }
}

function normalizePath(path) {
    try {
        const url = new URL(path, location.origin);
        path = url.pathname;
    } catch {
        // relative path
    }
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return decodeURIComponent(path.toLowerCase());
}

function matchScore(current, candidate) {
    if (current === candidate) return 1000;
    if (current.endsWith(candidate)) return candidate.length;
    return -1;
}

function expandAncestors(linkEl) {
    let parent = linkEl.closest('.subcategory');
    while (parent) {
        if (parent.id) {
            parent.classList.add('active');
            parent.style.display = 'block';
            parent.style.maxHeight = 'none';
            parent.style.overflow = 'visible';

            const header =
                document.querySelector(`.category[aria-controls="${parent.id}"]`) ||
                document.querySelector(`.subcategory-title[aria-controls="${parent.id}"]`);
            setExpanded(header, true);

            const arrow = findArrowForPanel(parent.id);
            if (arrow) arrow.classList.add('rotated');
        }
        parent = parent.parentElement && parent.parentElement.closest('.subcategory');
    }
    saveNavState();
}

function wireNavInteractions(root = document) {
    const side = root.getElementById ? root.getElementById('side-nav') : document.getElementById('side-nav');
    if (!side) return;
    if (navWired) return;

    root.querySelectorAll('.category[aria-controls]').forEach((btn) => {
        const id = btn.getAttribute('aria-controls');
        btn.addEventListener('click', () => toggleCategory(id));
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCategory(id);
            } else if (e.key === 'ArrowRight') {
                toggleCategory(id, true);
            } else if (e.key === 'ArrowLeft') {
                toggleCategory(id, false);
            }
        });
    });

    root.querySelectorAll('.subcategory-title[aria-controls]').forEach((btn) => {
        const id = btn.getAttribute('aria-controls');
        btn.addEventListener('click', () => toggleSubcategory(id));
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSubcategory(id);
            } else if (e.key === 'ArrowRight') {
                toggleSubcategory(id, true);
            } else if (e.key === 'ArrowLeft') {
                toggleSubcategory(id, false);
            }
        });
    });

    root.querySelectorAll('.side-nav a[href]').forEach((a) => {
        a.addEventListener('click', () => {
            if (window.matchMedia('(max-width: 1024px)').matches) {
                closeSideNav();
            }
        });
    });

    navWired = true;
}

function getBackdrop() {
    return document.querySelector('.nav-backdrop');
}

function openSideNav() {
    const side = document.getElementById('side-nav');
    if (!side) return;
    side.classList.add('open');
    const backdrop = getBackdrop();
    if (backdrop) backdrop.classList.add('active');

    // sync toggle aria
    const btn = document.getElementById('nav-toggle-btn');
    if (btn) btn.setAttribute('aria-expanded', 'true');

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
}

function closeSideNav() {
    const side = document.getElementById('side-nav');
    if (!side) return;
    side.classList.remove('open');
    const backdrop = getBackdrop();
    if (backdrop) backdrop.classList.remove('active');

    // sync toggle aria
    const btn = document.getElementById('nav-toggle-btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');

    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
}

function wireBackdrop() {
    const backdrop = getBackdrop();
    if (!backdrop) return;
    backdrop.addEventListener('click', closeSideNav);
}

function wireSwipeClose() {
    const side = document.getElementById('side-nav');
    if (!side) return;
    let startX = 0;
    let currentX = 0;
    let dragging = false;

    side.addEventListener('touchstart', (e) => {
        if (!side.classList.contains('open')) return;
        dragging = true;
        startX = e.touches[0].clientX;
        currentX = startX;
        side.style.transition = 'none';
    }, { passive: true });

    side.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        currentX = e.touches[0].clientX;
        const delta = Math.min(0, currentX - startX); // drag left only
        side.style.transform = `translateX(${delta}px)`;
    }, { passive: true });

    side.addEventListener('touchend', () => {
        if (!dragging) return;
        dragging = false;
        const delta = currentX - startX;
        side.style.transition = '';
        side.style.transform = '';
        if (delta < -60) closeSideNav();
    });
}

function initSideNav() {
    wireNavInteractions(document);
    wireBackdrop();
    wireSwipeClose();
    ensureMobileToggle(); // NEW: create/wire the toggle button

    if (!escListenerAdded) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeSideNav();
        });
        escListenerAdded = true;
    }
    restoreNavState();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('side-nav')) initSideNav();
        else ensureMobileToggle(); // make toggle available even before nav insert
    });
} else {
    if (document.getElementById('side-nav')) initSideNav();
    else ensureMobileToggle();
}

window.restoreNavState = restoreNavState;
window.initSideNav = initSideNav;