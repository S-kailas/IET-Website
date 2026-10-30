// Past Execom events — year switcher for the Events page.
//
// Loaded as a module (see the <script type="module"> tag in events.html) so
// it can `import` from event.js directly, without a build step.
//
// NOTE: ES module imports are blocked by browsers when a page is opened
// directly as a file:// URL (a browser CORS rule, not a bug here). This
// works normally once the site is served over http/https — e.g. GitHub
// Pages, or any local dev server (`python -m http.server`, VS Code's
// "Live Server", etc).

import { competitions, workshops, seminars } from './event.js';

// ─────────────────────────────────────────────────────────────────────────────
// Bucket every event from event.js into the execom year it belongs to.
// The execom year "2025-26" covers July 2025 onwards (dates contain "2025"
// for post-July entries), "2024-25" covers 2024, and so on.
// We derive the year from the date string by extracting the latest year
// mentioned and then assigning it to an execom cycle.
// ─────────────────────────────────────────────────────────────────────────────

function latestYear(dateStr) {
    if (!dateStr) return 0;
    const matches = dateStr.match(/\d{4}/g);
    if (!matches) return 0;
    return Math.max(...matches.map(Number));
}

// Returns the execom-year key (e.g. "2025") for a given calendar year.
// Execom year "2025" means the 2025-26 batch (July 2025 – June 2026).
// Execom year "2024" means the 2024-25 batch, etc.
// Events in calendar year Y belong to execom key Y if their date is July+,
// but since we only have year-level granularity in most entries we just map
// the latest mentioned year straight to the execom key of the same value.
function execomKey(event) {
    const yr = latestYear(event.date);
    if (!yr) return null;
    // 2025 entries belong to 2025-26 execom (key "2025")
    return String(yr);
}

const allEvents = [
    ...competitions.map(e => ({ ...e, _type: 'competition' })),
    ...workshops.map(e => ({ ...e, _type: 'workshop' })),
    ...seminars.map(e => ({ ...e, _type: 'seminar' })),
];

// Group events by execom year key, most recent first
const eventsByYear = {};
for (const event of allEvents) {
    const key = execomKey(event);
    if (!key) continue;
    if (!eventsByYear[key]) eventsByYear[key] = [];
    eventsByYear[key].push(event);
}

// Sorted year keys, descending
const YEAR_KEYS = Object.keys(eventsByYear).sort((a, b) => Number(b) - Number(a));

// ─────────────────────────────────────────────────────────────────────────────
// DOM wiring
// ─────────────────────────────────────────────────────────────────────────────

const tabsEl  = document.getElementById('eventYearTabs');
const gridEl  = document.getElementById('eventHistoryGrid');

if (tabsEl && gridEl) {

    const escapeHtml = (str) => String(str ?? '').replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    // Format the key as a display label, e.g. "2025" → "2025-26"
    function yearLabel(key) {
        return `${key}-${String(Number(key) + 1).slice(-2)}`;
    }

    // Build a single event card HTML string (same structure as the static
    // event-card articles in events.html)
    function buildCard(event) {
        const imgHtml = event.img
            ? `<img src="${escapeHtml(event.img)}" alt="${escapeHtml(event.title)}">`
            : `<img src="event-image/placeholder.png" alt="${escapeHtml(event.title)}">`;

        const dateDisplay = event.date ? escapeHtml(event.date) : '';

        const typeLabel = event._type === 'competition' ? 'Competition'
                        : event._type === 'seminar'     ? 'Expert Talk / Seminar'
                        : 'Workshop';

        const resourceHtml = event.resource
            ? `<a class="event-resource-link" href="${escapeHtml(event.resource)}" target="_blank" rel="noopener noreferrer">
                   ${escapeHtml(event.resourceLabel || 'Download resource')}
               </a>`
            : '';

        return `
            <article class="event-card in-view">
                <div class="event-image">
                    ${imgHtml}
                </div>
                <div class="event-body">
                    <div class="event-date">
                        ${dateDisplay}
                    </div>
                    <h3>${escapeHtml(event.title)}</h3>
                    <p>${escapeHtml(event.content)}</p>
                    ${resourceHtml}
                </div>
            </article>`;
    }

    function renderYear(key) {
        const events = eventsByYear[key];
        if (!events || !events.length) {
            gridEl.innerHTML = '<p style="color:var(--muted)">No events recorded for this year.</p>';
            return;
        }

        gridEl.innerHTML = events.map(buildCard).join('');

        // Re-wire the slideshow logic from script.js for any cards that have
        // multiple images (there are none currently, but future-proofing).
        gridEl.querySelectorAll('.event-image').forEach((frame) => {
            const images = Array.from(frame.children).filter((c) => c.tagName === 'IMG');
            if (!images.length) return;
            const showImage = (index) => {
                images.forEach((img, i) => img.classList.toggle('is-active', i === index));
                frame.style.setProperty('--event-image', `url("${images[index].src}")`);
            };
            showImage(0);
        });

        // Mark the active tab
        tabsEl.querySelectorAll('.year-tab').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.year === key);
        });
    }

    // Populate tab buttons dynamically from available data
    tabsEl.innerHTML = YEAR_KEYS.map((key) =>
        `<button class="year-tab" data-year="${escapeHtml(key)}">${escapeHtml(yearLabel(key))}</button>`
    ).join('');

    tabsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.year-tab');
        if (!btn) return;
        renderYear(btn.dataset.year);
    });

    // Default: show the most recent year (2025-26)
    if (YEAR_KEYS.length) {
        renderYear(YEAR_KEYS[0]);
    }
}
