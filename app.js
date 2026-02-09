const state = {
  user: null,
  users: [],
  builderBlocks: [],
  cloneHtml: ""
};
function init() {
  const u = localStorage.getItem("fp_users");
  state.users = u ? JSON.parse(u) : [];
  const s = localStorage.getItem("fp_session");
  state.user = s ? JSON.parse(s) : null;
  const elUserBadge = document.querySelector("[data-user-badge]");
  if (elUserBadge) {
    if (state.user) {
      elUserBadge.textContent = state.user.email;
      elUserBadge.classList.remove("hidden");
    } else {
      elUserBadge.classList.add("hidden");
    }
  }
  const authLoginForm = document.getElementById("auth-login-form");
  const authRegisterForm = document.getElementById("auth-register-form");
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  if (tabLogin && tabRegister) {
    tabLogin.addEventListener("click", () => toggleAuthTab("login"));
    tabRegister.addEventListener("click", () => toggleAuthTab("register"));
  }
  if (authLoginForm) {
    authLoginForm.addEventListener("submit", handleLogin);
  }
  if (authRegisterForm) {
    authRegisterForm.addEventListener("submit", handleRegister);
  }
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("fp_session");
      location.href = "auth.html";
    });
  }
  const addBlockButtons = document.querySelectorAll("[data-add-block]");
  addBlockButtons.forEach(b => b.addEventListener("click", () => {
    const type = b.getAttribute("data-add-block");
    addBlock(type);
  }));
  const clearBlocksBtn = document.getElementById("clear-blocks");
  if (clearBlocksBtn) {
    clearBlocksBtn.addEventListener("click", () => {
      state.builderBlocks = [];
      renderPreview();
    });
  }
  const exportHtmlBtn = document.getElementById("export-html");
  if (exportHtmlBtn) {
    exportHtmlBtn.addEventListener("click", exportHtml);
  }
  const cloneForm = document.getElementById("clone-form");
  if (cloneForm) {
    cloneForm.addEventListener("submit", handleClone);
  }
}
function toggleAuthTab(tab) {
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const loginCard = document.getElementById("login-card");
  const registerCard = document.getElementById("register-card");
  if (!tabLogin || !tabRegister || !loginCard || !registerCard) return;
  if (tab === "login") {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    loginCard.classList.remove("hidden");
    registerCard.classList.add("hidden");
  } else {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    registerCard.classList.remove("hidden");
    loginCard.classList.add("hidden");
  }
}
function handleRegister(e) {
  e.preventDefault();
  const email = e.target.email.value.trim().toLowerCase();
  const password = e.target.password.value;
  const name = e.target.name.value.trim();
  if (!email || !password || !name) {
    showToast("Completa todos los campos");
    return;
  }
  if (state.users.find(u => u.email === email)) {
    showToast("Ya existe una cuenta con ese email");
    return;
  }
  const user = { email, password, name, createdAt: Date.now() };
  state.users.push(user);
  localStorage.setItem("fp_users", JSON.stringify(state.users));
  localStorage.setItem("fp_session", JSON.stringify({ email, name }));
  location.href = "hub.html";
}
function handleLogin(e) {
  e.preventDefault();
  const email = e.target.email.value.trim().toLowerCase();
  const password = e.target.password.value;
  const user = state.users.find(u => u.email === email && u.password === password);
  if (!user) {
    showToast("Credenciales inválidas");
    return;
  }
  localStorage.setItem("fp_session", JSON.stringify({ email: user.email, name: user.name }));
  location.href = "hub.html";
}
function showToast(message) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.style.position = "fixed";
    t.style.bottom = "16px";
    t.style.left = "50%";
    t.style.transform = "translateX(-50%)";
    t.style.padding = "12px 16px";
    t.style.borderRadius = "12px";
    t.style.border = "1px solid var(--border)";
    t.style.background = "rgba(18,24,36,0.8)";
    t.style.color = "var(--text)";
    t.style.zIndex = "999";
    document.body.appendChild(t);
  }
  t.textContent = message;
  t.style.opacity = "1";
  setTimeout(() => {
    t.style.opacity = "0";
  }, 1800);
}
function addBlock(type) {
  state.builderBlocks.push(type);
  renderPreview();
}
function renderPreview() {
  const preview = document.getElementById("builder-preview");
  if (!preview) return;
  const parts = state.builderBlocks.map((t, i) => renderBlock(t, i));
  preview.innerHTML = parts.join("\n");
}
function renderBlock(type, index) {
  if (type === "hero") {
    return `<section class="section card"><div class="container"><h1 style="font-size:40px;font-weight:900;letter-spacing:-.02em">Título impactante</h1><p style="color:var(--muted)">Mensaje claro para captar atención con valor directo.</p><div style="display:flex;gap:8px;margin-top:12px"><a class="btn btn-primary" href="#">Empieza ahora</a><a class="btn btn-ghost" href="#">Saber más</a></div></div></section>`;
  }
  if (type === "features") {
    return `<section class="section"><div class="container grid grid-3"><div class="card"><div class="feature"><div class="feature-icon">A</div><div><strong>Rápido</strong><div style="color:var(--muted)">Carga inmediata y alto rendimiento.</div></div></div></div><div class="card"><div class="feature"><div class="feature-icon">B</div><div><strong>Flexible</strong><div style="color:var(--muted)">Bloques reutilizables y edición simple.</div></div></div></div><div class="card"><div class="feature"><div class="feature-icon">C</div><div><strong>Seguro</strong><div style="color:var(--muted)">Buenas prácticas para producción.</div></div></div></div></div></section>`;
  }
  if (type === "cta") {
    return `<section class="section"><div class="container card" style="text-align:center"><h2 style="font-size:28px">Listo para lanzar</h2><p style="color:var(--muted)">Publica tu landing en minutos.</p><a class="btn btn-primary" href="#">Crear cuenta</a></div></section>`;
  }
  if (type === "pricing") {
    return `<section class="section"><div class="container grid grid-3"><div class="card"><strong>Starter</strong><div style="color:var(--muted)">Gratis</div><a class="btn" href="#">Elegir</a></div><div class="card"><strong>Pro</strong><div style="color:var(--muted)">$9/mes</div><a class="btn btn-primary" href="#">Elegir</a></div><div class="card"><strong>Business</strong><div style="color:var(--muted)">$29/mes</div><a class="btn" href="#">Elegir</a></div></div></section>`;
  }
  return `<section class="section"><div class="container card">Bloque ${index + 1}</div></section>`;
}
function exportHtml() {
  const baseStyles = document.querySelector("link[href='styles.css']") ? `<link rel="stylesheet" href="styles.css">` : "";
  const content = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${baseStyles}<title>Landing exportada</title></head><body>${document.getElementById("builder-preview").innerHTML}</body></html>`;
  const blob = new Blob([content], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "landing.html";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
async function handleClone(e) {
  e.preventDefault();
  const url = e.target.url.value.trim();
  const preview = document.getElementById("clone-preview");
  const downloadBtn = document.getElementById("clone-download");
  if (!url) {
    showToast("Ingresa una URL");
    return;
  }
  try {
    const safe = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    const readerUrl = `https://r.jina.ai/${safe}`;
    const res = await fetch(readerUrl, { method: "GET" });
    if (!res.ok) {
      showToast("No se pudo clonar la página");
      return;
    }
    const html = await res.text();
    state.cloneHtml = html;
    preview.textContent = "";
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.minHeight = "380px";
    iframe.style.border = "1px solid var(--border)";
    preview.appendChild(iframe);
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
    if (downloadBtn) {
      downloadBtn.disabled = false;
      downloadBtn.addEventListener("click", () => {
        const blob = new Blob([state.cloneHtml], { type: "text/html" });
        const urlBlob = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = urlBlob;
        a.download = "clon.html";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(urlBlob);
      });
    }
  } catch (_) {
    showToast("Error al clonar");
  }
}
document.addEventListener("DOMContentLoaded", init);
