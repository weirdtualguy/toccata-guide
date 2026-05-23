/**
 * Client-side search using simple text matching
 * Searches across all content from content.json
 */

class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.searchIndex = [];
        this.init();
    }

    init() {
        // Build index once content is loaded
        document.addEventListener('contentLoaded', (e) => {
            this.buildIndex(e.detail.content);
        });

        this.searchInput.addEventListener('input', () => {
            this.performSearch(this.searchInput.value);
        });

        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value.length >= 2) {
                this.searchResults.classList.remove('hidden');
            }
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.searchContainer.contains(e.target)) {
                this.searchResults.classList.add('hidden');
            }
        });
    }

    get searchContainer() {
        return document.querySelector('.search-container');
    }

    buildIndex(content) {
        this.searchIndex = [];
        
        for (const [categoryKey, category] of Object.entries(content.categories)) {
            for (const section of category.sections) {
                // Index simple version
                if (section.simple) {
                    this.searchIndex.push({
                        id: section.id,
                        categoryKey: categoryKey,
                        categoryTitle: category.title,
                        sectionTitle: section.title,
                        text: section.simple.summary + ' ' + (section.simple.details || ''),
                        version: 'simple'
                    });
                }
                // Index technical version
                if (section.technical) {
                    this.searchIndex.push({
                        id: section.id,
                        categoryKey: categoryKey,
                        categoryTitle: category.title,
                        sectionTitle: section.title,
                        text: section.technical.summary + ' ' + (section.technical.details || ''),
                        version: 'technical'
                    });
                }
            }
        }
    }

    performSearch(query) {
        if (query.length < 2) {
            this.searchResults.classList.add('hidden');
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = this.searchIndex
            .filter(item => item.text.toLowerCase().includes(lowerQuery))
            .slice(0, 8); // Limit to 8 results

        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-item">
                    <span style="color: var(--text-muted);">No results found for "${query}"</span>
                </div>
            `;
        } else {
            this.searchResults.innerHTML = results.map(r => `
                <div class="search-result-item" 
                     data-category="${r.categoryKey}" 
                     data-section="${r.id}"
                     role="button"
                     tabindex="0">
                    <div class="result-title">${this.highlightMatch(r.sectionTitle, query)}</div>
                    <div class="result-category">${r.categoryTitle}</div>
                    <div class="result-snippet">${this.getSnippet(r.text, query)}</div>
                </div>
            `).join('');

            // Add click handlers
            this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const categoryKey = item.dataset.category;
                    const sectionId = item.dataset.section;
                    this.searchResults.classList.add('hidden');
                    this.searchInput.value = '';
                    
                    // Navigate to category and scroll to section
                    if (window.app) {
                        window.app.navigateToCategory(categoryKey, sectionId);
                    }
                });
            });
        }

        this.searchResults.classList.remove('hidden');
    }

    highlightMatch(text, query) {
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark style="background:rgba(126,184,218,0.3);color:var(--accent-bright);padding:0 2px;border-radius:2px;">$1</mark>');
    }

    getSnippet(text, query) {
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerText.indexOf(lowerQuery);
        if (index === -1) return text.substring(0, 80) + '...';
        
        const start = Math.max(0, index - 30);
        const end = Math.min(text.length, index + query.length + 50);
        let snippet = text.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet = snippet + '...';
        return snippet;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
});