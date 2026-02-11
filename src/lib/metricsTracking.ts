export function injectMetricsTracking(html: string, siteId: string): string {
  if (!html || !siteId) return html;

  if (html.includes("data-fastpage-metrics-script")) {
    return html;
  }

  const safeSiteId = JSON.stringify(siteId);
  const script = `
<script data-fastpage-metrics-script>
(function () {
  try {
    if (window.__fpMetricsAttached) return;
    window.__fpMetricsAttached = true;

    var siteId = ${safeSiteId};
    var endpoint = "/api/metrics/event";
    var startedAt = Date.now();
    var ended = false;

    function send(type, extra) {
      try {
        var payload = JSON.stringify(Object.assign({
          siteId: siteId,
          type: type,
          ts: Date.now()
        }, extra || {}));

        if (navigator.sendBeacon && (type === "session_end" || type === "page_view")) {
          var blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon(endpoint, blob);
          return;
        }

        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true
        }).catch(function () {});
      } catch (e) {}
    }

    function normalizeLabel(value) {
      if (!value) return "";
      return String(value).trim().replace(/\\s+/g, " ").slice(0, 120);
    }

    send("page_view");

    document.addEventListener("click", function (event) {
      var target = event && event.target && event.target.closest
        ? event.target.closest("a,button,[role='button'],input[type='submit'],[data-track]")
        : null;
      if (!target) return;

      var label = normalizeLabel(
        target.getAttribute("data-track") ||
        target.getAttribute("aria-label") ||
        target.innerText ||
        target.textContent
      );

      send("click", { label: label });

      var low = label.toLowerCase();
      if (/(comprar|buy|reservar|book|agendar|contact|whatsapp|suscrib|subscribe|checkout|demo|cotizar|quote|enviar|send)/.test(low)) {
        send("conversion", { label: label });
      }
    }, true);

    document.addEventListener("submit", function (event) {
      var form = event && event.target;
      var label = normalizeLabel(
        form && (form.getAttribute("id") || form.getAttribute("name") || "form_submit")
      );
      send("conversion", { label: label || "form_submit" });
    }, true);

    function flushSession() {
      if (ended) return;
      ended = true;
      var durationMs = Math.max(0, Date.now() - startedAt);
      send("session_end", { durationMs: durationMs });
    }

    window.addEventListener("beforeunload", flushSession);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        flushSession();
      }
    });
  } catch (e) {}
})();
</script>
`;

  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${script}\n</body>`);
  }

  return `${html}\n${script}`;
}
