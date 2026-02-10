import type { NextRequest } from "next/server";

function isValidHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function sanitizeHtml(html: string, baseUrl: string): string {
  // We no longer remove scripts to allow modern JS-heavy sites to render in the preview.
  // The safety is handled by the iframe sandbox on the frontend.
  let sanitized = html;

  // Ensure base tag exists for resolving relative URLs (CSS, images, scripts)
  const baseTag = `<base href="${baseUrl}">`;
  
  // Inject a script to handle relative links and media that might bypass <base>
  const fixResourcesScript = `
    <script>
      (function() {
        const baseUrl = "${baseUrl}";
        // Function to fix relative URLs
        const fixUrl = (url) => {
          if (!url || url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) return url;
          try {
            return new URL(url, baseUrl).href;
          } catch(e) { return url; }
        };

        // Fix existing elements
        document.querySelectorAll('img, video, audio, source, link, script').forEach(el => {
          if (el.src) el.src = fixUrl(el.getAttribute('src'));
          if (el.href) el.href = fixUrl(el.getAttribute('href'));
          if (el.srcset) {
            el.srcset = el.getAttribute('srcset').split(',').map(s => {
              const [u, d] = s.trim().split(' ');
              return fixUrl(u) + (d ? ' ' + d : '');
            }).join(', ');
          }
        });

        // Intercept future dynamically added elements
        const observer = new MutationObserver((mutations) => {
          mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1) { // Element
                if (node.src) node.src = fixUrl(node.getAttribute('src'));
                if (node.href) node.href = fixUrl(node.getAttribute('href'));
                node.querySelectorAll && node.querySelectorAll('img, video, audio, source, link, script').forEach(el => {
                  if (el.src) el.src = fixUrl(el.getAttribute('src'));
                  if (el.href) el.href = fixUrl(el.getAttribute('href'));
                });
              }
            });
          });
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
      })();
    </script>
  `;

  if (!/<base\s/i.test(sanitized)) {
    // Insert base tag and our fix script right after <head> or at the beginning
    if (/<head(.*?)>/i.test(sanitized)) {
      sanitized = sanitized.replace(/<head(.*?)>/i, (m) => `${m}\n${baseTag}\n${fixResourcesScript}`);
    } else {
      sanitized = baseTag + fixResourcesScript + sanitized;
    }
  }
  return sanitized;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url")?.trim();

  if (!target || !isValidHttpUrl(target)) {
    return new Response(JSON.stringify({ error: "URL inválida" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch(target, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Error al obtener la URL: ${res.status}` }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    let html = await res.text();

    // 1. Remove Content Security Policy to allow preview
    html = html.replace(/<meta http-equiv="Content-Security-Policy".*?>/gi, "");
    
    // 2. Remove problematic scripts that block iframe nesting (Frame busting)
    html = html.replace(/if\s*\(top\s*!==\s*self\).*?top\.location\s*=\s*self\.location/gi, "if(false)");
    html = html.replace(/window\.top\s*!==\s*window\.self/gi, "false");

    // Limit payload size to 2MB
    const MAX = 2 * 1024 * 1024;
    if (html.length > MAX) {
      html = html.slice(0, MAX);
    }

    const sanitized = sanitizeHtml(html, target);

    return new Response(sanitized, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Fallo de red" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

