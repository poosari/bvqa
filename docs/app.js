/* ============================================================
   BVQA — App Logic
   ============================================================ */

(function () {
    'use strict';

    // State
    let allData = [];
    let flatQuestions = [];
    let categories = [];
    let activeCategory = null;
    let searchQuery = '';

    // DOM
    const searchInput = document.getElementById('searchInput');
    const categoryList = document.getElementById('categoryList');
    const qaGrid = document.getElementById('qaGrid');
    const emptyState = document.getElementById('emptyState');
    const activeTitle = document.getElementById('activeCategory');
    const resultCount = document.getElementById('resultCount');
    const totalCount = document.getElementById('totalCount');
    const catCount = document.getElementById('catCount');
    const allBtn = document.getElementById('allBtn');
    const backToTop = document.getElementById('backToTop');
    const mobileCatToggle = document.getElementById('mobileCatToggle');
    const sidebar = document.getElementById('sidebar');

    // ---- Load Data ----
    async function init() {
        try {
            const res = await fetch('data.json');
            allData = await res.json();
            categories = allData.map(c => c.category);
            flatQuestions = allData.flatMap(cat =>
                cat.questions.map(q => ({
                    ...q,
                    category: cat.category
                }))
            );

            totalCount.textContent = flatQuestions.length;
            catCount.textContent = categories.length;

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
        categories.forEach((cat, i) => {
            const count = allData[i].questions.length;
            const short = cat.replace(/^[IVXLC]+\.\s*/, '');
            const btn = document.createElement('button');
            btn.className = 'cat-item';
            btn.innerHTML = `
                <span class="cat-num">${count}</span>
                <span class="cat-label" title="${short}">${short}</span>
            `;
            btn.addEventListener('click', () => {
                activeCategory = cat;
                searchQuery = '';
                searchInput.value = '';
                setActiveCategory(btn);
                renderQuestions();
                closeMobileSidebar();
            });
            categoryList.appendChild(btn);
        });
    }

    function setActiveCategory(activeBtn) {
        document.querySelectorAll('.cat-item').forEach(b => b.classList.remove('active'));
        if (activeBtn) activeBtn.classList.add('active');
    }

    // ---- Filter & Render Questions ----
    function getFiltered() {
        let items = flatQuestions;

        if (activeCategory) {
            items = items.filter(q => q.category === activeCategory);
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

        if (activeCategory) {
            activeTitle.textContent = activeCategory.replace(/^[IVXLC]+\.\s*/, '');
        } else if (searchQuery.trim()) {
            activeTitle.textContent = 'Search Results';
        } else {
            activeTitle.textContent = 'All Questions';
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
            const card = createCard(q);
            fragment.appendChild(card);
        });
        qaGrid.innerHTML = '';
        qaGrid.appendChild(fragment);
    }

    function createCard(q) {
        const card = document.createElement('div');
        card.className = 'qa-card';

        const questionText = highlightText(q.question);
        const answerText = highlightText(q.answer);
        const showCat = !activeCategory;

        card.innerHTML = `
            <div class="qa-question">
                <span class="qa-num">${q.id}</span>
                <div class="qa-q-text">
                    ${questionText}
                    ${showCat ? `<div class="qa-cat-badge">${q.category.replace(/^[IVXLC]+\.\s*/, '')}</div>` : ''}
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

        card.addEventListener('click', () => {
            card.classList.toggle('open');
        });

        return card;
    }

    function highlightText(text) {
        if (!searchQuery.trim()) return text;
        const terms = searchQuery.trim().split(/\s+/);
        let result = text;
        terms.forEach(term => {
            const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${esc})`, 'gi');
            result = result.replace(regex, '<mark>$1</mark>');
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
                setActiveCategory(null);
            }
            renderQuestions();
        }, 200);
    });

    // Keyboard shortcut: Cmd+K or Ctrl+K
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

    // All button
    allBtn.addEventListener('click', () => {
        activeCategory = null;
        searchQuery = '';
        searchInput.value = '';
        setActiveCategory(null);
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
    mobileCatToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    function closeMobileSidebar() {
        sidebar.classList.remove('open');
    }

    // Close sidebar on outside click (mobile)
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
