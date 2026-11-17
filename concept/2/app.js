// ===================================================================
// Tabuelan Water District (TAWD) — Concept 2 Interactive Logic
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
  initPstClock();
  initMobileNav();
  initNetworkStatusWidget();
  initRatesCalculator();
  initRatesCategoryTabs();
  initAdvisoryFilter();
  initReportModal();
});

// 1. Philippine Standard Time (PST) Clock
function initPstClock() {
  const clockEl = document.getElementById('c2PstClock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const options = {
      timeZone: 'Asia/Manila',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    clockEl.textContent = new Intl.DateTimeFormat('en-PH', options).format(now) + ' PST';
  }

  update();
  setInterval(update, 1000);
}

// 2. Mobile Navigation
function initMobileNav() {
  const toggle = document.getElementById('c2MobileToggle');
  const nav = document.getElementById('c2Nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      const expanded = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
    });

    nav.querySelectorAll('.c2-nav-link:not(.has-dropdown)').forEach(l => {
      l.addEventListener('click', () => nav.classList.remove('open'));
    });
  }
}

// 3. Live Barangay Network Status Widget
const BARANGAY_STATUS = [
  { name: 'Poblacion', status: 'normal', text: 'Normal Pressure', pressure: '32 PSI' },
  { name: 'Sitio Ibabao', status: 'warning', text: 'Low Pressure (Mains Work)', pressure: '18 PSI' },
  { name: 'Tabunok', status: 'normal', text: 'Normal Pressure', pressure: '30 PSI' },
  { name: 'Maravilla', status: 'normal', text: 'Normal Pressure', pressure: '28 PSI' },
  { name: 'Kan-lunsing', status: 'normal', text: 'Normal Pressure', pressure: '29 PSI' },
  { name: 'Kantabogon', status: 'normal', text: 'Normal Pressure', pressure: '31 PSI' },
  { name: 'Mabun-ao', status: 'normal', text: 'Normal Pressure', pressure: '28 PSI' },
  { name: 'Olivo', status: 'normal', text: 'Normal Pressure', pressure: '30 PSI' },
  { name: 'Tigbawan', status: 'warning', text: 'Scheduled Flush (Tonight)', pressure: '22 PSI' },
  { name: 'Bongon', status: 'normal', text: 'Normal Pressure', pressure: '29 PSI' },
  { name: 'Villahermosa', status: 'normal', text: 'Normal Pressure', pressure: '27 PSI' },
  { name: 'Dalid', status: 'normal', text: 'Normal Pressure', pressure: '30 PSI' }
];

function initNetworkStatusWidget() {
  const listEl = document.getElementById('barangayStatusList');
  if (!listEl) return;

  function renderList(items) {
    listEl.innerHTML = items.map(b => `
      <div class="barangay-status-item">
        <span class="brgy-name">${b.name}</span>
        <span class="brgy-status status-${b.status}">${b.text} &bull; ${b.pressure}</span>
      </div>
    `).join('');
  }

  renderList(BARANGAY_STATUS);
}

// 4. LWUA Tiered Rates & Estimator
const TARIFF_RATES = {
  residential: {
    name: 'Residential / Domestic (1/2")',
    minCharge: 215.00,
    t1: 24.50, // 11-20
    t2: 28.00, // 21-30
    t3: 32.50  // 31+
  },
  commercial_b: {
    name: 'Commercial B (Sari-Sari / Small Shop)',
    minCharge: 322.50,
    t1: 36.75,
    t2: 42.00,
    t3: 48.75
  },
  commercial_a: {
    name: 'Commercial A (Hotels / Resorts / Eateries)',
    minCharge: 430.00,
    t1: 49.00,
    t2: 56.00,
    t3: 65.00
  },
  institutional: {
    name: 'Government & Institutional',
    minCharge: 300.00,
    t1: 32.00,
    t2: 38.50,
    t3: 45.00
  }
};

function initRatesCalculator() {
  const catSelect = document.getElementById('c2CalcCategory');
  const volInput = document.getElementById('c2CalcVolume');
  const baseEl = document.getElementById('c2BaseCharge');
  const excessEl = document.getElementById('c2ExcessCharge');
  const maintEl = document.getElementById('c2MaintFee');
  const totalEl = document.getElementById('c2TotalBill');

  if (!catSelect || !volInput) return;

  function recalculate() {
    const key = catSelect.value;
    const tariff = TARIFF_RATES[key] || TARIFF_RATES.residential;
    const vol = Math.max(0, parseFloat(volInput.value) || 0);

    const base = tariff.minCharge;
    let excess = 0;
    const maint = 15.00;

    if (vol > 10) {
      const diff = vol - 10;
      if (diff <= 10) {
        excess = diff * tariff.t1;
      } else if (diff <= 20) {
        excess = (10 * tariff.t1) + ((diff - 10) * tariff.t2);
      } else {
        excess = (10 * tariff.t1) + (10 * tariff.t2) + ((diff - 20) * tariff.t3);
      }
    }

    const total = base + excess + maint;

    baseEl.textContent = `₱${base.toFixed(2)}`;
    excessEl.textContent = `₱${excess.toFixed(2)}`;
    maintEl.textContent = `₱${maint.toFixed(2)}`;
    totalEl.textContent = `₱${total.toFixed(2)}`;
  }

  catSelect.addEventListener('change', recalculate);
  volInput.addEventListener('input', recalculate);
  recalculate();
}

// 5. Rates Category Table Switcher & Tab Sync
function initRatesCategoryTabs() {
  const tabs = document.querySelectorAll('.rates-pill-btn');
  const tableBody = document.getElementById('c2RatesTableBody');
  const titleEl = document.getElementById('c2RatesHeading');
  const catSelect = document.getElementById('c2CalcCategory');

  if (!tabs.length) return;

  const dataMap = {
    residential: {
      title: 'Residential & Domestic Tariff Schedule',
      min: '₱215.00',
      t1: '₱24.50',
      t2: '₱28.00',
      t3: '₱32.50'
    },
    commercial_b: {
      title: 'Commercial B (Small Business) Tariff Schedule',
      min: '₱322.50',
      t1: '₱36.75',
      t2: '₱42.00',
      t3: '₱48.75'
    },
    commercial_a: {
      title: 'Commercial A (Hotels & Resorts) Tariff Schedule',
      min: '₱430.00',
      t1: '₱49.00',
      t2: '₱56.00',
      t3: '₱65.00'
    },
    institutional: {
      title: 'Government & Institutional Tariff Schedule',
      min: '₱300.00',
      t1: '₱32.00',
      t2: '₱38.50',
      t3: '₱45.00'
    }
  };

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.getAttribute('data-category');
      const item = dataMap[cat] || dataMap.residential;

      if (catSelect && catSelect.value !== cat) {
        catSelect.value = cat;
        catSelect.dispatchEvent(new Event('change'));
      }

      if (titleEl) titleEl.textContent = item.title;

      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td><strong>Minimum (0 &ndash; 10 cu.m)</strong></td>
            <td><strong style="color:var(--brand-deep);">${item.min}</strong></td>
            <td>Initial flat charge for 1/2" meter</td>
          </tr>
          <tr>
            <td>11 &ndash; 20 cu.m</td>
            <td>${item.t1} / cu.m</td>
            <td>First consumption step</td>
          </tr>
          <tr>
            <td>21 &ndash; 30 cu.m</td>
            <td>${item.t2} / cu.m</td>
            <td>Second consumption step</td>
          </tr>
          <tr>
            <td>31 cu.m and above</td>
            <td>${item.t3} / cu.m</td>
            <td>High-volume tier</td>
          </tr>
        `;
      }
    });
  });

  // Also sync in reverse when select dropdown changes
  if (catSelect) {
    catSelect.addEventListener('change', () => {
      tabs.forEach(t => {
        if (t.getAttribute('data-category') === catSelect.value) {
          t.classList.add('active');
        } else {
          t.classList.remove('active');
        }
      });
    });
  }
}

// 6. Advisories Filter
function initAdvisoryFilter() {
  const buttons = document.querySelectorAll('.adv-tab-btn');
  const cards = document.querySelectorAll('.c2-adv-card');

  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// 7. Leak Report Modal
function initReportModal() {
  const modal = document.getElementById('c2ReportModal');
  const openButtons = document.querySelectorAll('.open-c2-report-modal');
  const closeButton = document.getElementById('c2ModalClose');
  const cancelButton = document.getElementById('c2ModalCancel');
  const form = document.getElementById('c2ReportForm');

  if (!modal) return;

  function open() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  openButtons.forEach(b => b.addEventListener('click', open));
  if (closeButton) closeButton.addEventListener('click', close);
  if (cancelButton) cancelButton.addEventListener('click', close);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ticket = 'TAWD-TKT-' + Math.floor(100000 + Math.random() * 900000);
      alert(`Report logged!\n\nTicket Code: ${ticket}\n\nOur field crew has been notified. Thank you for helping keep Tabuelan's water clean and conserved.`);
      form.reset();
      close();
    });
  }
}
