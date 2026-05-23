/**
 * Main Application Controller
 * Loads content, renders categories, handles navigation
 */

class App {
    constructor() {
        this.content = null;
        this.currentCategory = null;
        this.categoryGrid = document.getElementById('categoryGrid');
        this.categoryNav = document.getElementById('categoryNav');
        this.categoryView = document.getElementById('categoryView');
        this.categoryContent = document.getElementById('categoryContent');
        this.homeView = document.getElementById('homeView');
        this.backButton = document.getElementById('backButton');
        
        this.init();
    }

    async init() {
        await this.loadContent();
        this.renderCategoryGrid();
        this.renderCategoryNav();
        this.setupNavigation();
        this.setupProgressBar();
        
        document.dispatchEvent(new CustomEvent('contentLoaded', {
            detail: { content: this.content }
        }));
    }

    async loadContent() {
        try {
            const response = await fetch('data/content.json');
            this.content = await response.json();
        } catch (error) {
            console.error('Failed to load content:', error);
            this.categoryGrid.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Unable to load guide content. Please check back later.</p>';
        }
    }

    renderCategoryGrid() {
        if (!this.content) return;

        this.categoryGrid.innerHTML = Object.entries(this.content.categories)
            .map(([key, cat]) => `
                <div class="category-card" data-category="${key}" role="button" tabindex="0" aria-label="View ${cat.title} section">
                    <div class="card-icon">${cat.icon}</div>
                    <div class="card-title">${cat.title}</div>
                    <div class="card-desc">${cat.description}</div>
                    <div class="card-count">${cat.sections.length} sections</div>
                </div>
            `).join('');

        this.categoryGrid.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                this.navigateToCategory(card.dataset.category);
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.navigateToCategory(card.dataset.category);
                }
            });
        });
    }

    renderCategoryNav() {
        if (!this.content) return;

        const navInner = document.createElement('div');
        navInner.className = 'category-nav-inner';

        navInner.innerHTML = `
            <button class="nav-btn active" data-category="home" aria-label="Go to home">🏠 Home</button>
        `;

        Object.entries(this.content.categories).forEach(([key, cat]) => {
            const btn = document.createElement('button');
            btn.className = 'nav-btn';
            btn.dataset.category = key;
            btn.textContent = `${cat.icon} ${cat.shortTitle || cat.title}`;
            btn.setAttribute('aria-label', `View ${cat.title}`);
            navInner.appendChild(btn);
        });

        this.categoryNav.innerHTML = '';
        this.categoryNav.appendChild(navInner);

        this.categoryNav.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.category === 'home') {
                    this.navigateHome();
                } else {
                    this.navigateToCategory(btn.dataset.category);
                }
            });
        });
    }

    setupNavigation() {
        this.backButton.addEventListener('click', () => {
            this.navigateHome();
        });
    }

    setupProgressBar() {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            const progressBar = document.getElementById('progressBar');
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
        });
    }

    navigateHome() {
        this.homeView.classList.remove('hidden');
        this.categoryView.classList.add('hidden');
        this.currentCategory = null;
        
        this.categoryNav.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === 'home');
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navigateToCategory(categoryKey, scrollToSectionId = null) {
    if (!this.content) return;
    
    const category = this.content.categories[categoryKey];
    if (!category) return;

    this.currentCategory = categoryKey;
    this.homeView.classList.add('hidden');
    this.categoryView.classList.remove('hidden');

    this.categoryContent.innerHTML = `
        <div class="category-view-header">
            <h2>${category.icon} ${category.title}</h2>
            <p>${category.description}</p>
        </div>
        <div class="accordion-container">
            ${category.sections.map(section => this.renderAccordion(section)).join('')}
        </div>
    `;

    this.initAccordions();

    this.categoryNav.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === categoryKey);
    });

    // Scroll to the category content area on mobile
    setTimeout(() => {
        if (scrollToSectionId) {
            const section = document.getElementById(`section-${scrollToSectionId}`);
            if (section) {
                const accordion = section.closest('.accordion');
                if (accordion) {
                    accordion.classList.add('open');
                }
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
        }
        // Fallback: scroll to the top of the category view
        this.categoryView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

    renderAccordion(s) {
        return `<div class="accordion" id="section-${s.id}">
            <div class="accordion-header" role="button" tabindex="0" aria-expanded="false">
                <h3>${s.title}</h3>
                <span class="accordion-arrow">▼</span>
            </div>
            <div class="accordion-body">
                <div class="section-content">
                    ${this.renderSection(s)}
                </div>
            </div>
        </div>`;
    }

    renderSection(s) {
        return `
            ${s.reality_shift ? `<div class="block"><h4>Reality Shift</h4><p>${s.reality_shift}</p></div>` : ''}
            ${s.mental_model ? `<div class="block"><h4>Mental Model</h4><p>${s.mental_model}</p></div>` : ''}
            ${s.mechanism ? `<div class="block"><h4>Mechanism</h4><p>${s.mechanism}</p></div>` : ''}
            ${s.implications ? `<div class="block"><h4>Implications</h4><p>${s.implications}</p></div>` : ''}
            ${s.constraints ? `<div class="block"><h4>Constraints</h4><p>${s.constraints}</p></div>` : ''}
            ${s.system_position ? `<div class="block"><h4>System Position</h4><p>${s.system_position}</p></div>` : ''}
            ${s.insight ? `<div class="insight-box">${s.insight}</div>` : ''}
            ${s.bullets ? `<ul>${s.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
            ${s.specs_link ? `<a href="${s.specs_link}" class="specs-link" target="_blank" rel="noopener">📋 View specification →</a>` : ''}
        `;
    }

    initAccordions() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const accordion = header.parentElement;
                accordion.classList.toggle('open');
                header.setAttribute('aria-expanded', accordion.classList.contains('open'));
            });
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});