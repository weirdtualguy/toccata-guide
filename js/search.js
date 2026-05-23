/**
 * Client-side search using simple text matching
 */

class SearchManager {
    constructor() {
        this.input = document.getElementById('searchInput');
        this.results = document.getElementById('searchResults');
        this.index = [];
        this.init();
    }

    init() {
        document.addEventListener('contentLoaded', (e) => {
            this.buildIndex(e.detail.content);
        });

        this.input.addEventListener('input', () => {
            this.search(this.input.value);
        });

        this.input.addEventListener('focus', () => {
            if (this.input.value.length >= 2) {
                this.results.classList.remove('hidden');
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.results.classList.add('hidden');
            }
        });
    }

    buildIndex(content) {
        this.index = [];
        for (const [key, cat] of Object.entries(content.categories)) {
            for (const sec of cat.sections) {
                const text = [
                    sec.reality_shift || '',
                    sec.mental_model || '',
                    sec.mechanism || '',
                    sec.implications || '',
                    sec.constraints || '',
                    sec.system_position || '',
                    sec.insight || '',
                    (sec.bullets || []).join(' ')
                ].join(' ');
                
                this.index.push({
                    id: sec.id,
                    catKey: key,
                    catTitle: cat.title,
                    title: sec.title,
                    text: text
                });
            }
        }
    }

    search(q) {
        if (q.length < 2) {
            this.results.classList.add('hidden');
            return;
        }

        const lowerQuery = q.toLowerCase();
        const results = this.index
            .filter(item => item.text.toLowerCase().includes(lowerQuery))
            .slice(0, 8);

        if (results.length === 0) {
            this.results.innerHTML = `
                <div class="search-result-item">
                    <span style="color: var(--text-muted);">No results found</span>
                </div>`;
        } else {
            this.results.innerHTML = results.map(r => `
                <div class="search-result-item" data-cat="${r.catKey}" data-sec="${r.id}" role="button" tabindex="0">
                    <strong>${r.title}</strong>
                    <br><small>${r.catTitle}</small>
                </div>`).join('');

            this.results.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.results.classList.add('hidden');
                    this.input.value = '';
                    if (window.app) {
                        window.app.navigateToCategory(item.dataset.cat, item.dataset.sec);
                    }
                });
            });
        }

        this.results.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
});