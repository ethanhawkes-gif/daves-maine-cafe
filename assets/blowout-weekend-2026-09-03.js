(function () {
  var TZ = 'America/New_York';
  var HIDE_AFTER = '2026-09-06'; // banner disappears once Sunday Sept 6 ends

  function todayYMD() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());
    var value = {};
    parts.forEach(function (part) { value[part.type] = part.value; });
    return [value.year, value.month, value.day].join('-');
  }

  function expired() {
    return todayYMD() > HIDE_AFTER;
  }

  if (expired()) return;

  var style = document.createElement('style');
  style.textContent = '.dmc-lateopen{background:#b83a2b;color:#fff;text-align:center;padding:14px 18px;border-bottom:4px solid #d79a37;font:700 15px/1.4 system-ui,sans-serif;letter-spacing:.2px}.dmc-lateopen strong{display:block;font-size:20px;text-transform:uppercase;letter-spacing:.6px}';
  document.head.appendChild(style);

  var notice = document.createElement('div');
  notice.className = 'dmc-lateopen';
  notice.setAttribute('role', 'status');
  notice.innerHTML = '<strong>Closed today &mdash; back Friday</strong>Blow Out Weekend: Fri &bull; Sat &bull; Sun &mdash; $19 Lobster Rolls. See you then.';
  document.body.insertBefore(notice, document.body.firstChild);

  var timer = setInterval(function () {
    if (!expired()) return;
    clearInterval(timer);
    if (notice.parentNode) notice.parentNode.removeChild(notice);
  }, 30000);
}());
