(function () {
  const $ = (id) => document.getElementById(id);

  const fecha = $("fecha");
  const btnHoy = $("btnHoy");
  const idCliente = $("idCliente");
  const btnContinuar = $("btnContinuar");
  const msg = $("msg");

  let tipo = null; // "instalacion" | "reparacion" | "mantenimiento"

  const todayISO = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const tomorrowISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // ---- Badge versión cacheada (robusto en iOS): lee caches + (opcional) pregunta al SW ----
  (function initSwVersionBadge() {
    const el = $("sw-version"); // debe existir en index.html
    if (!el) return;

    const show = (vNum, cacheName) => {
      const shown = (Number(vNum || 0) / 100).toFixed(2);
      el.textContent = `Versión ${shown}`;
      el.title = cacheName ? `Cache: ${cacheName}` : "";
    };

    const showUnknown = () => {
      el.textContent = "Versión —";
      el.title = "No se detectó cache";
    };

    // 1) Fallback fuerte: leer directamente los caches existentes en el navegador
    async function readFromCaches() {
      if (!("caches" in window)) return false;
      try {
        const keys = await caches.keys();
        // Busca caches tipo "postventa-canarias-v5"
        let bestV = -1;
        let bestName = null;

        for (const k of keys) {
          const m = String(k).match(/postventa-canarias-v(\d+)\b/i);
          if (!m) continue;
          const v = parseInt(m[1], 10);
          if (Number.isFinite(v) && v > bestV) {
            bestV = v;
            bestName = k;
          }
        }

        if (bestV >= 0) {
          show(bestV, bestName);
          return true;
        }
      } catch (_) {}
      return false;
    }

    // 2) Extra (si hay controller): pedir versión al SW (no siempre funciona en iOS, pero suma)
    function requestFromSW() {
      if (!("serviceWorker" in navigator)) return;
      try {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: "GET_VERSION" });
        }
      } catch (_) {}
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        const d = event.data || {};
        if (d.type === "SW_VERSION") {
          show(d.version, d.cache);
        }
      });
    }

    // Pintado inicial: caches -> si no, deja "—"
    readFromCaches().then((ok) => {
      if (!ok) showUnknown();
      requestFromSW();
    });

    // Reintentos (por si el SW se instala/activa después)
    setTimeout(() => { readFromCaches(); requestFromSW(); }, 400);
    setTimeout(() => { readFromCaches(); requestFromSW(); }, 1200);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        setTimeout(() => { readFromCaches(); requestFromSW(); }, 150);
      });
      navigator.serviceWorker.ready.then(() => {
        setTimeout(() => { readFromCaches(); requestFromSW(); }, 150);
      });
    }
  })();
  fecha.value = todayISO();

  // Permitir fechas anteriores para digitalizar partes antiguos.
  // Bloqueamos fechas futuras (más allá de hoy) para evitar errores.
  fecha.min = "2000-01-01";
  fecha.max = todayISO();

  btnHoy.addEventListener("click", () => {
    fecha.value = todayISO();
    msg.textContent = "";
  });

  // Chips
  document.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      tipo = btn.dataset.tipo;

      document.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");

      msg.textContent = "";
      localStorage.setItem("pv_tipo", tipo);
    });
  });

  // Cargar selección previa
  const savedTipo = localStorage.getItem("pv_tipo");
  if (savedTipo) {
    const b = document.querySelector(`.chip[data-tipo="${savedTipo}"]`);
    if (b) {
      tipo = savedTipo;
      b.setAttribute("aria-pressed", "true");
    }
  }

  const routes = {
    instalacion: "./instalacion.html",
    reparacion: "./reparacion.html",
    mantenimiento: "./mantenimiento.html",
  };

  btnContinuar.addEventListener("click", () => {
    msg.textContent = "";

    const id = (idCliente.value || "").trim();

    if (!tipo) {
      msg.textContent = "Selecciona el tipo de intervención.";
      return;
    }
    if (!/^\d+$/.test(id)) {
      msg.textContent = "El ID Cliente debe ser solo números.";
      return;
    }
    const f = fecha.value;
    if (!f) {
      msg.textContent = "Selecciona una fecha.";
      return;
    }

    const header = { tipo, fecha: f, idCliente: id };
    localStorage.setItem("pv_header", JSON.stringify(header));

    const url = routes[tipo];
    if (url) {
      window.location.href = url;
      return;
    }

    msg.textContent = "Este formulario aún no está creado.";
  });
})();
