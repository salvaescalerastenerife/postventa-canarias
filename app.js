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

  // ---- Badge versión SW (vN => N/100) ----
  (function initSwVersionBadge() {
    const el = $("sw-version"); // debe existir en index.html
    if (!el) return;
    if (!("serviceWorker" in navigator)) return;

    function requestVersion() {
      try {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: "GET_VERSION" });
        }
      } catch (_) {}
    }

    navigator.serviceWorker.addEventListener("message", (event) => {
      const d = event.data || {};
      if (d.type === "SW_VERSION") {
        const v = Number(d.version || 0);
        const shown = (v / 100).toFixed(2);
        el.textContent = `Versión ${shown}`;
        el.title = d.cache ? `Cache: ${d.cache}` : "";
      }
    });

    // Pide versión al cargar (si ya controla)
    requestVersion();

    // En iOS a veces el controller llega después
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      setTimeout(requestVersion, 150);
    });

    navigator.serviceWorker.ready.then(() => {
      setTimeout(requestVersion, 150);
    });
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
