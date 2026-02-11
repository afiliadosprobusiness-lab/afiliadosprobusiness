import { NextRequest, NextResponse } from "next/server";
import { sitesStorage } from "@/lib/sitesStorage";
import { injectMetricsTracking } from "@/lib/metricsTracking";

/**
 * API Route to handle site publishing.
 * It performs validation, optimization, and prepares the final files.
 */
export async function POST(req: NextRequest) {
  try {
    const { siteId, html } = await req.json();

    if (!siteId || !html) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (siteId, html)" },
        { status: 400 }
      );
    }

    // 1. Validation Logic
    const validationIssues = [];
    
    // SEO & Accessibility Checks
    if (!html.includes("<title>")) {
      validationIssues.push("El sitio no tiene un título definido (<title>).");
    }
    
    if (!html.includes('name="description"')) {
      validationIssues.push("Falta la meta-etiqueta 'description' para SEO.");
    }
    
    const imgCount = (html.match(/<img/g) || []).length;
    const altCount = (html.match(/alt=/g) || []).length;
    if (imgCount > altCount) {
      validationIssues.push(`${imgCount - altCount} imágenes no tienen etiqueta 'alt' para accesibilidad.`);
    }

    // Link Integrity Checks
    const emptyLinks = (html.match(/href=["'](#|javascript:void\(0\)|)["']/g) || []).length;
    if (emptyLinks > 0) {
      validationIssues.push(`${emptyLinks} enlaces están vacíos o apuntan a '#'.`);
    }

    // 2. Optimization Logic
    let optimizedHtml = html;
    
    // A. Clean Editor Artifacts
    optimizedHtml = optimizedHtml.replace(/<style id="editor-styles">[\s\S]*?<\/style>/gi, "");
    optimizedHtml = optimizedHtml.replace(/class="[^"]*selected-element[^"]*"/gi, (m: string) => m.replace("selected-element", "").replace(/\s+/g, " ").trim());
    optimizedHtml = optimizedHtml.replace(/contenteditable="(true|false)"/gi, "");
    optimizedHtml = optimizedHtml.replace(/data-fp-[a-z-]+="[^"]*"/gi, ""); // Remove custom internal attributes

    // B. Security & Performance Enhancements
    // Add rel="noopener noreferrer" to external links
    optimizedHtml = optimizedHtml.replace(/<a\s+(?:[^>]*?\s+)?href="https?:\/\/(?!yourdomain\.com)[^"]+"(?![^>]*?rel=)/gi, (match: string) => {
      return match + ' rel="noopener noreferrer" target="_blank"';
    });

    // Add lazy loading and async decoding to images if missing
    optimizedHtml = optimizedHtml.replace(/<img(?![^>]*?loading=)(?![^>]*?decoding=)/gi, (match: string) => {
      return match + ' loading="lazy" decoding="async"';
    });

    // C. Meta Tag Injection (Ensures standard quality)
    if (!optimizedHtml.includes("<meta charset")) {
      optimizedHtml = optimizedHtml.replace("<head>", '<head>\n    <meta charset="UTF-8">');
    }
    if (!optimizedHtml.includes('name="viewport"')) {
      optimizedHtml = optimizedHtml.replace("<head>", '<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">');
    }

    // D. Advanced Minification (Safe but effective)
    optimizedHtml = optimizedHtml
      .replace(/<!--[\s\S]*?-->/g, "") // Remove comments
      .replace(/\s\s+/g, " ")          // Collapse multiple spaces
      .replace(/>\s+</g, "><")         // Remove spaces between tags
      .trim();

    // 3. Inject tracking script for real analytics
    optimizedHtml = injectMetricsTracking(optimizedHtml, siteId);

    // 4. Final Bundle Generation (Simulation)
    // In a production environment, this could trigger a build process or upload to CDN
    const finalBundle = {
      "index.html": optimizedHtml,
      "manifest.json": JSON.stringify({
        short_name: "FastPage Site",
        name: "Published via FastPage 2.0",
        start_url: "/",
        display: "standalone",
        theme_color: "#06b6d4",
        background_color: "#09090b"
      }, null, 2),
      publishedAt: new Date().toISOString()
    };

    // 5. Update site status to 'published'
    const siteData = await sitesStorage.get(siteId);
    if (siteData) {
      await sitesStorage.set(siteId, {
        ...siteData,
        html: optimizedHtml,
        status: "published",
        publishedAt: Date.now(),
        bundle: finalBundle // Store the "final" state
      });
    }

    return NextResponse.json({
      success: true,
      message: "Sitio optimizado y publicado con estándares PRO",
      validationIssues,
      optimizedHtml,
      publishedUrl: `/preview/${siteId}`,
      stats: {
        originalSize: html.length,
        optimizedSize: optimizedHtml.length,
        reduction: `${Math.round((1 - optimizedHtml.length / html.length) * 100)}%`
      }
    });

  } catch (error: any) {
    console.error("[Publish API] Error:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la publicación: " + error.message },
      { status: 500 }
    );
  }
}
