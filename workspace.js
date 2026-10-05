(() => {
  'use strict';
  const { icon, esc, state, persist, completed, cover, mediaSource } = window.ORM_UI;
  const courses = window.ORM_COURSES;
  const el = id => document.getElementById(id);
  let course;
  let lessonIndex = 0;
  let currentTab = 'overview';
  let noteTimer;
  let noteDirty = false;
  const noteKey = () => `${course.id}:${lessonIndex}`;
  const notes = state.notes;

  function readLocation() {
    const params = new URLSearchParams(location.search);
    course = courses.find(c => c.id === params.get('course')) || courses[0];
    const requested = params.get('lesson');
    const number = requested === null ? course.lessons.findIndex((_, i) => !completed(course).includes(i)) : Number(requested);
    lessonIndex = Number.isInteger(number) && number >= 0 && number < course.lessons.length ? number : 0;
    currentTab = ['resources', 'notes'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'overview';
  }
  function setLocation(push = false) {
    const url = `${location.pathname}?course=${encodeURIComponent(course.id)}&lesson=${lessonIndex}${currentTab !== 'overview' ? '#' + currentTab : ''}`;
    try { history[push ? 'pushState' : 'replaceState'](null, '', url); } catch { /* File previews can still browse. */ }
  }
  function renderPlayer() {
    const lesson = course.lessons[lessonIndex];
    const source = mediaSource(lesson.source);
    const player = el('workspace-player');
    player.querySelectorAll('video,audio').forEach(media => media.pause());
    if (source) {
      player.innerHTML = course.format === 'Audio'
        ? `<div class="workspace-audio-stage">${icon('headphones')}<strong>${esc(lesson.title)}</strong><audio controls preload="metadata" src="${esc(source)}">Your browser does not support audio playback.</audio></div>`
        : `<video controls preload="metadata" playsinline ${course.image ? `poster="${esc(course.image)}"` : ''} src="${esc(source)}">Your browser does not support video playback.</video>`;
    } else {
      player.innerHTML = `${cover(course, false)}<div class="workspace-unavailable"><span class="workspace-media-icon">${icon(course.format === 'Audio' ? 'headphones' : 'play')}</span><strong>Recording unavailable</strong><p>This lesson’s recording is currently unavailable.<br>You can explore the collection and keep your notes here.</p><span class="workspace-media-status"><i class="status-dot"></i> ${esc(course.format)} · ${esc(course.author)}</span></div>`;
    }
    el('workspace-media-label').innerHTML = `${icon(course.format === 'Audio' ? 'headphones' : 'play')} ${esc(course.format.toUpperCase())} LESSON`;
    el('workspace-lesson-count').textContent = `Lesson ${lessonIndex + 1} of ${course.lessons.length}`;
    el('workspace-lesson-title').textContent = lesson.title;
    el('workspace-previous').disabled = lessonIndex === 0;
    el('workspace-next').disabled = lessonIndex === course.lessons.length - 1;
    el('workspace-reviewed').checked = completed(course).includes(lessonIndex);
  }
  function renderProgress() {
    const done = completed(course);
    el('workspace-progress-label').textContent = `${done.length} of ${course.lessons.length} reviewed`;
    el('workspace-progress-percent').textContent = `${Math.round(done.length / course.lessons.length * 100)}%`;
    el('workspace-progress-fill').style.width = `${done.length / course.lessons.length * 100}%`;
    el('workspace-reviewed').checked = done.includes(lessonIndex);
    el('workspace-curriculum-list').innerHTML = course.lessons.map((lesson, i) => `<button class="workspace-curriculum-item${i === lessonIndex ? ' active' : ''}" data-workspace-lesson="${i}" aria-current="${i === lessonIndex ? 'step' : 'false'}"><span class="workspace-lesson-number${done.includes(i) ? ' reviewed' : ''}">${done.includes(i) ? icon('check') : String(i + 1).padStart(2, '0')}</span><span class="workspace-curriculum-copy"><strong>${esc(lesson.title)}</strong><small>${done.includes(i) ? 'Reviewed' : esc(course.format) + ' lesson'}</small></span><span class="workspace-current-icon">${icon(i === lessonIndex ? 'play' : 'chevron-right')}</span></button>`).join('');
  }
  function renderSaved() {
    const saved = state.saved.includes(course.id);
    const button = el('workspace-save');
    button.innerHTML = `${icon('bookmark')} ${saved ? 'Collection saved' : 'Save collection'}`;
    button.setAttribute('aria-pressed', String(saved));
  }
  function renderResources() {
    el('workspace-resource-count').textContent = course.resources.length;
    el('workspace-resources').innerHTML = course.resources.length ? course.resources.map(resource => {
      const name = typeof resource === 'string' ? resource : resource.title;
      const source = typeof resource === 'object' ? mediaSource(resource.source, 'documents') : null;
      return `<div class="workspace-resource-row"><span class="workspace-resource-icon">${icon('file')}</span><div><strong>${esc(name)}</strong><small>Companion reference material</small></div>${source ? `<a class="button button-outline" href="${esc(source)}" target="_blank" rel="noopener noreferrer">Open file ${icon('arrow-up-right')}</a>` : '<span class="workspace-resource-unavailable">File unavailable</span>'}</div>`;
    }).join('') : `<div class="workspace-resources-empty">${icon('book-open')}<strong>No companion files listed</strong><p>This collection contains the lesson series shown in the course content panel.</p></div>`;
    el('workspace-resource-note').innerHTML = course.resources.length ? `The companion files are not available on this site yet. <a class="inline-link" href="mailto:Paco@OptionsRoadMap.com?subject=${encodeURIComponent('Resource request: ' + course.title)}">Contact Paco about these resources ${icon('arrow-up-right')}</a>` : '';
  }
  function renderNotes() {
    clearTimeout(noteTimer); noteDirty = false;
    el('workspace-notes').value = notes[noteKey()] || '';
    el('workspace-note-length').textContent = el('workspace-notes').value.length.toLocaleString('en-US');
    el('workspace-note-lesson').textContent = `${course.title} · ${course.lessons[lessonIndex].title}`;
    el('workspace-note-status').textContent = 'Saved in this browser';
  }
  function saveNotes() {
    clearTimeout(noteTimer);
    if (!noteDirty) return;
    const text = el('workspace-notes').value.slice(0, 5000);
    if (text) notes[noteKey()] = text; else delete notes[noteKey()];
    const saved = persist();
    el('workspace-note-status').textContent = saved ? 'Saved in this browser' : 'Kept for this visit';
    noteDirty = false;
  }
  function selectTab(name, update = true) {
    currentTab = ['overview', 'resources', 'notes'].includes(name) ? name : 'overview';
    document.querySelectorAll('[data-workspace-tab]').forEach(button => {
      const active = button.dataset.workspaceTab === currentTab;
      button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
      el('panel-' + button.dataset.workspaceTab).hidden = !active;
    });
    if (update) setLocation();
  }
  function renderCourse() {
    document.title = `${course.title} — Options Road Map`;
    el('workspace-title').textContent = course.title;
    el('workspace-description').textContent = course.description;
    el('workspace-breadcrumb-title').textContent = course.title;
    el('workspace-course-meta').innerHTML = `<span>${icon('book-open')}${esc(course.author)}</span><span>${icon('layers')}${esc(course.category)}</span><span>${icon('play')}${course.lessons.length} ${course.lessons.length === 1 ? 'lesson' : 'lessons'}</span>`;
    el('workspace-course-select').innerHTML = courses.map(c => `<option value="${c.id}" ${course.id === c.id ? 'selected' : ''}>${esc(c.title)}</option>`).join('');
    el('workspace-sidebar-count').textContent = `${course.lessons.length} lessons`;
    el('workspace-overview').textContent = course.description;
    el('workspace-archive-note').textContent = course.note || `This collection preserves the original teachings of ${course.author}. Use the lesson list to explore the series and return to the material at your own pace.`;
    renderPlayer(); renderProgress(); renderSaved(); renderResources(); renderNotes(); selectTab(currentTab, false); setLocation();
  }
  function chooseLesson(index, push = true) {
    if (!Number.isInteger(index) || index < 0 || index >= course.lessons.length) return;
    saveNotes(); lessonIndex = index;
    renderPlayer(); renderProgress(); renderNotes(); setLocation(push);
  }
  el('workspace-course-select').addEventListener('change', event => {
    const selected = courses.find(c => c.id === event.target.value);
    if (!selected) return;
    saveNotes(); course = selected; lessonIndex = Math.max(0, course.lessons.findIndex((_, i) => !completed(course).includes(i)));
    renderCourse();
  });
  el('workspace-curriculum-list').addEventListener('click', event => {
    const button = event.target.closest('[data-workspace-lesson]');
    if (button) { chooseLesson(Number(button.dataset.workspaceLesson)); el('workspace-curriculum-list').querySelector(`[data-workspace-lesson="${lessonIndex}"]`)?.focus({ preventScroll: true }); }
  });
  el('workspace-previous').addEventListener('click', () => chooseLesson(lessonIndex - 1));
  el('workspace-next').addEventListener('click', () => chooseLesson(lessonIndex + 1));
  el('workspace-reviewed').addEventListener('change', event => {
    const done = completed(course);
    state.completed[course.id] = event.target.checked ? [...new Set([...done, lessonIndex])] : done.filter(i => i !== lessonIndex);
    persist(); renderProgress();
  });
  el('workspace-save').addEventListener('click', () => {
    state.saved = state.saved.includes(course.id) ? state.saved.filter(id => id !== course.id) : [...state.saved, course.id];
    persist(); renderSaved();
  });
  document.querySelector('.workspace-tabs').addEventListener('click', event => { const button = event.target.closest('[data-workspace-tab]'); if (button) selectTab(button.dataset.workspaceTab); });
  document.querySelector('.workspace-tabs').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const names = ['overview', 'resources', 'notes'];
    let index = names.indexOf(currentTab);
    index = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : -1) + 3) % 3;
    selectTab(names[index]); el('tab-' + names[index]).focus();
  });
  el('workspace-notes').addEventListener('input', () => {
    noteDirty = true; el('workspace-note-status').textContent = 'Saving…';
    el('workspace-note-length').textContent = el('workspace-notes').value.length.toLocaleString('en-US');
    clearTimeout(noteTimer); noteTimer = setTimeout(saveNotes, 350);
  });
  el('workspace-save-notes').addEventListener('click', saveNotes);
  window.addEventListener('pagehide', saveNotes);
  window.addEventListener('popstate', () => { saveNotes(); readLocation(); renderCourse(); });
  window.addEventListener('hashchange', () => selectTab(location.hash.slice(1), false));
  readLocation(); renderCourse();
})();
