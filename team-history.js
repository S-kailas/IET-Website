// Past Execom teams — year switcher for the Team page.
//
// Loaded as a module (see the <script type="module"> tag in team.html) so
// it can `import` the plain data files (team_2020.js .. team_2025.js)
// directly, without a build step. Those files are untouched — this just
// reads from them.
//
// NOTE: ES module imports are blocked by browsers when a page is opened
// directly as a file:// URL (a browser CORS rule, not a bug here). This
// works normally once the site is served over http/https — e.g. GitHub
// Pages, or any local dev server (`python -m http.server`, VS Code's
// "Live Server", etc). Opening team.html by double-clicking it will show
// the year buttons but the grid below them will stay empty.

import { members25, witteam25 } from './team_2025.js';
import { members24, witteam24 } from './team_2024.js';
import { members23, witteam23 } from './team_2023.js';
import { members22, witteam22 } from './team_2022.js';
import { members21, witteam21 } from './team_2021.js';
import { members20, witteam20 } from './team_2020.js';

const YEARS = [
    { key: '2025', members: [...members25, ...witteam25] },
    { key: '2024', members: [...members24, ...witteam24] },
    { key: '2023', members: [...members23, ...witteam23] },
    { key: '2022', members: [...members22, ...witteam22] },
    { key: '2021', members: [...members21, ...witteam21] },
    { key: '2020', members: [...members20, ...witteam20] },
];

const tabsEl = document.getElementById('yearTabs');
const gridEl = document.getElementById('teamHistoryGrid');

if (tabsEl && gridEl) {

    const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    function renderYear(key) {
        const year = YEARS.find((y) => y.key === key);
        if (!year) return;

        // Cards get "in-view" set immediately rather than relying on the
        // scroll-reveal IntersectionObserver in script.js — that observer
        // runs once at page load and only watches elements that already
        // exist then, so anything injected later (like these cards, on a
        // button click) would never get observed and would stay stuck at
        // opacity:0 forever.
        gridEl.innerHTML = year.members.map((m) => `
            <article class="person in-view">
                <div class="person-photo">
                    <img src="${escapeHtml(m.img)}" alt="${escapeHtml(m.name)}">
                </div>
                <div class="person-info">
                    <h3>${escapeHtml(m.name)}</h3>
                    <p>${escapeHtml(m.position)}</p>
                </div>
            </article>
        `).join('');

        tabsEl.querySelectorAll('.year-tab').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.year === key);
        });
    }

    tabsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.year-tab');
        if (!btn) return;
        renderYear(btn.dataset.year);
    });

    // Show the most recent past year by default, so the section isn't
    // empty on first load.
    renderYear(YEARS[0].key);
}