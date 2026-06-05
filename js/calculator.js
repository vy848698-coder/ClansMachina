/* ============================================================
   CLANS MACHINA - SOLAR SAVINGS + EMI CALCULATOR
   Standalone logic for calculator.html
   ============================================================ */
(function () {
  'use strict';

  var rupee = '₹';

  function fmt(n) {
    return rupee + Math.round(n).toLocaleString('en-IN');
  }

  /* Cost per kW and subsidy rules differ by consumer category. */
  var CATEGORY = {
    residential: { costPerKw: function (kw) { return kw >= 10 ? 53000 : (kw >= 3 ? 58000 : 60000); }, subsidy: true,  offsetCap: 0.90 },
    commercial:  { costPerKw: function (kw) { return kw >= 50 ? 46000 : (kw >= 10 ? 50000 : 54000); }, subsidy: false, offsetCap: 0.85 },
    industrial:  { costPerKw: function (kw) { return kw >= 100 ? 43000 : (kw >= 30 ? 45000 : 48000); }, subsidy: false, offsetCap: 0.82 }
  };

  /* PM Surya Ghar (residential): 30k/kW first 2kW, 18k next 1kW, cap 78k. */
  function residentialSubsidy(kw) {
    var s = 0;
    s += Math.min(kw, 2) * 30000;
    if (kw > 2) s += Math.min(kw - 2, 1) * 18000;
    return Math.min(Math.round(s), 78000);
  }

  /* ---------- shared state fed from estimator into EMI ---------- */
  var assetCost = 300000;   // financeable system cost (net of subsidy)
  var monthlySaving = 0;    // monthly bill saving, for the cashflow insight
  var hasEstimate = false;

  var $ = function (id) { return document.getElementById(id); };

  /* ============================================================
     STEP 1 - SAVINGS ESTIMATOR
     ============================================================ */
  var estForm = $('estForm');
  if (!estForm) return; // not on the calculator page

  var consumerType = 'residential';
  var seg = $('estSeg');
  if (seg) {
    seg.addEventListener('click', function (e) {
      var btn = e.target.closest('.sc-seg-btn');
      if (!btn) return;
      consumerType = btn.getAttribute('data-type');
      seg.querySelectorAll('.sc-seg-btn').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    });
  }

  var roof = $('estRoof');
  var roofLabel = $('estRoofLabel');
  function paintRange(el) {
    if (!el) return;
    var min = parseFloat(el.min) || 0;
    var max = parseFloat(el.max) || 100;
    var pct = ((parseFloat(el.value) - min) / (max - min)) * 100;
    el.style.setProperty('--fill', pct + '%');
  }
  if (roof) {
    roof.addEventListener('input', function () {
      if (roofLabel) roofLabel.textContent = roof.value + ' sq ft';
      paintRange(roof);
    });
    paintRange(roof);
  }

  estForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var bill = parseFloat($('estBill').value) || 0;
    if (bill <= 0) { $('estBill').focus(); return; }

    var opt = $('estLocation').selectedOptions[0];
    var sun = parseFloat(opt.getAttribute('data-sun')) || 4.4;     // peak sun hours / day
    var tariff = parseFloat(opt.getAttribute('data-tariff')) || 8;  // Rs per unit
    var roofArea = parseFloat(roof.value) || 500;
    var cat = CATEGORY[consumerType];

    // Consumption and sizing
    var monthlyUnits = bill / tariff;
    var dailyUnits = monthlyUnits / 30;
    var sizeFromBill = dailyUnits / sun;          // kW needed to cover usage
    var sizeFromRoof = roofArea / 100;            // ~100 sq ft per kW
    var systemSize = Math.max(1, Math.min(sizeFromRoof, sizeFromBill));
    systemSize = parseFloat(systemSize.toFixed(1));

    // Generation, panels, CO2
    var monthlyGen = Math.round(systemSize * sun * 30);
    var panels = Math.ceil(systemSize / 0.55);    // 550 Wp panels
    var co2 = parseFloat((monthlyGen * 12 * 0.82 / 1000).toFixed(1)); // tonnes/yr

    // Savings (capped offset of consumption)
    var offsetUnits = Math.min(monthlyUnits * cat.offsetCap, monthlyGen);
    monthlySaving = Math.round(offsetUnits * tariff);
    var newBill = Math.max(bill - monthlySaving, Math.round(bill * 0.08));
    var reduction = Math.round((bill - newBill) / bill * 100);
    var annualSaving = monthlySaving * 12;

    // 25-year savings with 3% annual tariff escalation
    var savings25 = 0, yearSave = annualSaving;
    for (var y = 0; y < 25; y++) { savings25 += yearSave; yearSave *= 1.03; }
    savings25 = Math.round(savings25);

    // Cost and subsidy
    var grossCost = Math.round(systemSize * cat.costPerKw(systemSize));
    var subsidy = cat.subsidy ? residentialSubsidy(systemSize) : 0;
    var netCost = Math.max(grossCost - subsidy, 0);
    var payback = annualSaving > 0 ? parseFloat((netCost / annualSaving).toFixed(1)) : 0;

    // Paint report
    $('rSavings25').textContent = fmt(savings25);
    $('rSavingsAnnual').textContent = fmt(annualSaving);
    $('rSystem').textContent = systemSize + ' kW';
    $('rGen').textContent = monthlyGen.toLocaleString('en-IN');
    $('rPanels').textContent = panels;
    $('rPayback').textContent = payback + ' yrs';
    $('rCo2').textContent = co2 + ' T';
    $('rSubsidy').textContent = subsidy > 0 ? fmt(subsidy) : 'N/A';
    $('rSubsidy2').textContent = '− ' + (subsidy > 0 ? fmt(subsidy) : rupee + '0');
    $('rGross').textContent = fmt(grossCost);
    $('rNet').textContent = fmt(netCost);
    $('rBillNow').textContent = fmt(bill);
    $('rBillSolar').textContent = fmt(newBill);
    $('rReduction').textContent = reduction + '%';
    $('barNow').style.width = '100%';
    $('barSolar').style.width = Math.max(8, Math.round(newBill / bill * 100)) + '%';

    $('scPlaceholder').hidden = true;
    var report = $('scReport');
    report.hidden = false;

    // Feed EMI calculator
    hasEstimate = true;
    assetCost = netCost;
    configureEmiFromAsset(netCost);

    report.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  /* ============================================================
     STEP 2 - EMI CALCULATOR
     ============================================================ */
  var loanEl = $('emiLoan');
  var dpEl = $('emiDp');
  var tenureEl = $('emiTenure');
  var interestEl = $('emiInterest');
  var syncing = false;

  /* Re-base the sliders when a fresh estimate comes in. */
  function configureEmiFromAsset(cost) {
    cost = Math.max(50000, Math.round(cost / 5000) * 5000);
    loanEl.max = cost;
    var dp = parseFloat(dpEl.value) || 20;
    loanEl.value = Math.round(cost * (1 - dp / 100) / 5000) * 5000;
    $('emiAsset').textContent = fmt(cost);
    updateEmi();
  }

  function currentCost() {
    return parseFloat(loanEl.max) || assetCost;
  }

  function emiFor(P, years, annualRatePct) {
    var months = Math.round(12 * years);
    var r = months >= 12 ? annualRatePct / 100 / 12 : 0;
    var emi = r > 0
      ? Math.floor(P * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1))
      : (months > 0 ? Math.floor(P / months) : 0);
    var total = emi * months;
    return { emi: emi, months: months, total: total, interest: Math.max(total - P, 0) };
  }

  function updateEmi() {
    var cost = currentCost();
    var loan = parseFloat(loanEl.value) || 0;
    var dp = cost - loan;
    var dpPct = cost > 0 ? Math.round(dp / cost * 100) : 0;
    var tenure = parseFloat(tenureEl.value) || 5;
    var rate = parseFloat(interestEl.value) || 9.5;

    var res = emiFor(loan, tenure, rate);

    $('emiLoanVal').textContent = fmt(loan);
    $('emiDpVal').innerHTML = dpPct + '% &middot; ' + fmt(dp);
    $('emiTenureVal').textContent = tenure + (tenure === 1 ? ' year' : ' years');
    $('emiInterestVal').textContent = rate + '% p.a.';
    $('emiMonthly').textContent = fmt(res.emi);
    $('emiMonths').textContent = res.months;
    $('emiPrincipal').textContent = fmt(loan);
    $('emiInterest2').textContent = fmt(res.interest);
    $('emiTotalInterest').textContent = fmt(res.interest);
    $('emiTotal').textContent = fmt(res.total);

    var denom = loan + res.interest;
    var pPct = denom > 0 ? (loan / denom * 100) : 100;
    $('splitPrincipal').style.width = pPct + '%';
    $('splitInterest').style.width = (100 - pPct) + '%';

    [loanEl, dpEl, tenureEl, interestEl].forEach(paintRange);

    // Net cashflow insight (only meaningful after an estimate)
    var cashflow = $('emiCashflow');
    if (hasEstimate && monthlySaving > 0) {
      var net = res.emi - monthlySaving;
      cashflow.hidden = false;
      if (net <= 0) {
        $('emiNet').textContent = '+' + fmt(Math.abs(net)) + ' / month';
        $('emiNet').className = 'sc-cashflow-value positive';
        $('emiNetNote').textContent = 'Your monthly savings (' + fmt(monthlySaving) + ') exceed the EMI — you are cash-positive from day one.';
      } else {
        $('emiNet').textContent = fmt(net) + ' / month';
        $('emiNet').className = 'sc-cashflow-value';
        $('emiNetNote').textContent = 'EMI ' + fmt(res.emi) + ' minus solar savings ' + fmt(monthlySaving) + '. Outgo drops to zero once the loan is repaid.';
      }
    } else {
      cashflow.hidden = true;
    }
  }

  // Two-way sync: loan <-> down payment
  loanEl.addEventListener('input', function () {
    if (syncing) return;
    syncing = true;
    var cost = currentCost();
    var dpPct = cost > 0 ? Math.round((cost - parseFloat(loanEl.value)) / cost * 100) : 0;
    dpEl.value = Math.min(90, Math.max(0, dpPct));
    syncing = false;
    updateEmi();
  });
  dpEl.addEventListener('input', function () {
    if (syncing) return;
    syncing = true;
    var cost = currentCost();
    loanEl.value = Math.round(cost * (1 - parseFloat(dpEl.value) / 100) / 5000) * 5000;
    syncing = false;
    updateEmi();
  });
  tenureEl.addEventListener('input', updateEmi);
  interestEl.addEventListener('input', updateEmi);

  // Initial paint with default asset cost
  configureEmiFromAsset(assetCost);
})();
