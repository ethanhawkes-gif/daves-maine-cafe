(() => {
  "use strict";

  // Never count internal proof/staging clicks as customer conversions.
  if (window.location.pathname.startsWith("/staging/")) return;

  const sendEvent = (eventName, parameters = {}) => {
    if (typeof window.gtag !== "function") return;

    window.gtag("event", eventName, {
      page_location: window.location.href,
      transport_type: "beacon",
      ...parameters,
    });
  };

  const normalizedText = (link) =>
    (link.textContent || "").replace(/\s+/g, " ").trim().slice(0, 100);

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.href;
    const linkText = normalizedText(link);
    const common = {
      link_url: href,
      link_text: linkText,
    };

    if (/\/\/(?:www\.|order\.)?toasttab\.com\//i.test(href)) {
      sendEvent("order_online_click", common);
      return;
    }

    if (/^tel:/i.test(link.getAttribute("href") || "")) {
      sendEvent("phone_call_click", common);
      return;
    }

    if (/google\.com\/maps\/dir\//i.test(href)) {
      sendEvent("directions_click", common);
    }
  });

  const formType = new URLSearchParams(window.location.search).get("form");
  if (
    window.location.pathname.replace(/\/+$/, "") === "/thanks" &&
    (formType === "catering" || formType === "list")
  ) {
    const dedupeKey = `dmc-conversion:${window.location.pathname}:${formType}`;
    if (!window.sessionStorage.getItem(dedupeKey)) {
      sendEvent("generate_lead", {
        lead_type: formType === "catering" ? "catering" : "email_list",
      });
      window.sessionStorage.setItem(dedupeKey, "sent");
    }
  }
})();
