/**
 * Depth Toggle Manager
 * Persists user preference between Simple and Technical views
 */

class DepthManager {
    constructor() {
        this.depth = localStorage.getItem('toccata-depth') || 'simple';
        this.toggleBtn = document.getElementById('depthToggle');
        this.simpleSpan = this.toggleBtn.querySelector('.toggle-simple');
        this.technicalSpan = this.toggleBtn.querySelector('.toggle-technical');
        
        this.init();
    }

    init() {
        this.updateToggleUI();
        this.applyDepth();
        
        this.toggleBtn.addEventListener('click', () => {
            this.depth = this.depth === 'simple' ? 'technical' : 'simple';
            localStorage.setItem('toccata-depth', this.depth);
            this.updateToggleUI();
            this.applyDepth();
        });
    }

    updateToggleUI() {
        if (this.depth === 'simple') {
            this.simpleSpan.classList.add('active');
            this.technicalSpan.classList.remove('active');
        } else {
            this.technicalSpan.classList.add('active');
            this.simpleSpan.classList.remove('active');
        }
    }

    applyDepth() {
        // Update all content version elements
        document.querySelectorAll('.content-version').forEach(el => {
            if (el.dataset.version === this.depth) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }

    getDepth() {
        return this.depth;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.depthManager = new DepthManager();
});