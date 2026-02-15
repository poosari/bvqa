/* ============================================================
   BVQA — App Logic (v2 — flat JSON with difficulty filtering)
   ============================================================ */

(function () {
    'use strict';

    // State
    let allQuestions = [];
    let categories = [];
    let activeCategory = null;
    let activeDifficulty = 'all'; // 'all', 'Easy', 'Medium', 'Hard'
    let searchQuery = '';

    // DOM
    const searchInput = document.getElementById('searchInput');
    const categoryList = document.getElementById('categoryList');
    const difficultyFilters = document.getElementById('difficultyFilters');
    const qaGrid = document.getElementById('qaGrid');
    const emptyState = document.getElementById('emptyState');
    const activeTitle = document.getElementById('activeCategory');
    const resultCount = document.getElementById('resultCount');
    const totalCount = document.getElementById('totalCount');
    const catCount = document.getElementById('catCount');
    const easyCount = document.getElementById('easyCount');
    const mediumCount = document.getElementById('mediumCount');
    const hardCount = document.getElementById('hardCount');
    const activeDiffBadge = document.getElementById('activeDiffBadge');
    const allBtn = document.getElementById('allBtn');
    const backToTop = document.getElementById('backToTop');
    const mobileCatToggle = document.getElementById('mobileCatToggle');
    const sidebar = document.getElementById('sidebar');

    // ---- Load Data ----
    async function init() {
        try {
            const res = await fetch('data.json');
            allQuestions = await res.json();

            // Extract unique categories sorted
            const catMap = {};
            allQuestions.forEach(q => {
                catMap[q.category] = (catMap[q.category] || 0) + 1;
            });
            categories = Object.entries(catMap)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => ({ name, count }));

            // Counts
            totalCount.textContent = allQuestions.length;
            catCount.textContent = categories.length;
            easyCount.textContent = allQuestions.filter(q => q.difficulty === 'Easy').length;
            mediumCount.textContent = allQuestions.filter(q => q.difficulty === 'Medium').length;
            hardCount.textContent = allQuestions.filter(q => q.difficulty === 'Hard').length;

            renderCategories();
            renderQuestions();
        } catch (e) {
            console.error('Failed to load data:', e);
            qaGrid.innerHTML = '<p style="color:#f87171;padding:24px;">Failed to load Q&A data. Make sure data.json is in the same directory.</p>';
        }
    }

    // ---- Render Categories ----
    function renderCategories() {
        categoryList.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'cat-item';
            btn.innerHTML = `
                <span class="cat-num">${cat.count}</span>
                <span class="cat-label" title="${cat.name}">${cat.name}</span>
            `;
            btn.addEventListener('click', () => {
                activeCategory = cat.name;
                searchQuery = '';
                searchInput.value = '';
                setActiveCategoryBtn(btn);
                renderQuestions();
                closeMobileSidebar();
            });
            categoryList.appendChild(btn);
        });
    }

    function setActiveCategoryBtn(activeBtn) {
        document.querySelectorAll('.cat-item').forEach(b => b.classList.remove('active'));
        if (activeBtn) activeBtn.classList.add('active');
    }

    // ---- Difficulty filter clicks ----
    difficultyFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.diff-btn');
        if (!btn) return;
        activeDifficulty = btn.dataset.difficulty;
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderQuestions();
    });

    // ---- Filter & Render Questions ----
    function getFiltered() {
        let items = allQuestions;

        if (activeCategory) {
            items = items.filter(q => q.category === activeCategory);
        }

        if (activeDifficulty !== 'all') {
            items = items.filter(q => q.difficulty === activeDifficulty);
        }

        if (searchQuery.trim()) {
            const terms = searchQuery.toLowerCase().split(/\s+/);
            items = items.filter(q => {
                const text = (q.question + ' ' + q.answer + ' ' + q.category).toLowerCase();
                return terms.every(t => text.includes(t));
            });
        }

        return items;
    }

    function renderQuestions() {
        const filtered = getFiltered();

        // Title
        if (activeCategory) {
            activeTitle.textContent = activeCategory;
        } else if (searchQuery.trim()) {
            activeTitle.textContent = 'Search Results';
        } else {
            activeTitle.textContent = 'All Questions';
        }

        // Difficulty badge in header
        if (activeDifficulty !== 'all') {
            activeDiffBadge.style.display = 'inline-block';
            activeDiffBadge.textContent = activeDifficulty;
            activeDiffBadge.className = 'active-diff-badge ' + activeDifficulty.toLowerCase();
        } else {
            activeDiffBadge.style.display = 'none';
        }

        resultCount.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;

        if (filtered.length === 0) {
            qaGrid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';

        const fragment = document.createDocumentFragment();
        filtered.forEach(q => {
            fragment.appendChild(createCard(q));
        });
        qaGrid.innerHTML = '';
        qaGrid.appendChild(fragment);
    }

    function createCard(q) {
        const card = document.createElement('div');
        card.className = 'qa-card';

        const questionText = highlightText(q.question);
        const answerText = highlightText(q.answer);
        const diffClass = q.difficulty.toLowerCase();

        card.innerHTML = `
            <div class="qa-question">
                <span class="qa-num">${q.id}</span>
                <div class="qa-q-text">
                    ${questionText}
                    <div class="qa-meta">
                        <span class="qa-cat-badge">${q.category}</span>
                        <span class="qa-diff-badge ${diffClass}">${q.difficulty}</span>
                    </div>
                </div>
                <div class="qa-toggle">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                </div>
            </div>
            <div class="qa-answer">
                <div class="qa-a-inner">
                    <div class="qa-a-label">Answer</div>
                    <div class="qa-a-text">${answerText}</div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => card.classList.toggle('open'));
        return card;
    }

    function highlightText(text) {
        if (!searchQuery.trim()) return text;
        const terms = searchQuery.trim().split(/\s+/);
        let result = text;
        terms.forEach(term => {
            const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            result = result.replace(new RegExp(`(${esc})`, 'gi'), '<mark>$1</mark>');
        });
        return result;
    }

    // ---- Events ----

    // Search
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchQuery = e.target.value;
            if (searchQuery.trim()) {
                activeCategory = null;
                setActiveCategoryBtn(null);
            }
            renderQuestions();
        }, 200);
    });

    // ⌘K / Ctrl+K
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
        if (e.key === 'Escape') {
            searchInput.blur();
            closeMobileSidebar();
        }
    });

    // All button (categories)
    allBtn.addEventListener('click', () => {
        activeCategory = null;
        searchQuery = '';
        searchInput.value = '';
        setActiveCategoryBtn(null);
        renderQuestions();
        closeMobileSidebar();
    });

    // Back to top
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Mobile sidebar
    mobileCatToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

    function closeMobileSidebar() { sidebar.classList.remove('open'); }

    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) &&
            !mobileCatToggle.contains(e.target)) {
            closeMobileSidebar();
        }
    });

    // ---- Init ----
    init();
})();
