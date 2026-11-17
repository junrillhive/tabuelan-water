// ===================================================================
// Tabuelan Water District (TAWD) — Concept 1 Interactive Logic
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
  initPstClock();
  initMobileNav();
  initAdvisoryTicker();
  initRatesCalculator();
  initRatesCategoryTabs();
  initReportModal();
});

// 1. Philippine Standard Time (PST) Live Clock
function initPstClock() {
  const clockEl = document.getElementById('pstClockDisplay');
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    // PST is UTC+8
    const options = {
      timeZone: 'Asia/Manila',
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    clockEl.textContent = new Intl.DateTimeFormat('en-PH', options).format(now) + ' PST';
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// 2. Mobile Navigation Toggle
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const mainNav = document.getElementById('mainNav');

  if (toggleBtn && mainNav) {
    toggleBtn.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      const isExpanded = mainNav.classList.contains('open');
      toggleBtn.setAttribute('aria-expanded', isExpanded);
    });

    // Close on navigation click
    mainNav.querySelectorAll('.nav-link:not(.has-dropdown)').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
      });
    });
  }
}

// 3. Advisory Ticker Dismiss
function initAdvisoryTicker() {
  const ticker = document.getElementById('advisoryTicker');
  const closeBtn = document.getElementById('closeTickerBtn');

  if (ticker && closeBtn) {
    closeBtn.addEventListener('click', () => {
      ticker.style.display = 'none';
    });
  }
}

// 4. Water Rates Estimator Calculator
// Standard LWUA-approved Tiered Model for Water Districts
const RATE_SCHEDULE = {
  residential: {
    name: 'Residential / Domestic',
    minCharge: 215.00, // 0-10 cu.m
    minVolume: 10,
    tier1: { range: '11 - 20 cu.m', rate: 24.50 },
    tier2: { range: '21 - 30 cu.m', rate: 28.00 },
    tier3: { range: '31 cu.m and above', rate: 32.50 }
  },
  commercial_a: {
    name: 'Commercial A (Hotels, Resorts, Resto)',
    minCharge: 430.00, // 0-10 cu.m
    minVolume: 10,
    tier1: { range: '11 - 20 cu.m', rate: 49.00 },
    tier2: { range: '21 - 30 cu.m', rate: 56.00 },
    tier3: { range: '31 cu.m and above', rate: 65.00 }
  },
  commercial_b: {
    name: 'Commercial B (Sari-sari, Small shops)',
    minCharge: 322.50,
    minVolume: 10,
    tier1: { range: '11 - 20 cu.m', rate: 36.75 },
    tier2: { range: '21 - 30 cu.m', rate: 42.00 },
    tier3: { range: '31 cu.m and above', rate: 48.75 }
  },
  institutional: {
    name: 'Government & Institutional',
    minCharge: 300.00,
    minVolume: 10,
    tier1: { range: '11 - 20 cu.m', rate: 32.00 },
    tier2: { range: '21 - 30 cu.m', rate: 38.50 },
    tier3: { range: '31 cu.m and above', rate: 45.00 }
  }
};

function initRatesCalculator() {
  const categorySelect = document.getElementById('calcCategory');
  const volumeSlider = document.getElementById('calcVolumeSlider');
  const volumeInput = document.getElementById('calcVolumeInput');

  const baseCostEl = document.getElementById('calcBaseCost');
  const tieredCostEl = document.getElementById('calcTieredCost');
  const maintenanceFeeEl = document.getElementById('calcMaintFee');
  const totalAmountEl = document.getElementById('calcTotalAmount');
  const volumeLabelEl = document.getElementById('calcVolumeLabel');

  if (!categorySelect || !volumeSlider || !volumeInput) return;

  function calculateBill() {
    const categoryKey = categorySelect.value;
    const config = RATE_SCHEDULE[categoryKey] || RATE_SCHEDULE.residential;
    const cuMeters = Math.max(0, parseFloat(volumeInput.value) || 0);

    let baseCharge = 0;
    let tieredCharge = 0;
    const maintFee = 15.00; // Flat meter maintenance charge

    if (cuMeters <= 10) {
      baseCharge = config.minCharge;
      tieredCharge = 0;
    } else {
      baseCharge = config.minCharge;
      const excess = cuMeters - 10;

      if (excess <= 10) {
        // 11 to 20
        tieredCharge = excess * config.tier1.rate;
      } else if (excess <= 20) {
        // 11 to 20 + 21 to 30
        tieredCharge = (10 * config.tier1.rate) + ((excess - 10) * config.tier2.rate);
      } else {
        // 11 to 20 + 21 to 30 + 31+
        tieredCharge = (10 * config.tier1.rate) + (10 * config.tier2.rate) + ((excess - 20) * config.tier3.rate);
      }
    }

    const total = baseCharge + tieredCharge + maintFee;

    baseCostEl.textContent = `₱${baseCharge.toFixed(2)}`;
    tieredCostEl.textContent = `₱${tieredCharge.toFixed(2)}`;
    maintenanceFeeEl.textContent = `₱${maintFee.toFixed(2)}`;
    totalAmountEl.textContent = `₱${total.toFixed(2)}`;
    volumeLabelEl.textContent = `${cuMeters} cu.m`;
  }

  volumeSlider.addEventListener('input', (e) => {
    volumeInput.value = e.target.value;
    calculateBill();
  });

  volumeInput.addEventListener('input', (e) => {
    let val = parseFloat(e.target.value) || 0;
    if (val < 0) val = 0;
    if (val > 150) val = 150;
    volumeSlider.value = val;
    calculateBill();
  });

  categorySelect.addEventListener('change', calculateBill);

  // Initial calculation
  calculateBill();
}

// 5. Rates Category Table Switcher
function initRatesCategoryTabs() {
  const tabBtns = document.querySelectorAll('.category-tab-btn');
  const tableBody = document.getElementById('ratesTableBody');
  const catTitle = document.getElementById('rateScheduleTitle');

  if (!tabBtns.length || !tableBody) return;

  const schedules = {
    residential: {
      title: 'Residential & Domestic Rates (Effective 2026)',
      min: '₱215.00',
      t1: '₱24.50',
      t2: '₱28.00',
      t3: '₱32.50'
    },
    commercial: {
      title: 'Commercial / Industrial Rates (Effective 2026)',
      min: '₱430.00',
      t1: '₱49.00',
      t2: '₱56.00',
      t3: '₱65.00'
    },
    institutional: {
      title: 'Government & Institutional Rates (Effective 2026)',
      min: '₱300.00',
      t1: '₱32.00',
      t2: '₱38.50',
      t3: '₱45.00'
    }
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.getAttribute('data-category');
      const data = schedules[cat] || schedules.residential;

      if (catTitle) catTitle.textContent = data.title;

      tableBody.innerHTML = `
        <tr>
          <td><strong>Minimum Charge (0 – 10 cu.m)</strong></td>
          <td>${data.min}</td>
          <td>Standard flat rate for initial 10 cu.m</td>
        </tr>
        <tr>
          <td><strong>11 – 20 cu.m</strong></td>
          <td>${data.t1} / cu.m</td>
          <td>Incremental rate per cubic meter</td>
        </tr>
        <tr>
          <td><strong>21 – 30 cu.m</strong></td>
          <td>${data.t2} / cu.m</td>
          <td>Incremental rate per cubic meter</td>
        </tr>
        <tr>
          <td><strong>31 cu.m and above</strong></td>
          <td>${data.t3} / cu.m</td>
          <td>High consumption tier</td>
        </tr>
      `;
    });
  });
}

// 6. Report a Leak & Service Modal
function initReportModal() {
  const modal = document.getElementById('reportLeakModal');
  const openBtns = document.querySelectorAll('.open-report-modal');
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelModalBtn');
  const reportForm = document.getElementById('reportLeakForm');

  if (!modal) return;

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (reportForm) {
    reportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const refCode = 'TAWD-' + Math.floor(100000 + Math.random() * 900000);
      alert(`Report submitted successfully!\n\nYour Reference Ticket Number is: ${refCode}\n\nOur Rapid Response Team has been notified. Thank you for helping conserve water in Tabuelan!`);
      reportForm.reset();
      closeModal();
    });
  }
}
