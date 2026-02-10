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
  if (!/<base\s/i.test(sanitized)) {
    // Insert base tag right after <head> or at the beginning
    if (/<head(.*?)>/i.test(sanitized)) {
      sanitized = sanitized.replace(/<head(.*?)>/i, (m) => `${m}\n${baseTag}`);
    } else {
      sanitized = baseTag + sanitized;
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

