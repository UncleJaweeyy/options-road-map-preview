(() => {
  'use strict';
  const courses = window.ORM_COURSES;
  const categories = window.ORM_CATEGORIES;
  const MEMBERS_URL = 'private.html';
  const workspaceURL = (course, lesson = 0) => `${MEMBERS_URL}?course=${encodeURIComponent(course.id)}&lesson=${lesson}`;
  const CONTACT_URL = 'mailto:Paco@OptionsRoadMap.com?subject=Options%20Road%20Map%20archive%20access';
  const KEY = 'options-road-map:learning:v1';
  const isLibrary = document.body.dataset.page === 'library';
  const isWorkspace = document.body.dataset.page === 'workspace';
  const isHome = document.body.dataset.page === 'home';
  const paths = {
    'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    'arrow-up-right': '<path d="M6 18 18 6M6 6h12v12"/>',
    'arrow-down': '<path d="M12 4v16m-6-6 6 6 6-6"/>',
    'chevron-right': '<path d="m9 5 7 7-7 7"/>',
    'chevron-left': '<path d="m15 5-7 7 7 7"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'compass': '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/>',
    'book-open': '<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14"/>',
    'unlock': '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0m-4 8v2"/>',
    'lock': '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
    'chart': '<path d="M4 3v17h17M8 14l4-5 4 3 5-6"/>',
    'trending-up': '<path d="m3 17 6-6 4 4 8-10M14 5h7v7"/>',
    'route': '<circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 18h8a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h5"/>',
    'sparkles': '<path d="m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7Z"/>',
    'scan': '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M7 12h10m-5-5v10"/>',
    'sliders': '<path d="M5 3v7m0 4v7M12 3v12m0 4v2M19 3v2m0 4v12M2 10h6m1 5h6m1-10h6"/>',
    'shield': '<path d="m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6Zm-4 9 3 3 5-6"/>',
    'target': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    'bookmark': '<path d="M6 4h12v17l-6-4-6 4Z"/>',
    'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
    'search': '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    'grid': '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    'layers': '<path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 17l10 5 10-5"/>',
    'headphones': '<path d="M3 13v-1a9 9 0 0 1 18 0v1"/><rect x="3" y="12" width="4" height="8" rx="2"/><rect x="17" y="12" width="4" height="8" rx="2"/>',
    'message-circle': '<path d="M21 11.5a9 9 0 0 1-9.5 9 10 10 0 0 1-4-.9L3 21l1.4-4.4A9 9 0 1 1 21 11.5Z"/><path d="M8 11h8m-8 4h5"/>',
    'info': '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
    'play': '<path d="m9 5 11 7-11 7Z"/>',
    'file': '<path d="M14 3H5v18h14V8Zm0 0v5h5M8 13h8m-8 4h6"/>',
    'check': '<path d="m5 12 4 4L19 6"/>',
    'x': '<path d="m6 6 12 12M6 18 18 6"/>',
    'menu': '<path d="M4 7h16M4 12h16M4 17h16"/>',
    'edit': '<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>'
  };
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.compass}</svg>`;
  const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const hydrate = (root = document) => root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });

  let state = { saved: [], completed: {}, notes: {} };
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (stored && typeof stored === 'object') {
      state.saved = Array.isArray(stored.saved) ? [...new Set(stored.saved.filter(id => courses.some(course => course.id === id)))] : [];
      for (const course of courses) {
        const values = stored.completed?.[course.id];
        state.completed[course.id] = Array.isArray(values) ? [...new Set(values.filter(i => Number.isInteger(i) && i >= 0 && i < course.lessons.length))] : [];
        course.lessons.forEach((_, i) => { const key = `${course.id}:${i}`; if (typeof stored.notes?.[key] === 'string') state.notes[key] = stored.notes[key].slice(0, 5000); });
      }
    }
  } catch { /* A blocked or damaged storage entry must never prevent browsing. */ }
  let storageAvailable = true;
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageAvailable = true; return true; }
    catch { storageAvailable = false; toast('Changes kept for this visit. Browser storage is unavailable.'); return false; }
  }
  function completed(course) { return state.completed[course.id] || []; }
  let toastTimer;
  function toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message; el.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 2800);
  }

  const originalDisclaimer = [
    'It is SOLELY YOUR CHOICE and RESPONSIBILITY to trade in the stock, commodity futures or options markets and YOU CANNOT hold Options Road Map™ owner(s) or affiliates, Ken Roberts or anyone speaking in the videos or that have made statements in the downloadable material LIABLE FOR YOUR CHOICES.',
    'The information and opinions contained herein do not constitute, and should not be construed to constitute, an offer to sell or buy any stocks, commodity futures contracts or options by Options Road Map™ owner(s) or affiliates, Ken Roberts or anyone speaking in the videos or that have made statements in the downloadable material.',
    'The information and opinions contained herein are solely to help teach you the basics of stock market trading, futures trading and options trading.',
    'This website content is neither an advisory nor a recommendation to trade in the stock, commodity futures or options markets.',
    'Information included herein has been obtained from sources believed to be reliable and Options Road Map™ owner(s) or affiliates, Ken Roberts or anyone speaking in the videos or that have made statements in the downloadable material makes no representations or guarantees as to, and accepts no responsibility for, the accuracy of any information contained herein.',
    'There are large potential rewards, but there is a risk of loss trading stocks and commodities with or without this or any other advertised product, service or system.',
    'You must be aware of the risks and willing to accept them in order to invest in the stock, commodity futures and options markets.',
    'Don’t trade with money you can’t afford to lose.',
    'Options Road Map™ owner(s) or affiliates, Ken Roberts or anyone speaking in the videos or that have made statements in the downloadable material is not responsible for, and accepts no liability for, any losses you incur while trading the stock, commodities futures and options market.',
    'The Securities and Exchange Commission (SEC) and Commodity Futures Trading Commission (CFTC) requires we state that - Notice - Hypothetical or historical results have certain limitations.',
    'Unlike an actual performance record, historical results do not represent actual trading.',
    'Also, since some of the trades mentioned have not actually been executed, the results may have under- or over-compensated for the impact, if any, of certain market factors such as lack of liquidity.',
    'Historical trading programs in general are also subject to the fact that they are designed with the benefit of hindsight. No representation is being made that you will achieve profits similar to those shown.',
    'WARNING: FUTURES TRADING, STOCK TRADING, CURRENCY TRADING, OPTIONS TRADING, ETC., as applicable involves high risks and YOU can LOSE a lot of money.',
    'Being a successful PAPER TRADER during one time period does not mean that you will make money when you actually invest during a later time period. Market conditions constantly change.',
    'When investing in securities or the purchasing of options, as applicable you may lose all of the money you invested.',
    'When investing in futures or the granting of options, as applicable you may lose more than the funds you invested.',
    'Trading in commodity futures or options involves substantial risk of loss. According to many experts, most individual investors who trade commodity futures or options lose money.',
    'Past Results are not necessarily indicative of Future Results.'
  ];

  document.querySelector('[data-footer]').innerHTML = `<div class="container"><div class="footer-top"><div class="footer-brand"><a class="brand" href="index.html"><img src="assets/compass.svg" alt="" width="31" height="31"><span>Options<span class="brand-light">RoadMap</span><sup>™</sup></span></a><p>A clearer path to commodity options.<br>Knowledge, freely shared. Learning, at your pace.</p></div><div class="footer-links"><strong>KEEP EXPLORING</strong><a href="library.html">Learning library</a><a href="index.html#roadmap">The roadmap</a><a href="index.html#about">Our story</a></div><div class="footer-links"><strong>LET’S CONNECT</strong><a href="mailto:Paco@OptionsRoadMap.com">Paco@OptionsRoadMap.com</a><button data-access>Member access ↗</button><button data-risk>Risk disclosure</button></div></div><p class="footer-risk"><strong>Learning comes first.</strong> This is a historical educational archive, not investment advice or a recommendation to trade. Futures and options involve substantial risk of loss. Past results do not guarantee future results. Read the original disclaimer before using these materials.</p><div class="footer-bottom"><span>© 2026 Options Road Map™ / OptionsRoadMap.com. All rights reserved.</span><button data-risk>Read the full disclaimer ↗</button><span>Created with purpose. Shared by Paco.</span></div></div>`;
  document.querySelector('[data-dialogs]').innerHTML = `<dialog class="course-dialog" id="course-dialog" aria-labelledby="course-dialog-title"><button class="icon-button dialog-close" data-close aria-label="Close collection">${icon('x')}</button><div id="course-dialog-content"></div></dialog><dialog class="risk-dialog" id="risk-dialog" aria-labelledby="risk-title"><button class="icon-button dialog-close" data-close aria-label="Close risk disclosure">${icon('x')}</button><div class="eyebrow">PLEASE READ BEFORE USING THE ARCHIVE</div><h2 id="risk-title">The original disclaimer</h2><div class="risk-copy">${originalDisclaimer.map(p => `<p>${esc(p)}</p>`).join('')}</div><button class="button button-primary" data-close>Close disclaimer ${icon('check')}</button></dialog>`;

  document.querySelector('[data-dialogs]').insertAdjacentHTML('beforeend', `<dialog class="access-dialog" id="access-dialog" aria-labelledby="access-title" aria-describedby="access-description"><button class="icon-button dialog-close" data-close aria-label="Close member access">${icon('x')}</button><div class="access-icon">${icon('unlock')}</div><div class="eyebrow">YOUR NEXT STEP</div><h2 id="access-title">Member access</h2><p id="access-description">Ready to continue learning? Enter the member area to explore the archive. If you need access or have a question, contact Paco.</p><div class="access-actions"><a class="button button-primary" href="${MEMBERS_URL}">Enter member access ${icon('arrow-right')}</a><a class="button button-outline" href="${CONTACT_URL}">Contact Paco ${icon('message-circle')}</a></div><p class="access-footnote">UI/UX preview: the member area is open for review. Account sign-in is not enabled in this preview.</p></dialog>`);

  function cover(course, interactive = true) {
    const tag = `<span class="cover-tag${course.id === 'get-going' ? ' start' : ''}">${esc(course.tag)}</span>`;
    const media = course.image ? `<img src="${esc(course.image)}" alt="Original ${esc(course.title)} recording" loading="lazy">` : `<svg class="cover-drawing" viewBox="0 0 400 200" fill="none" aria-hidden="true"><circle cx="200" cy="100" r="65" stroke="currentColor" stroke-opacity=".2"/><circle cx="200" cy="100" r="93" stroke="currentColor" stroke-opacity=".15"/><path d="M-20 170C60 170 60 130 130 140S230 70 280 80 340 35 420 35" stroke="currentColor" stroke-width="1.5" stroke-opacity=".6"/><path d="m35 155 6 6 6-6m289-95 6-6 6 6" stroke="currentColor"/></svg><span class="cover-center-icon">${icon(course.icon)}</span><span class="cover-footnote">THE ORIGINAL TEACHINGS · ${esc(course.author.toUpperCase())}</span>`;
    const classes = `course-cover ${course.image ? 'photo-cover' : `designed-cover cover-${course.tone || 'sage'}`}`;
    return interactive ? `<button class="${classes}" data-course="${course.id}" aria-label="Explore ${esc(course.title)}">${media}${tag}</button>` : `<div class="${classes}">${media}${tag}</div>`;
  }
  function card(course) {
    const saved = state.saved.includes(course.id);
    const done = completed(course).length;
    const count = course.lessons.length;
    return `<article class="course-card" data-course-card="${course.id}">${cover(course)}<button class="bookmark-button" data-save="${course.id}" aria-label="${saved ? 'Unsave' : 'Save'} ${esc(course.title)}" aria-pressed="${saved}">${icon('bookmark')}</button><div class="course-body"><div class="course-category"><span>${esc(course.category)}</span>${done ? `<span class="course-complete">${done === count ? '✓ Complete' : `${done}/${count} reviewed`}</span>` : ''}</div><button class="course-title" data-course="${course.id}">${esc(course.title)}</button><p class="course-description">${esc(course.description)}</p><div class="course-bottom"><span class="course-meta">${icon(course.format === 'Audio' ? 'headphones' : 'play')}${count} ${count === 1 ? 'lesson' : 'lessons'}<span aria-hidden="true">·</span>${esc(course.format)}</span><button class="course-open" data-course="${course.id}">Explore collection ${icon('arrow-up-right')}</button></div>${done ? `<div class="course-progress" aria-label="${done} of ${count} lessons reviewed"><span style="width:${done / count * 100}%"></span></div>` : ''}</div></article>`;
  }
  function renderHome() {
    const grid = document.getElementById('featured-courses');
    if (grid) grid.innerHTML = courses.filter(c => ['get-going', 'retracement', 'tools'].includes(c.id)).map(card).join('');
  }
  const initialParams = new URLSearchParams(location.search);
  let category = categories.some(c => c.name === initialParams.get('category')) ? initialParams.get('category') : 'All topics';
  let view = ['all', 'saved', 'progress'].includes(initialParams.get('view')) ? initialParams.get('view') : 'all';
  let activeCourse = null;
  let activeLesson = 0;
  let courseOpener = null;
  function updateURL(courseId = activeCourse?.id) {
    if (!isLibrary) return;
    const params = new URLSearchParams();
    if (category !== 'All topics') params.set('category', category);
    if (view !== 'all') params.set('view', view);
    const query = document.getElementById('course-search')?.value.trim();
    if (query) params.set('q', query);
    if (courseId) params.set('course', courseId);
    try { history.replaceState(null, '', `${location.pathname}${params.size ? '?' + params.toString() : ''}`); } catch { /* File previews can still browse. */ }
  }
  function renderLibrary() {
    if (!isLibrary) return;
    const query = document.getElementById('course-search').value.trim().toLowerCase();
    const sort = document.getElementById('course-sort').value;
    const filtered = courses.filter(c => (category === 'All topics' || c.category === category) && (view === 'all' || (view === 'saved' ? state.saved.includes(c.id) : completed(c).length > 0 && completed(c).length < c.lessons.length)) && `${c.title} ${c.description} ${c.category} ${c.author} ${c.resources.map(resource => typeof resource === 'string' ? resource : resource.title).join(' ')}`.toLowerCase().includes(query));
    if (sort === 'az') filtered.sort((a,b) => a.title.localeCompare(b.title));
    if (sort === 'lessons') filtered.sort((a,b) => b.lessons.length - a.lessons.length);
    document.getElementById('library-courses').innerHTML = filtered.map(card).join('');
    document.getElementById('results-count').innerHTML = `<strong>${filtered.length} ${filtered.length === 1 ? 'collection' : 'collections'}</strong>${category !== 'All topics' ? ` in ${esc(category)}` : ' to explore'}`;
    const empty = document.getElementById('empty-state');
    empty.hidden = filtered.length > 0;
    empty.querySelector('h2').textContent = view === 'saved' && !state.saved.length ? 'Your next chapter is worth saving.' : view === 'progress' && !courses.some(c => completed(c).length > 0 && completed(c).length < c.lessons.length) ? 'Your learning journey starts here.' : 'No collections found.';
    empty.querySelector('p').textContent = view === 'saved' && !state.saved.length ? 'Use the bookmark on any collection to keep it close.' : view === 'progress' ? 'Open a collection and mark the lessons you’ve reviewed.' : 'Try another keyword or explore a different topic.';
    document.getElementById('all-count').textContent = courses.length;
    document.getElementById('saved-count').textContent = state.saved.length;
    document.querySelectorAll('[data-view]').forEach(button => { button.classList.toggle('active', button.dataset.view === view); button.setAttribute('aria-pressed', String(button.dataset.view === view)); });
    document.getElementById('category-filters').innerHTML = categories.map(c => `<button class="category-button${category === c.name ? ' active' : ''}" data-category="${esc(c.name)}" aria-pressed="${category === c.name}">${icon(c.icon)}<span>${esc(c.name)}</span><span>${c.name === 'All topics' ? courses.length : courses.filter(course => course.category === c.name).length}</span></button>`).join('');
    updateURL();
  }
  function resetFilters() {
    category = 'All topics'; view = 'all';
    document.getElementById('course-search').value = '';
    document.getElementById('course-sort').value = 'recommended';
    renderLibrary(); document.getElementById('course-search').focus();
  }

  const courseDialog = document.getElementById('course-dialog');
  function renderLessons() {
    const course = activeCourse;
    const done = completed(course);
    document.getElementById('lesson-list').innerHTML = course.lessons.map((lesson, i) => `<div class="lesson-row${activeLesson === i ? ' active' : ''}"><button class="lesson-select" data-lesson="${i}" aria-pressed="${activeLesson === i}"><span class="lesson-num">${String(i+1).padStart(2,'0')}</span><span><strong>${esc(lesson.title)}</strong><small>${done.includes(i) ? 'Reviewed' : `${esc(course.format)} · Original archive`}</small></span></button><label class="lesson-check"><input type="checkbox" data-complete="${i}" aria-label="Mark ${esc(lesson.title)} reviewed" ${done.includes(i) ? 'checked' : ''}></label></div>`).join('');
    document.getElementById('progress-copy').textContent = `${done.length} of ${course.lessons.length} reviewed`;
    document.getElementById('progress-percent').textContent = `${Math.round(done.length/course.lessons.length*100)}%`;
    document.getElementById('lesson-progress-fill').style.width = `${done.length/course.lessons.length*100}%`;
    document.getElementById('active-lesson').textContent = course.lessons[activeLesson].title;
  }
  function mediaSource(value, kind = 'media') {
    const pattern = kind === 'documents' ? /^(https:\/\/|assets\/documents\/)[^\s<>"']+$/ : /^(https:\/\/|assets\/media\/)[^\s<>"']+$/;
    return typeof value === 'string' && pattern.test(value) ? value : null;
  }
  function renderMedia() {
    const course = activeCourse;
    const lesson = course.lessons[activeLesson];
    const preview = document.getElementById('detail-preview');
    // Playback is enabled only when an authorized media URL is supplied in courses.js.
    // Never collect an archive password or simulate authentication in the browser.
    const source = mediaSource(lesson.source);
    if (source) preview.innerHTML = course.format === 'Audio' ? `<audio controls preload="none" class="native-video" src="${esc(source)}">Your browser does not support audio playback.</audio>` : `<video controls preload="metadata" playsinline class="native-video" ${course.image ? `poster="${esc(course.image)}"` : ''} src="${esc(source)}">Your browser does not support video playback.</video>`;
    else preview.innerHTML = `${cover(course, false)}<div class="preview-access">${icon('book-open')}<strong>Your lesson workspace</strong><small>Lesson navigation, resources, and personal notes.</small><a class="button" href="${workspaceURL(course, activeLesson)}">Open lesson workspace ${icon('arrow-right')}</a></div>`;
  }
  function openCourse(id) {
    const course = courses.find(c => c.id === id);
    if (!course) return;
    courseOpener = document.activeElement;
    activeCourse = course;
    activeLesson = course.lessons.findIndex((_, i) => !completed(course).includes(i));
    if (activeLesson < 0) activeLesson = 0;
    document.getElementById('course-dialog-content').innerHTML = `<div class="course-dialog-layout"><div class="course-detail"><div class="eyebrow">${esc(course.category.toUpperCase())} · ORIGINAL COLLECTION</div><h2 id="course-dialog-title">${esc(course.title)}</h2><p class="detail-description">${esc(course.description)}</p><div class="detail-preview" id="detail-preview"></div><p class="active-lesson-label" id="active-lesson"></p><div class="detail-meta"><span>${icon('play')}${course.lessons.length} ${course.lessons.length === 1 ? 'lesson' : 'lessons'}</span><span>${icon('book-open')}${esc(course.author)}</span></div><p class="detail-archive-note">${esc(course.note || 'Explore the collection in your learning workspace. Have a question about the material?')} ${course.note ? '' : `<a class="inline-link" href="${CONTACT_URL}">Email Paco ↗</a>`}</p>${course.resources.length ? `<h3 class="detail-resource-heading">Companion resources</h3><div class="detail-resources">${course.resources.map(resource => `<a class="resource-link" href="private.html?course=${encodeURIComponent(course.id)}#resources" aria-label="Find ${esc(resource)} in the learning workspace">${icon('file')}<span>${esc(typeof resource === 'string' ? resource : resource.title)}</span><span>${icon('arrow-up-right')}</span></a>`).join('')}</div><p class="lesson-tip">Companion resources open in the learning workspace.</p>` : ''}</div><div class="course-lessons"><h3>Your learning roadmap</h3><p class="lesson-instruction">Select a lesson. Track what you’ve reviewed.</p><div class="lesson-progress-copy"><span id="progress-copy"></span><span id="progress-percent"></span></div><div class="lesson-progress-bar"><span id="lesson-progress-fill"></span></div><div id="lesson-list"></div><p class="lesson-tip">Use the checkboxes after reviewing each lesson. Progress is saved in this browser.</p></div></div>`;
    renderMedia(); renderLessons();
    courseDialog.showModal(); courseDialog.scrollTop = 0;
    updateURL(course.id);
  }
  courseDialog.addEventListener('close', () => {
    courseDialog.querySelectorAll('video,audio').forEach(media => media.pause());
    const closedId = activeCourse?.id;
    activeCourse = null; updateURL(null);
    const focusTarget = courseOpener?.isConnected && courseOpener !== document.body ? courseOpener : document.querySelector(`[data-course="${closedId}"]`);
    focusTarget?.focus({ preventScroll: true });
  });
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }));

  document.addEventListener('click', event => {
    const close = event.target.closest('[data-close]');
    if (close) { close.closest('dialog').close(); return; }
    const save = event.target.closest('[data-save]');
    if (save) {
      const id = save.dataset.save;
      if (!courses.some(c => c.id === id)) return;
      const saved = state.saved.includes(id);
      state.saved = saved ? state.saved.filter(value => value !== id) : [...state.saved, id];
      persist(); renderHome(); renderLibrary();
      // Keep keyboard focus on the corresponding control when it remains in the view.
      const replacement = document.querySelector(`[data-save="${id}"]`);
      (replacement || document.querySelector(`[data-view="${view}"]`))?.focus({ preventScroll: true });
      if (storageAvailable) toast(saved ? 'Collection removed from saved.' : 'Collection saved. A little knowledge, kept close.');
      return;
    }
    const collection = event.target.closest('[data-course]');
    if (collection) { openCourse(collection.dataset.course); return; }
    if (event.target.closest('[data-access]')) { const dialog = document.getElementById('access-dialog'); dialog.showModal(); dialog.scrollTop = 0; return; }
    if (event.target.closest('[data-risk]')) { const dialog = document.getElementById('risk-dialog'); dialog.showModal(); dialog.scrollTop = 0; return; }
    const filter = event.target.closest('[data-category]');
    if (filter) { category = filter.dataset.category; renderLibrary(); document.querySelector(`[data-category="${category}"]`)?.focus({ preventScroll: true }); return; }
    const tab = event.target.closest('[data-view]');
    if (tab) { view = tab.dataset.view; renderLibrary(); return; }
    const lesson = event.target.closest('[data-lesson]');
    if (lesson && activeCourse) { activeLesson = Number(lesson.dataset.lesson); renderMedia(); renderLessons(); document.querySelector(`[data-lesson="${activeLesson}"]`)?.focus({ preventScroll: true }); return; }
    if (event.target.closest('#reset-filters')) resetFilters();
  });
  document.addEventListener('change', event => {
    const target = event.target;
    if (!target.matches('[data-complete]') || !activeCourse) return;
    const i = Number(target.dataset.complete);
    if (!Number.isInteger(i) || i < 0 || i >= activeCourse.lessons.length) return;
    const done = completed(activeCourse);
    state.completed[activeCourse.id] = target.checked ? [...new Set([...done, i])] : done.filter(value => value !== i);
    persist(); renderLessons(); renderHome(); renderLibrary();
    document.querySelector(`[data-complete="${i}"]`)?.focus({ preventScroll: true });
  });
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  function closeNav() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); menu.innerHTML = icon('menu'); }
  menu.addEventListener('click', () => {
    const open = !nav.classList.contains('open'); nav.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); menu.innerHTML = icon(open ? 'x' : 'menu');
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeNav(); });
  if (isHome && nav) {
    const navHome = nav.querySelector('a[href="index.html"], a[href="./"], a[href="/"]');
    const navRoadmap = nav.querySelector('a[href="#roadmap"]');
    const navAbout = nav.querySelector('a[href="#about"]');

    let currentSection = 'home';
    function setActiveNav(section) {
      if (section === currentSection) return;
      currentSection = section;
      const targets = { home: navHome, roadmap: navRoadmap, about: navAbout };
      Object.entries(targets).forEach(([key, link]) => {
        if (!link) return;
        if (key === section) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }

    function getActiveSectionFromScroll() {
      const roadmapEl = document.getElementById('roadmap');
      const aboutEl = document.getElementById('about');
      if (!roadmapEl || !aboutEl) return 'home';

      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      if (docHeight - scrollBottom < 60) return 'about';

      const headerOffset = 180;
      if (aboutEl.getBoundingClientRect().top <= headerOffset) return 'about';
      if (roadmapEl.getBoundingClientRect().top <= headerOffset) return 'roadmap';
      return 'home';
    }

    let scrollLockTimeout = null;
    function lockScroll() {
      clearTimeout(scrollLockTimeout);
      scrollLockTimeout = setTimeout(() => { scrollLockTimeout = null; }, 400);
    }

    const unlock = () => { scrollLockTimeout = null; };
    window.addEventListener('wheel', unlock, { passive: true });
    window.addEventListener('touchmove', unlock, { passive: true });

    window.addEventListener('scroll', () => {
      if (scrollLockTimeout) return;
      setActiveNav(getActiveSectionFromScroll());
    }, { passive: true });

    document.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (link === navHome || (link.closest('.brand') && isHome)) {
        event.preventDefault();
        if (window.location.hash) {
          history.pushState(null, '', window.location.pathname);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveNav('home');
        lockScroll();
      } else if (href === '#roadmap' || href === 'index.html#roadmap') {
        setActiveNav('roadmap');
        lockScroll();
      } else if (href === '#about' || href === 'index.html#about') {
        setActiveNav('about');
        lockScroll();
      }
    });

    function syncNavFromHash() {
      const hash = window.location.hash;
      if (hash === '#roadmap') setActiveNav('roadmap');
      else if (hash === '#about') setActiveNav('about');
      else if (!hash || hash === '#main') setActiveNav(getActiveSectionFromScroll());
    }

    window.addEventListener('hashchange', () => {
      syncNavFromHash();
    });

    currentSection = '';
    syncNavFromHash();
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) { closeNav(); menu.focus(); }
    if (event.key === '/' && isLibrary && !event.ctrlKey && !event.metaKey && !event.altKey && !document.querySelector('dialog[open]') && !event.target.closest('input,textarea,select,[contenteditable]')) { event.preventDefault(); document.getElementById('course-search').focus(); }
  });
  document.addEventListener('click', event => { if (nav.classList.contains('open') && !event.composedPath().includes(document.querySelector('.header-inner'))) closeNav(); });
  if (isLibrary) {
    document.getElementById('course-search').value = initialParams.get('q') || '';
    document.getElementById('course-search').addEventListener('input', renderLibrary);
    document.getElementById('course-sort').addEventListener('change', renderLibrary);
  }
  renderHome(); renderLibrary(); hydrate();
  const requestedCourse = initialParams.get('course');
  if (isLibrary && requestedCourse) openCourse(requestedCourse);
  window.ORM_UI = {
    icon,
    esc,
    state,
    persist,
    completed,
    cover,
    mediaSource
  };
})();
