import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  try {
    // 1. Obtener el ID del usuario desde los headers o la sesión (simulado por ahora)
    // En una implementación real, esto vendría de NextAuth o un token JWT
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 2. Recuperar todos los sitios (clonados, creados, plantillas) asociados al usuario
    // Por ahora, consultamos la colección 'cloned_sites' y 'projects' (si existe)
    const sitesSnapshot = await adminDb.collection("cloned_sites")
      .where("userId", "==", userId)
      .get();
    
    // Si tienes otra colección para proyectos del constructor:
    // const projectsSnapshot = await adminDb.collection("projects").where("userId", "==", userId).get();

    const sites = sitesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 3. Generar métricas dinámicas (Simuladas basadas en los sitios reales)
    // En un sistema real, estas métricas vendrían de una colección 'analytics'
    const dynamicMetrics = sites.map((site: any) => {
      const seed = site.id.charCodeAt(0); // Para generar datos consistentes pero dinámicos
      return {
        id: site.id,
        name: site.name || site.url || "Sin nombre",
        type: site.type || "Clonador",
        visits: Math.floor(Math.random() * 5000) + seed * 10,
        conversion: (Math.random() * 5 + 1).toFixed(1) + "%",
        bounceRate: (Math.random() * 40 + 20).toFixed(1) + "%",
        loadTime: (Math.random() * 2 + 0.5).toFixed(2) + "s",
        status: site.published ? "Live" : "Draft",
        trend: (Math.random() * 20 - 5).toFixed(1) + "%",
        dailyData: Array.from({ length: 7 }, (_, i) => ({
          day: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i],
          visits: Math.floor(Math.random() * 500) + 100,
          conv: Math.floor(Math.random() * 20) + 5
        }))
      };
    });

    // 4. Calcular totales globales
    const totalVisits = dynamicMetrics.reduce((acc, curr) => acc + curr.visits, 0);
    const avgConversion = (dynamicMetrics.reduce((acc, curr) => acc + parseFloat(curr.conversion), 0) / (dynamicMetrics.length || 1)).toFixed(1) + "%";
    
    return NextResponse.json({
      timestamp: Date.now(),
      summary: {
        totalSites: sites.length,
        totalVisits: totalVisits.toLocaleString(),
        avgConversion,
        avgLoadTime: "1.4s",
        totalClicks: (totalVisits * 0.35).toLocaleString()
      },
      details: dynamicMetrics,
      chartData: Array.from({ length: 7 }, (_, i) => ({
        name: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i],
        visitas: Math.floor(Math.random() * 2000) + 500,
        conversiones: Math.floor(Math.random() * 100) + 20
      }))
    });

  } catch (error: any) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json({ error: "Failed to fetch metrics", details: error.message }, { status: 500 });
  }
}
