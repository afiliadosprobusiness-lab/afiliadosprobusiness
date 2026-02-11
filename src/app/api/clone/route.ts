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
  let sanitized = html;

  // 1. Remove existing <base> tags to avoid conflicts
  sanitized = sanitized.replace(/<base\s+[^>]*?>/gi, '<!-- original base removed -->');

  // 2. Remove frame-busting scripts
  sanitized = sanitized.replace(/(if\s*\(window\.top\s*!==\s*window\.self\)|if\s*\(top\s*!==\s*self\)|if\s*\(window\.self\s*!==\s*window\.top\)).*?\{.*?window\.top\.location.*?=.*?window\.self\.location.*?\}|top\.location\.href\s*=\s*location\.href/gi, '/* frame-buster removed */');
  
  // 3. Remove Content Security Policy and X-Frame-Options
  sanitized = sanitized.replace(/<meta\s+http-equiv=["'](content-security-policy|x-frame-options|refresh)["'].*?>/gi, '<!-- security-meta removed -->');

  // 4. Remove integrity and crossorigin attributes
  sanitized = sanitized.replace(/\s+integrity=["'].*?["']/gi, '');
  sanitized = sanitized.replace(/\s+crossorigin=["'].*?["']/gi, '');

  // 4.1 Remove executable scripts from cloned source to keep edits stable.
  // (Inline and external scripts from the original site tend to overwrite edited DOM.)
  sanitized = sanitized.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (scriptTag) => {
    if (/type=["']application\/ld\+json["']/i.test(scriptTag)) {
      return scriptTag;
    }
    return "<!-- source script removed -->";
  });

  // 4.2 Remove inline JS handlers that can trigger runtime mutations.
  sanitized = sanitized.replace(/\son[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "");

  // 5. Pre-fix relative URLs in HTML attributes (except srcset, handled separately)
  const urlAttributes = ['src', 'href', 'action', 'data-src', 'data-href', 'poster'];
  urlAttributes.forEach(attr => {
    // Excluir URLs que ya son absolutas, fragmentos, esquemas data:, o javascript:
    const regex = new RegExp(`(\\s${attr}=["'])(?!https?://|//|data:|#|javascript:|blob:)([^"']+)`, 'gi');
    sanitized = sanitized.replace(regex, (match, prefix, path) => {
      try {
        // Ignorar si el path parece una variable de template (ej: {{...}} o %...%)
        if (path.startsWith('{{') || path.startsWith('%')) return match;
        
        const absoluteUrl = new URL(path, baseUrl).href;
        return `${prefix}${absoluteUrl}`;
      } catch (e) {
        return match;
      }
    });
  });

  // 5.1 Fix srcset preserving descriptors (e.g. "640w", "2x")
  sanitized = sanitized.replace(/(\ssrcset=["'])([^"']+)(["'])/gi, (match, prefix, value, suffix) => {
    try {
      const fixedSrcset = value
        .split(",")
        .map((candidate: string) => {
          const parts = candidate.trim().split(/\s+/);
          if (!parts[0]) return "";

          const source = parts[0];
          if (
            source.startsWith("http://") ||
            source.startsWith("https://") ||
            source.startsWith("//") ||
            source.startsWith("data:") ||
            source.startsWith("blob:")
          ) {
            return parts.join(" ");
          }

          parts[0] = new URL(source, baseUrl).href;
          return parts.join(" ");
        })
        .filter(Boolean)
        .join(", ");

      return `${prefix}${fixedSrcset}${suffix}`;
    } catch {
      return match;
    }
  });

  // 6. Fix relative URLs in inline styles (background-image: url(...))
  sanitized = sanitized.replace(/url\(['"]?(?!(https?:\/\/|\/\/|data:))([^'"]+)['"]?\)/gi, (match, p1, p2) => {
    try {
      const path = p2 || p1;
      if (path.startsWith('#') || path.startsWith('data:')) return match;
      return `url("${new URL(path, baseUrl).href}")`;
    } catch (e) { return match; }
  });

  // 7. Ensure base tag and viewport meta exist
  const baseTag = `<base href="${baseUrl}">`;
  const viewportMeta = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;
  
  // 8. Advanced Resource Fixer Script (as fallback and for dynamic content)
  const fixResourcesScript = `
    <script id="editor-resource-fixer">
      (function() {
        const baseUrl = "${baseUrl}";
        const fixUrl = (url) => {
          if (!url || url.startsWith('http') || url.startsWith('//') || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('#') || url.startsWith('javascript:')) return url;
          try {
            return new URL(url, baseUrl).href;
          } catch(e) { return url; }
        };

        const fixAllElements = () => {
          document.querySelectorAll('img, video, audio, source, link, script, a, iframe, use, form, [data-src], [data-href]').forEach(el => {
            // Fix images and media
            if (el.src) {
              const originalSrc = el.getAttribute('src');
              if (originalSrc && !originalSrc.startsWith('http') && !originalSrc.startsWith('//') && !originalSrc.startsWith('data:')) {
                el.src = fixUrl(originalSrc);
              }
            }
            // Fix links
            if (el.href) {
              const originalHref = el.getAttribute('href');
              if (originalHref && !originalHref.startsWith('http') && !originalHref.startsWith('//') && !originalHref.startsWith('#') && !originalHref.startsWith('javascript:')) {
                el.href = fixUrl(originalHref);
              }
            }
            // Fix source sets
            if (el.srcset) {
              const originalSrcset = el.getAttribute('srcset');
              if (originalSrcset) {
                el.srcset = originalSrcset.split(',').map(s => {
                  const parts = s.trim().split(/\s+/);
                  if (parts.length > 0 && parts[0] && !parts[0].startsWith('http') && !parts[0].startsWith('//')) {
                    parts[0] = fixUrl(parts[0]);
                  }
                  return parts.join(' ');
                }).join(', ');
              }
            }
            // Fix form actions
            if (el.action) {
               const originalAction = el.getAttribute('action');
               if (originalAction && !originalAction.startsWith('http')) {
                 el.action = fixUrl(originalAction);
               }
            }
            // Fix data attributes
            ['data-src', 'data-href'].forEach(attr => {
              if (el.hasAttribute(attr)) {
                const val = el.getAttribute(attr);
                if (val && !val.startsWith('http')) {
                  el.setAttribute(attr, fixUrl(val));
                }
              }
            });
          });
          
          // Fix background images in styles
          document.querySelectorAll('[style*="url("]').forEach(el => {
            const style = el.getAttribute('style');
            if (style.includes('url(')) {
              const newStyle = style.replace(/url\(['"]?([^'"]+)['"]?\)/gi, (match, url) => {
                if (url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) return match;
                return 'url("' + fixUrl(url) + '")';
              });
              el.setAttribute('style', newStyle);
            }
          });
        };

        // Run immediately and then on load
        fixAllElements();
        window.addEventListener('load', fixAllElements);
        
        // Observe changes
        const observer = new MutationObserver((mutations) => {
          let shouldFix = false;
          mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) shouldFix = true;
          });
          if (shouldFix) fixAllElements();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
      })();
    </script>
  `;

  // Inject into <head>
  if (/<head(.*?)>/i.test(sanitized)) {
    sanitized = sanitized.replace(/<head(.*?)>/i, (m) => `${m}\n${baseTag}\n${viewportMeta}\n${fixResourcesScript}`);
  } else if (/<html(.*?)>/i.test(sanitized)) {
    sanitized = sanitized.replace(/<html(.*?)>/i, (m) => `${m}\n<head>\n${baseTag}\n${viewportMeta}\n${fixResourcesScript}\n</head>`);
  } else {
    sanitized = baseTag + viewportMeta + fixResourcesScript + sanitized;
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const res = await fetch(target, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
      },
      redirect: "follow",
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorMessage = `Error al obtener la URL (${res.status})`;
      if (res.status === 403) errorMessage = "Acceso denegado: El sitio bloquea solicitudes automatizadas (403 Forbidden).";
      if (res.status === 404) errorMessage = "Sitio no encontrado: La URL ingresada no existe (404 Not Found).";
      if (res.status >= 500) errorMessage = "El servidor del sitio destino está experimentando problemas (5xx Error).";
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return new Response(
        JSON.stringify({ error: "La URL no devolvió una página HTML válida" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const html = await res.text();
    
    // 6. Optimization: Remove non-essential large content to stay within Firestore limits
    let optimizedHtml = html;
    const initialSize = Buffer.byteLength(optimizedHtml, 'utf8');
    
    if (initialSize > 800000) { // If over 800KB
      // Remove comments
      optimizedHtml = optimizedHtml.replace(/<!--[\s\S]*?-->/g, '');
      
      // If still too big, remove large SVG symbols if they are many
      if (Buffer.byteLength(optimizedHtml, 'utf8') > 900000) {
        optimizedHtml = optimizedHtml.replace(/<svg[\s\S]*?<\/svg>/gi, (m) => {
          return m.length > 5000 ? '<!-- large svg removed -->' : m;
        });
      }

      // Final safety check for Firestore (max 1MB per doc)
      if (Buffer.byteLength(optimizedHtml, 'utf8') > 950000) {
        // Remove all scripts if still over limit - better to have a static page than a crash
        optimizedHtml = optimizedHtml.replace(/<script[\s\S]*?<\/script>/gi, '<!-- script removed for size -->');
      }
    }

    // Use the final URL after redirects for base tag
    const finalUrl = res.url || target;
    const sanitizedHtml = sanitizeHtml(optimizedHtml, finalUrl);

    return new Response(sanitizedHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Cloned-From": finalUrl,
      },
    });
  } catch (error: any) {
    console.error("Clone error:", error);
    const message = error.name === 'AbortError' ? "La solicitud tardó demasiado" : "Error de conexión al intentar clonar el sitio";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
