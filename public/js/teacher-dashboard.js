// public/js/teacher-dashboard.js
// Conservative live-detection: only explicit flags (implemented === true OR status === 'live') mark a feature as Live.
// This prevents accidental "url => Live" behavior.

(function(){
  const GRID_ID = 'features-grid';
  const QUICK_ID = 'quick-status';
  const API_PATH = '/api/teacher/features';

  const ICON_MAP = {
    lessonplan: '🧾',
    worksheet: '📝',
    reading: '📗',
    doubt: '❓',
    timetable: '📅',
    multilang: '🗣️',
    autoeval: '📸',
    visualaids: '📊',
    default: '★'
  };

  const grid = document.getElementById(GRID_ID);
  const quick = document.getElementById(QUICK_ID);

  function chooseIcon(f){
    if (!f) return ICON_MAP.default;
    if (f.icon) return f.icon;
    if (f.id && ICON_MAP[f.id.toLowerCase()]) return ICON_MAP[f.id.toLowerCase()];
    const t = (f.title || '').toLowerCase();
    if (t.includes('worksheet')) return ICON_MAP.worksheet;
    if (t.includes('lesson')) return ICON_MAP.lessonplan;
    if (t.includes('reading')) return ICON_MAP.reading;
    if (t.includes('doubt') || t.includes('ask')) return ICON_MAP.doubt;
    if (t.includes('timetable')) return ICON_MAP.timetable;
    if (t.includes('multilingual') || t.includes('language')) return ICON_MAP.multilang;
    if (t.includes('photo') || t.includes('evaluate')) return ICON_MAP.autoeval;
    return ICON_MAP.default;
  }

  // --- CONSERVATIVE LIVE DETECTION ---
  function isFeatureLive(f){
    if (!f) return false;
    // 1) explicit implemented flag
    if (f.implemented === true) return true;
    // 2) explicit status string == 'live'
    if (typeof f.status === 'string' && f.status.trim().toLowerCase() === 'live') return true;
    // otherwise => treat as upcoming (do NOT treat presence of url/link as live)
    return false;
  }

  function createCardElement(f){
    const card = document.createElement('div');
    card.className = 'feature-card';

    const icon = document.createElement('div');
    icon.className = 'feature-icon';
    icon.textContent = chooseIcon(f);

    const body = document.createElement('div');
    body.className = 'feature-body';
    const h3 = document.createElement('h3'); h3.textContent = f.title || 'Untitled';
    const p = document.createElement('p'); p.textContent = f.desc || '';
    body.appendChild(h3); body.appendChild(p);

    const live = isFeatureLive(f);
    const badge = document.createElement('div');
    badge.className = 'small-badge' + (live ? ' live' : '');
    badge.textContent = live ? 'Live' : 'Upcoming';

    // keep url if present for navigation but don't infer live from it
    const url = f.url || f.link || f.path || f.href;
    if (url) card.dataset.href = url;

    card.appendChild(icon);
    card.appendChild(body);
    card.appendChild(badge);

    card.addEventListener('click', () => {
      if (!isFeatureLive(f)) {
        alert(`${f.title || 'Feature'}\n\nThis feature is coming soon — we'll notify when it goes live.`);
        return;
      }
      if (url) location.href = url;
    });

    return card;
  }

  function renderFeatures(list){
    if (!grid) return;
    grid.innerHTML = '';
    const sorted = (Array.isArray(list) ? list.slice() : []).sort((a,b) => {
      const la = isFeatureLive(a) ? 0 : 1;
      const lb = isFeatureLive(b) ? 0 : 1;
      return la - lb;
    });
    sorted.forEach(f => grid.appendChild(createCardElement(f)));
    updateQuick(list);
  }

  function updateQuick(list){
    if (!quick) return;
    quick.innerHTML = '';
    const total = Array.isArray(list) ? list.length : 0;
    const liveCount = Array.isArray(list) ? list.filter(isFeatureLive).length : 0;
    const upCount = total - liveCount;

    const s1 = document.createElement('div'); s1.className='status-card';
    s1.innerHTML = `<div class="status-title">Live</div><div class="status-sub">${liveCount}</div>`;
    const s2 = document.createElement('div'); s2.className='status-card';
    s2.innerHTML = `<div class="status-title">Upcoming</div><div class="status-sub">${upCount}</div>`;
    quick.appendChild(s1); quick.appendChild(s2);
  }

  function loadFromGlobalOrFetch(){
    const globalFeatures = window.EDULEARN_TEACHER_FEATURES;
    if (Array.isArray(globalFeatures) && globalFeatures.length) {
      renderFeatures(globalFeatures);
      return;
    }

    fetch(API_PATH, { credentials: 'same-origin' }).then(res=>{
      if (!res.ok) throw new Error('fetch failed');
      return res.json();
    }).then(json=>{
      if (!json) throw new Error('no json');
      if (json.success && Array.isArray(json.features)) {
        renderFeatures(json.features);
        return;
      }
      if (Array.isArray(json)) {
        renderFeatures(json);
        return;
      }
      throw new Error('unexpected response');
    }).catch(err=>{
      console.warn('teacher-dashboard: could not load features', err);
      if (grid) grid.innerHTML = '<div style="padding:12px;color:#666">Features cannot be loaded right now.</div>';
    });
  }

  // keep old a[data-id] handler for view links
  document.addEventListener('click', function(e){
    const a = e.target.closest('a[data-id]');
    if(!a) return;
    e.preventDefault();
    const id = a.dataset.id;
    const features = window.EDULEARN_TEACHER_FEATURES || [];
    const feature = features.find(x=>x.id === id);
    if (feature) {
      alert(`${feature.title}\n\nStatus: ${feature.status || (feature.implemented ? 'Live':'Upcoming')}\n\n${feature.desc}\n\nComing soon — we'll notify when live.`);
    }
  });

  document.addEventListener('DOMContentLoaded', loadFromGlobalOrFetch);
})();
