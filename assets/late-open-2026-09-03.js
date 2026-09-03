(function () {
  var TZ = 'America/New_York';
  var DATE = '2026-09-03';
  var HIDE_AT_HOUR = 15; // banner disappears at 3:00 PM ET

  function nowParts() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(new Date());
    var value = {};
    parts.forEach(function (part) { value[part.type] = part.value; });
    return value;
  }

  function expired() {
    var v = nowParts();
    if ([v.year, v.month, v.day].join('-') !== DATE) return true;
    return Number(v.hour) >= HIDE_AT_HOUR;
  }

  if (expired()) return;

  var style = document.createElement('style');
  style.textContent = '.dmc-lateopen{background:#b83a2b;color:#fff;text-align:center;padding:14px 18px;border-bottom:4px solid #d79a37;font:700 15px/1.4 system-ui,sans-serif;letter-spacing:.2px}.dmc-lateopen strong{display:block;font-size:20px;text-transform:uppercase;letter-spacing:.6px}';
  document.head.appendChild(style);

  var notice = document.createElement('div');
  notice.className = 'dmc-lateopen';
  notice.setAttribute('role', 'status');
  notice.innerHTML = '<strong>Sorry — opening at 2:00 PM today</strong>Late start on Thursday, September 3. Regular hours are back Friday at 11:30 AM.';
  document.body.insertBefore(notice, document.body.firstChild);

  // Pull the banner the moment 3:00 PM ET arrives, even on a page left open.
  var timer = setInterval(function () {
    if (!expired()) return;
    clearInterval(timer);
    if (notice.parentNode) notice.parentNode.removeChild(notice);
  }, 30000);
}());
