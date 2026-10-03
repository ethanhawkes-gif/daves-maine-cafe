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
      cta_placement: link.dataset.cta || "unlabelled",
      page_variant: window.location.pathname === "/" || window.location.pathname === "/index.html" ? "owner_story_v15" : "existing_subpage",
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

  // Exploration is not a purchase or proof that somebody read a section.
  // Fixed identifiers only: never send entered text, query strings or personal data.
  const isHomepage = ["/", "/index.html"].includes(location.pathname);
  if (isHomepage) {
    const seen = new Set();
    const once = (key, name, params) => {
      if (seen.has(key)) return;
      seen.add(key);
      sendEvent(name, {page_variant: "owner_story_v15", ...params});
    };
    const sections = new Set(["lobster", "food", "dave", "week", "answers", "takehome", "visit"]);
    document.addEventListener("click", event => {
      const a = event.target.closest("a[href]");
      if (!a) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin) return;
      const section = u.hash.slice(1);
      if (sections.has(section)) {
        sendEvent("section_navigation", {section_id: section, page_variant: "owner_story_v15"});
      } else if (["/lobster-rolls/", "/catering/", "/route-one-bottling/", "/visit-kittery/"].includes(u.pathname)) {
        sendEvent("discovery_click", {destination_path: u.pathname, page_variant: "owner_story_v15"});
      }
    });
    // At least 25% of the viewport occupied for 2 foreground seconds; once/page.
    const timers = new Map();
    const visible = new Set();
    const cancel = id => { clearTimeout(timers.get(id)); timers.delete(id); };
    const arm = id => {
      if (document.hidden || seen.has("section:" + id) || timers.has(id)) return;
      timers.set(id, setTimeout(() => {
        timers.delete(id);
        if (!document.hidden && visible.has(id)) once("section:" + id, "section_exposure", {section_id: id});
      }, 2000));
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const id = entry.target.id;
        const enough = entry.isIntersecting && entry.intersectionRect.height >= Math.min(innerHeight * 0.25, entry.boundingClientRect.height * 0.5);
        if (enough) { visible.add(id); arm(id); }
        else { visible.delete(id); cancel(id); }
      }
    }, {threshold: Array.from({length: 101}, (_, i) => i / 100)});
    sections.forEach(id => { const el = document.getElementById(id); if(el) observer.observe(el); });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) [...timers.keys()].forEach(cancel);
      else visible.forEach(arm);
    });
    document.querySelectorAll("video").forEach((video, i) => {
      const videoId = "product_video_" + (i + 1);
      let intent = false;
      const mark = event => { if (event.isTrusted) intent = true; };
      video.addEventListener("pointerdown", mark);
      video.addEventListener("keydown", mark);
      video.addEventListener("play", () => {
        if (intent) once(videoId + ":start", "video_intent_start", {video_id: videoId});
      });
      video.addEventListener("timeupdate", () => {
        if (!intent || document.hidden || video.paused || !Number.isFinite(video.duration) || video.duration <= 0) return;
        for (const pct of [25, 50, 75]) if (video.currentTime / video.duration >= pct / 100)
          once(videoId + ":" + pct, "video_position_reached", {video_id: videoId, video_percent: pct});
      });
      video.addEventListener("ended", () => {
        if (intent && !document.hidden) once(videoId + ":end", "video_intent_end", {video_id: videoId});
      });
    });
  }

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
