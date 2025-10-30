const fs = require('fs');

// Read current config
const config = JSON.parse(fs.readFileSync('pdf.config.json', 'utf8'));

// Add CSS content inline for the PDF
const cssContent = `<style>
/* MVP Polish v1.4 - Sales-Grade PDF */
@page { size: Letter; margin: 0.6in; }
:root {
  --brand: #004ED3;
  --aqua: #2BD8C2;
  --spruce: #00937B;
  --ink: #0B2340;
  --muted: #6A6F7A;
  --line: #E6E8EC;
  --bg: #F7F9FC;
}
body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; font-size: 12px; color: var(--ink); }
.title-block { text-align: center; margin-bottom: 20px; page-break-inside: avoid; }
.title-main { font-size: 20px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
.title-sub { font-size: 11px; color: var(--muted); margin-bottom: 12px; }
.title-rule { border-top: 1px solid var(--line); width: 80%; margin: 0 auto; }
.kpis { display: flex; justify-content: space-around; margin: 20px 0; page-break-inside: avoid; }
.kpi { text-align: center; flex: 1; }
.kpi .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); margin-bottom: 4px; }
.kpi .value { font-size: 24px; font-weight: 700; color: var(--brand); }
.kpi .delta { font-size: 10px; color: var(--spruce); margin-top: 2px; }
.next-steps-band { background-color: var(--bg); border: 1px solid var(--line); padding: 16px; margin: 20px 0; page-break-inside: avoid; }
.next-steps-title { font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 12px; text-align: center; }
.next-steps-grid { display: flex; justify-content: space-between; gap: 20px; }
.next-step { flex: 1; text-align: center; }
.step-number { display: inline-block; width: 24px; height: 24px; line-height: 24px; border-radius: 50%; background: var(--brand); color: white; font-weight: 600; margin-bottom: 4px; }
.step-text { font-size: 11px; color: var(--ink); }
.contact-box { background: white; border: 1px solid var(--line); padding: 12px; margin-top: 16px; text-align: center; }
.contact-title { font-weight: 600; font-size: 12px; margin-bottom: 8px; color: var(--ink); }
.contact-line { font-size: 11px; color: var(--muted); line-height: 1.4; }
.contact-line strong { color: var(--ink); font-weight: 600; }
.assumptions-card { background: var(--bg); border: 1px solid var(--line); padding: 16px; margin: 20px 0; page-break-inside: avoid; }
.assumptions-title { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 10px; }
.assumptions-list { list-style: none; padding: 0; margin: 0; }
.assumptions-list li { font-size: 11px; color: var(--muted); padding-left: 16px; position: relative; margin-bottom: 4px; }
.assumptions-list li:before { content: "•"; position: absolute; left: 0; color: var(--brand); }
.table { width: 100%; border-collapse: collapse; margin: 16px 0; }
.table td { padding: 8px 4px; border-bottom: 1px solid var(--line); font-size: 11px; }
.table td.num { text-align: right; font-variant-numeric: tabular-nums lining-nums; }
.waterfall-table { margin: 20px 0; }
.waterfall-table td { padding: 8px 0; font-size: 12px; }
.waterfall-table .num { text-align: right; font-weight: 600; }
.waterfall-table tr.subtraction td { border-top: 1px solid var(--line); color: var(--muted); }
.waterfall-table tr.total td { border-top: 2px solid var(--ink); font-weight: 700; color: var(--spruce); }
.h2 { font-size: 14px; font-weight: 600; color: var(--ink); margin: 16px 0 8px; }
.comparison-chart { margin: 20px 0; }
.comparison-row { margin-bottom: 8px; display: flex; align-items: center; }
.comparison-label { width: 140px; font-size: 11px; }
.bar-container { flex: 1; height: 24px; background: var(--bg); position: relative; }
.bar-fill { height: 100%; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; }
.bar-value { color: white; font-size: 11px; font-weight: 600; }
.allocation-section { margin: 20px 0; }
.allocation-list { list-style: none; padding: 0; }
.allocation-list li { font-size: 11px; margin-bottom: 8px; }
.allocation-amount { font-weight: 600; color: var(--spruce); }
</style>`;

// Update version
config.version = "2.0.0-mvp-v1.4";

// Page 1 - Centered title and horizontal Next Steps
const page1Template = `${cssContent}
<div class='title-block'>
  <div class='title-main'>Fee Recovery Analysis</div>
  <div class='title-sub'>{{ merchant.name }} • {{ meta.reportDate }} • Report #{{ meta.reportId }}</div>
  <div class='title-rule'></div>
</div>

<div class='kpis'>
  <div class='kpi'>
    <div class='label'>Monthly Savings (Est.)</div>
    <div class='value'>{{ FORMAT.money(metrics.monthlySavings) }}</div>
    <div class='delta'>Annualized: {{ FORMAT.money(metrics.annualSavings) }}</div>
  </div>
  <div class='kpi'>
    <div class='label'>Quarterly Savings</div>
    <div class='value'>{{ FORMAT.money(metrics.quarterlySavings) }}</div>
    <div class='delta'>3 months projection</div>
  </div>
  <div class='kpi'>
    <div class='label'>Cost Reduction</div>
    <div class='value'>{{ FORMAT.percent(metrics.costReductionPct) }}</div>
    <div class='delta'>{{ programLabel }}</div>
  </div>
</div>

<div class='next-steps-band'>
  <div class='next-steps-title'>Next Steps (It's Easy)</div>
  <div class='next-steps-grid'>
    <div class='next-step'>
      <div class='step-number'>1</div>
      <div class='step-text'>Review and confirm calculation inputs</div>
    </div>
    <div class='next-step'>
      <div class='step-number'>2</div>
      <div class='step-text'>Schedule implementation window</div>
    </div>
    <div class='next-step'>
      <div class='step-number'>3</div>
      <div class='step-text'>Begin realizing savings immediately</div>
    </div>
  </div>
  <div class='contact-box'>
    <div class='contact-title'>Ready to Get Started?</div>
    <div class='contact-line'>
      Contact your DMP Representative:<br/>
      {{#contactFormatted.hasName}}<strong>{{ contactFormatted.name }}</strong><br/>{{/contactFormatted.hasName}}
      {{#contactFormatted.hasEmail}}Email: <a href='{{ contactFormatted.emailLink }}'>{{ contactFormatted.email }}</a><br/>{{/contactFormatted.hasEmail}}
      {{#contactFormatted.hasPhone}}Phone: {{ contactFormatted.phone }}{{/contactFormatted.hasPhone}}
    </div>
  </div>
</div>

<div class='comparison-chart'>
  <div class='h2'>Processing Cost vs Savings (Monthly)</div>
  <div class='comparison-row'>
    <div class='comparison-label'>Today (Current Cost)</div>
    <div class='bar-container'>
      <div class='bar-fill' style='width:100%;background:#004ED3'>
        <span class='bar-value'>{{ FORMAT.money(metrics.currentCost) }}</span>
      </div>
    </div>
  </div>
  <div class='comparison-row'>
    <div class='comparison-label'>With Program (Net Cost)</div>
    <div class='bar-container'>
      <div class='bar-fill' style='width:{{ Math.max(0, metrics.newProgramNetCost) > 0 ? (Math.abs(metrics.newProgramNetCost) / metrics.currentCost * 100) : 0 }}%;background:#004ED3;opacity:0.7'>
        <span class='bar-value'>{{ FORMAT.money(metrics.newProgramNetCost) }}</span>
      </div>
    </div>
  </div>
  <div class='comparison-row'>
    <div class='comparison-label'>Monthly Savings</div>
    <div class='bar-container'>
      <div class='bar-fill' style='width:{{ metrics.monthlySavings > 0 ? (metrics.monthlySavings / metrics.currentCost * 100) : 0 }}%;background:#00937B'>
        <span class='bar-value'>{{ FORMAT.money(metrics.monthlySavings) }}</span>
      </div>
    </div>
  </div>
</div>

<table class='waterfall-table'>
  <tr><td>Current Processing Cost</td><td class='num'>{{ FORMAT.money(metrics.currentCost) }}</td></tr>
  <tr class='subtraction'><td>Price Differential Collected (Cards)</td><td class='num'>{{ FORMAT.money(metrics.diffCollected) }}</td></tr>
  <tr class='total'><td>Net Processing Cost (Program)</td><td class='num'>{{ FORMAT.money(metrics.newProgramNetCost) }}</td></tr>
</table>

<div class='allocation-section'>
  <div class='h2'>Savings Allocation Plan</div>
  {{#metrics.isRestaurant}}
  <ul class='allocation-list'>
    <li><span class='allocation-amount'>{{ FORMAT.money(metrics.monthlySavings) }}</span> per month → Offset two server shifts weekly</li>
    <li><span class='allocation-amount'>{{ FORMAT.money(metrics.quarterlySavings) }}</span> per quarter → Smallwares/linen refresh or menu board updates</li>
    <li><span class='allocation-amount'>{{ FORMAT.money(metrics.annualSavings) }}</span> per year → Replace aging kitchen equipment or expand catering</li>
  </ul>
  {{/metrics.isRestaurant}}
  {{#metrics.isRetail}}
  <ul class='allocation-list'>
    <li><span class='allocation-amount'>{{ FORMAT.money(metrics.monthlySavings) }}</span> per month → Fund seasonal promotions and local advertising</li>
    <li><span class='allocation-amount'>{{ FORMAT.money(metrics.quarterlySavings) }}</span> per quarter → Refresh inventory displays or POS upgrades</li>
    <li><span class='allocation-amount'>{{ FORMAT.money(metrics.annualSavings) }}</span> per year → Store renovation or e-commerce expansion</li>
  </ul>
  {{/metrics.isRetail}}
</div>

<div class='assumptions-card'>
  <div class='assumptions-title'>Assumptions</div>
  <ul class='assumptions-list'>
    <li>Tax/tip reversed out before applying price differential, then re-applied.</li>
    <li>Out-of-pocket = Adjusted Volume × Interchange − Differential collected.</li>
    <li>All signage and receipt disclosures included ({{ programLabel }} compliant).</li>
  </ul>
</div>`;

// Update Page 1
config.pdf.pages[0] = {
  name: "Executive",
  layout: { columns: 1 },
  body: [
    {
      type: "custom",
      template: page1Template
    }
  ]
};

// Save updated config
fs.writeFileSync('pdf.config.json', JSON.stringify(config, null, 2));
console.log('PDF config updated to v1.4 successfully');