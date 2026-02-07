(function () {
  // ---- Service Worker ----
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    });
  }

  const $ = (id) => document.getElementById(id);

  const fecha = $("fecha");
  const btnHoy = $("btnHoy");
  const idCliente = $("idCliente");
  const btnContinuar = $("btnContinuar");
  const msg = $("msg");

  // Estado simple
  let tipo = null; // "instalacion" | "reparacion" | "mantenimiento"

  // Fecha por defecto: hoy
  const todayISO = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Máximo: mañana (regla tuya)
  const tomorrowISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  fecha.value = todayISO();
  fecha.min = todayISO();
  fecha.max = tomorrowISO();

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
      // Guardar selección
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

    // Guardar datos de cabecera
    const header = { tipo, fecha: f, idCliente: id };
    localStorage.setItem("pv_header", JSON.stringify(header));

    // Navegación por tipo (por ahora solo instalación está creada)
    if (tipo === "instalacion") {
      window.location.href = "./instalacion.html";
      return;
    }

    // Para no bloquearte: de momento avisamos en pantalla
    msg.textContent = "Este formulario aún no está creado. Ahora mismo solo Instalación.";
  });
})();
