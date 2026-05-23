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
        
        // Dispatch event for search manager
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
                <div class="category-card" data-category="${key}" role="button" tabindex="0">
                    <div class="card-icon">${cat.icon}</div>
                    <div class="card-title">${cat.title}</div>
                    <div class="card-desc">${cat.description}</div>
                    <div class="card-count">${cat.sections.length} sections</div>
                </div>
            `).join('');

        // Click handlers for cards
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

        // Add "Home" button
        navInner.innerHTML = `
            <button class="category-nav-btn active" data-category="home">🏠 Home</button>
        `;

        // Add category buttons
        Object.entries(this.content.categories).forEach(([key, cat]) => {
            const btn = document.createElement('button');
            btn.className = 'category-nav-btn';
            btn.dataset.category = key;
            btn.textContent = `${cat.icon} ${cat.shortTitle || cat.title}`;
            navInner.appendChild(btn);
        });

        this.categoryNav.innerHTML = '';
        this.categoryNav.appendChild(navInner);

        // Click handlers
        this.categoryNav.querySelectorAll('.category-nav-btn').forEach(btn => {
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

    navigateHome() {
        this.homeView.classList.remove('hidden');
        this.categoryView.classList.add('hidden');
        this.currentCategory = null;
        
        // Update nav active state
        this.categoryNav.querySelectorAll('.category-nav-btn').forEach(btn => {
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

        // Render category content
        this.categoryContent.innerHTML = `
            <div class="category-view-header">
                <h2>${category.icon} ${category.title}</h2>
                <p>${category.description}</p>
            </div>
            <div class="accordion-container">
                ${category.sections.map(section => this.renderAccordion(section)).join('')}
            </div>
        `;

        // Initialize accordions
        this.initAccordions();

        // Re-apply depth toggle
        if (window.depthManager) {
            window.depthManager.applyDepth();
        }

        // Update nav active state
        this.categoryNav.querySelectorAll('.category-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === categoryKey);
        });

        // Scroll to specific section if requested
        if (scrollToSectionId) {
            setTimeout(() => {
                const section = document.getElementById(`section-${scrollToSectionId}`);
                if (section) {
                    const accordion = section.closest('.accordion');
                    if (accordion) {
                        accordion.classList.add('open');
                    }
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 300);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderAccordion(section) {
        return `
            <div class="accordion" id="section-${section.id}">
                <div class="accordion-header" role="button" tabindex="0" aria-expanded="false">
                    <h3>${section.title}</h3>
                    <span class="accordion-arrow">▼</span>
                </div>
                <div class="accordion-body">
                    <div class="content-version simple-content active" data-version="simple">
                        ${this.renderSimpleContent(section.simple)}
                    </div>
                    <div class="content-version technical-content" data-version="technical">
                        ${this.renderTechnicalContent(section.technical)}
                    </div>
                    ${section.specs_link ? `<a href="${section.specs_link}" class="specs-link" target="_blank" rel="noopener">📋 View full specification →</a>` : ''}
                </div>
            </div>
        `;
    }

    renderSimpleContent(simple) {
        if (!simple) return '<p>Simple explanation coming soon.</p>';
        
        return `
            <div class="summary">${simple.summary}</div>
            ${simple.details ? `<p>${simple.details}</p>` : ''}
            ${simple.problem ? `<h4>The Problem</h4><p>${simple.problem}</p>` : ''}
            ${simple.how_it_works ? `<h4>How It Works</h4><p>${simple.how_it_works}</p>` : ''}
            ${simple.analogy ? `<h4>Think of It Like...</h4><p>${simple.analogy}</p>` : ''}
            ${simple.key_takeaway ? `<div class="key-takeaway"><strong>Key Takeaway:</strong> ${simple.key_takeaway}</div>` : ''}
            ${simple.bullets ? `<ul>${simple.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
        `;
    }

    renderTechnicalContent(technical) {
        if (!technical) return '<p>Technical explanation coming soon.</p>';
        
        return `
            <div class="summary">${technical.summary}</div>
            ${technical.details ? `<p>${technical.details}</p>` : ''}
            ${technical.mechanism ? `<h4>Mechanism</h4><p>${technical.mechanism}</p>` : ''}
            ${technical.code_example ? `<h4>Code Example</h4><pre><code>${this.escapeHtml(technical.code_example)}</code></pre>` : ''}
            ${technical.security ? `<h4>Security Properties</h4><p>${technical.security}</p>` : ''}
            ${technical.key_takeaway ? `<div class="key-takeaway"><strong>Key Takeaway:</strong> ${technical.key_takeaway}</div>` : ''}
            ${technical.bullets ? `<ul>${technical.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : ''}
            ${technical.specs_link ? `<a href="${technical.specs_link}" class="specs-link" target="_blank" rel="noopener">📋 View KIP specification →</a>` : ''}
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