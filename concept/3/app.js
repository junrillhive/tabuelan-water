// ===================================================================
// Tabuelan Water District — Concept 3 ("Coastal Community & Eco-Tropical")
// ===================================================================

const BARANGAYS = [
  { name: 'Bongon',       zone: 'Upland',  status: 'ok',   psi: 29, source: 'Upland Spring' },
  { name: 'Dalid',        zone: 'Upland',  status: 'ok',   psi: 28, source: 'Deep Well #2' },
  { name: 'Kanlim-ao',    zone: 'Upland',  status: 'warn', psi: 18, note: 'Pipeline extension works' },
  { name: 'Kanluhangon',  zone: 'Upland',  status: 'ok',   psi: 27, source: 'Spring Catchment' },
  { name: 'Kantubaon',    zone: 'Upland',  status: 'ok',   psi: 26, source: 'Spring Catchment' },
  { name: 'Mabunao',      zone: 'Upland',  status: 'ok',   psi: 29, source: 'Booster Line' },
  { name: 'Maravilla',    zone: 'Coastal', status: 'warn', psi: 21, note: 'Solar pump testing / flushing' },
  { name: 'Olivo',        zone: 'Coastal', status: 'ok',   psi: 31, source: 'Coastal Main' },
  { name: 'Poblacion',    zone: 'Coastal', status: 'ok',   psi: 33, source: 'Main Reservoir' },
  { name: 'Tabunok',      zone: 'Coastal', status: 'ok',   psi: 30, source: 'Main Reservoir' },
  { name: 'Tigbawan',     zone: 'Coastal', status: 'ok',   psi: 28, source: 'Coastal Main' },
  { name: 'Villahermosa', zone: 'Upland',  status: 'ok',   psi: 27, source: 'Upland Spring' }
];

const TARIFFS = {
  residential: { label: 'Residential',              min: 215.00, tiers: [24.50, 28.00, 32.50] },
  government:  { label: 'Government / Institutional', min: 215.00, tiers: [24.50, 28.00, 32.50] },
  commercial:  { label: 'Commercial / Industrial',  min: 430.00, tiers: [49.00, 56.00, 65.00] },
  bulk:        { label: 'Bulk / Wholesale',         min: 645.00, tiers: [73.50, 84.00, 97.50] }
};

const peso = n => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initNav();
  initNewsFilterAndModal();
  initToolTabs();
  initNetwork();
  initEstimator();
  initChecklist();
  initReportModal();
  initReveal();
  initScrollUI();
});

/* 1. PST clock + office open status */
function initClock() {
  const el = document.getElementById('pstClock');
  const status = document.getElementById('officeStatus');
  const dot = document.getElementById('openDot');
  if (!el) return;

  const fmt = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila', weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  });

  const tick = () => {
    const now = new Date();
    el.textContent = fmt.format(now) + ' PST';

    const manila = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const day = manila.getDay();
    const mins = manila.getHours() * 60 + manila.getMinutes();
    const open = day >= 1 && day <= 5 && mins >= 480 && mins < 1020;
    if (status) status.textContent = open
      ? 'Office open now · until 5:00 PM (no noon break)'
      : 'Office closed · opens Mon–Fri, 8:00 AM';
    if (dot) dot.style.background = open ? '#4ade80' : '#f2b33d';
  };
  tick();
  setInterval(tick, 1000);
}

/* 2. Mobile nav + scroll spy */
function initNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  const links = [...nav.querySelectorAll('a')];
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  sections.forEach(s => obs.observe(s));
}

/* 3. Announcements filter + search + reader modal */
function initNewsFilterAndModal() {
  const chips = document.querySelectorAll('.chip');
  const items = document.querySelectorAll('#newsList .news-item');
  const search = document.getElementById('newsSearch');
  const empty = document.getElementById('newsEmpty');
  let activeFilter = 'all';

  const applyFilter = () => {
    const q = (search?.value || '').trim().toLowerCase();
    let visibleCount = 0;
    items.forEach(it => {
      const catMatch = activeFilter === 'all' || it.dataset.category === activeFilter;
      const textMatch = !q || it.textContent.toLowerCase().includes(q);
      const show = catMatch && textMatch;
      it.classList.toggle('hidden', !show);
      if (show) visibleCount++;
    });
    if (empty) empty.style.display = visibleCount === 0 ? 'block' : 'none';
  };

  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.filter;
    applyFilter();
  }));
  search?.addEventListener('input', applyFilter);

  // Reader modal for news items
  const modal = document.getElementById('newsModal');
  const titleEl = document.getElementById('newsModalTitle');
  const dateEl = document.getElementById('newsModalDate');
  const bodyEl = document.getElementById('newsModalBody');
  const closeModal = () => {
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
  };

  items.forEach(item => {
    item.setAttribute('tabindex', '0');
    const openItem = () => {
      if (!modal) return;
      titleEl.textContent = item.dataset.title || item.querySelector('h4')?.textContent || 'Advisory';
      dateEl.textContent = 'Published ' + (item.dataset.date || 'October 2026');
      bodyEl.textContent = item.dataset.body || item.querySelector('p')?.textContent || '';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    };
    item.addEventListener('click', openItem);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openItem(); }
    });
  });

  document.getElementById('newsModalClose')?.addEventListener('click', closeModal);
  document.getElementById('newsModalOk')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
}

/* 4. Toolkit tabs (+ deep links from service cards & hero) */
function initToolTabs() {
  const tabs = document.querySelectorAll('.tool-tab');
  const activate = key => {
    tabs.forEach(t => {
      const on = t.dataset.tool === key;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on);
    });
    document.querySelectorAll('.tool-panel').forEach(p => p.classList.toggle('active', p.id === 'tool-' + key));
  };
  tabs.forEach(t => t.addEventListener('click', () => activate(t.dataset.tool)));
  document.querySelectorAll('.js-tool-link').forEach(l => l.addEventListener('click', () => activate(l.dataset.tool)));
}

/* 5. Network status grid + Coastal/Upland zone filter */
function initNetwork() {
  const grid = document.getElementById('netGrid');
  if (!grid) return;
  const color = { ok: '#4ade80', warn: '#f2b33d', off: '#e8613c' };

  const renderGrid = (zone = 'all') => {
    const list = zone === 'all' ? BARANGAYS : BARANGAYS.filter(b => b.zone === zone);
    grid.innerHTML = list.map(b => `
      <div class="net-item">
        <div class="net-item-top">
          <b>${b.name}</b>
          <span class="net-zone">${b.zone}</span>
        </div>
        <small><i class="dot dot-${b.status}" style="margin-right:5px;"></i>${b.note ? b.note : (b.source || 'Normal')} &bull; <strong>${b.psi} psi</strong></small>
        <div class="net-bar"><i style="width:${Math.min(100, b.psi / 35 * 100)}%; background:${color[b.status]}"></i></div>
      </div>`).join('');
  };

  renderGrid('all');

  document.querySelectorAll('.net-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.net-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrid(btn.dataset.zone);
    });
  });

  const upd = document.getElementById('netUpdated');
  if (upd) upd.textContent = 'Telemetry updated: ' + new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' }).format(new Date());

  const sel = document.getElementById('rBrgy');
  if (sel) sel.insertAdjacentHTML('beforeend', BARANGAYS.map(b => `<option>${b.name}</option>`).join(''));
}

/* 6. Bill estimator with Senior/PWD discount & daily liter gauge */
function initEstimator() {
  const cat = document.getElementById('estCategory');
  const range = document.getElementById('estVolumeRange');
  const num = document.getElementById('estVolume');
  const disc = document.getElementById('estDiscount');
  if (!cat || !range || !num) return;

  const calc = () => {
    const t = TARIFFS[cat.value];
    const v = Math.max(0, parseFloat(num.value) || 0);
    let excess = 0, rest = Math.max(0, v - 10);
    [10, 10, Infinity].forEach((size, i) => {
      const used = Math.min(rest, size);
      excess += used * t.tiers[i];
      rest -= used;
    });

    const gross = t.min + excess;
    const eligibleDiscount = disc?.checked && cat.value === 'residential' && v <= 30;
    const discountAmt = eligibleDiscount ? gross * 0.05 : 0;
    const net = gross - discountAmt;

    document.getElementById('rMin').textContent = peso(t.min);
    document.getElementById('rExcess').textContent = peso(excess);
    document.getElementById('rVol').textContent = v + ' m³';
    document.getElementById('rTotal').textContent = peso(net);

    const discRow = document.getElementById('rDiscountRow');
    const discVal = document.getElementById('rDiscount');
    if (discRow && discVal) {
      discRow.style.display = discountAmt > 0 ? 'flex' : 'none';
      discVal.textContent = '-' + peso(discountAmt);
    }

    const badge = document.getElementById('rEcoBadge');
    if (badge) {
      if (v <= 18) {
        badge.textContent = '🌿 Eco-Efficient Usage';
        badge.style.background = 'var(--leaf-100)';
        badge.style.color = 'var(--leaf-700)';
      } else if (v <= 30) {
        badge.textContent = '💧 Moderate Usage';
        badge.style.background = 'var(--sea-100)';
        badge.style.color = 'var(--sea-700)';
      } else {
        badge.textContent = '⚡ High Volume Bracket';
        badge.style.background = 'var(--sun-100)';
        badge.style.color = 'var(--sun-600)';
      }
    }

    const litersEl = document.getElementById('rLiters');
    if (litersEl) {
      const totalLiters = Math.round(v * 1000).toLocaleString('en-PH');
      const dailyLiters = Math.round((v * 1000) / 30).toLocaleString('en-PH');
      litersEl.innerHTML = `💧 Equivalent to <strong>${totalLiters} liters/month</strong> (~${dailyLiters} liters/day).`;
    }

    document.getElementById('tierBody').innerHTML = `
      <tr><td>First 10 m³ (minimum)</td><td>${peso(t.min)}</td></tr>
      <tr><td>11 – 20 m³</td><td>${peso(t.tiers[0])} / m³</td></tr>
      <tr><td>21 – 30 m³</td><td>${peso(t.tiers[1])} / m³</td></tr>
      <tr><td>31 m³ and above</td><td>${peso(t.tiers[2])} / m³</td></tr>`;
  };

  range.addEventListener('input', () => { num.value = range.value; calc(); });
  num.addEventListener('input', () => { range.value = Math.min(80, num.value || 0); calc(); });
  cat.addEventListener('change', calc);
  disc?.addEventListener('change', calc);
  calc();
}

/* 7. Interactive New Connection Checklist */
function initChecklist() {
  const boxes = document.querySelectorAll('.js-req-box');
  const status = document.getElementById('reqStatusText');
  if (!boxes.length || !status) return;

  const update = () => {
    const checked = [...boxes].filter(b => b.checked).length;
    status.textContent = checked === boxes.length
      ? '✓ All 4 requirements ready — visit our Poblacion office!'
      : `${checked} of ${boxes.length} items ready`;
  };
  boxes.forEach(b => b.addEventListener('change', update));
}

/* 8. Report modal with inline confirmation */
function initReportModal() {
  const modal = document.getElementById('reportModal');
  const form = document.getElementById('reportForm');
  const success = document.getElementById('reportSuccess');
  const refCode = document.getElementById('reportRefCode');
  if (!modal) return;
  let lastFocus = null;

  const open = () => {
    lastFocus = document.activeElement;
    if (form) form.style.display = 'block';
    success?.classList.remove('show');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('rName')?.focus(), 50);
  };
  const close = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocus?.focus();
  };

  document.querySelectorAll('.js-open-report').forEach(b => b.addEventListener('click', open));
  document.getElementById('reportClose')?.addEventListener('click', close);
  document.getElementById('reportCancel')?.addEventListener('click', close);
  document.getElementById('reportDoneBtn')?.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const ref = 'TAWD-' + Math.floor(100000 + Math.random() * 900000);
    if (refCode) refCode.textContent = ref;
    form.style.display = 'none';
    success?.classList.add('show');
    form.reset();
  });
}

/* 9. Header shadow + back-to-top */
function initScrollUI() {
  const header = document.querySelector('.site-header');
  const btn = document.getElementById('backToTop');
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 10);
    btn?.classList.toggle('show', y > 700);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  btn?.addEventListener('click', () => {
    window.scrollTo({ top: 0 });
    document.querySelector('.brand')?.focus({ preventScroll: true });
  });
  update();
}

/* 10. Scroll reveal, counters, progress rings, milestone line */
function initReveal() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const countUp = el => {
    const to = parseFloat(el.dataset.to);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    if (reduce) { el.textContent = to.toLocaleString('en-PH', { minimumFractionDigits: dec }); return; }
    const start = performance.now(), dur = 1400;
    const step = now => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * eased).toLocaleString('en-PH', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('in');
      el.querySelectorAll('.js-count').forEach(countUp);
      el.querySelectorAll('.ring').forEach(r => r.style.setProperty('--p', r.dataset.progress));
      el.querySelectorAll('.milestones').forEach(m => m.style.setProperty('--done', m.dataset.done));
      obs.unobserve(el);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}
