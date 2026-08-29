(function () {
  var parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  var value = {};
  parts.forEach(function (part) { value[part.type] = part.value; });
  if ([value.year, value.month, value.day].join('-') !== '2026-08-29') return;

  var style = document.createElement('style');
  style.textContent = '.dmc-closure{background:#b83a2b;color:#fff;text-align:center;padding:14px 18px;border-bottom:4px solid #d79a37;font:800 16px/1.35 system-ui,sans-serif;letter-spacing:.2px}.dmc-closure strong{display:block;font-size:20px;text-transform:uppercase}.dmc-order-disabled{opacity:.62;cursor:not-allowed!important;pointer-events:none!important}';
  document.head.appendChild(style);

  var notice = document.createElement('div');
  notice.className = 'dmc-closure';
  notice.setAttribute('role', 'status');
  notice.innerHTML = '<strong>Closed today — Saturday, August 29</strong>Family event. Normal Sunday hours return tomorrow at 11:30 AM.';
  document.body.insertBefore(notice, document.body.firstChild);

  document.querySelectorAll('a[href*="toasttab.com"],a[href*="order.toasttab.com"]').forEach(function (link) {
    link.removeAttribute('href');
    link.removeAttribute('target');
    link.setAttribute('aria-disabled', 'true');
    link.classList.add('dmc-order-disabled');
    if (/order/i.test(link.textContent || '')) link.textContent = 'Closed Today — Back Sunday';
  });
}());
