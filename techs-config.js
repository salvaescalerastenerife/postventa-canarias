window.PV_TECH_FLAGS = {
  ENABLE_CARLOS_JAVIER: true
};

window.PV_PENDING_TECHS = [
  {
    enabled: () => Boolean(window.PV_TECH_FLAGS?.ENABLE_CARLOS_JAVIER),
    value: 'CARLOS JAVIER GRAFFIGÑA MOLINA',
    label: 'CARLOS JAVIER GRAFFIGÑA MOLINA'
  }
];

window.PV_ENHANCE_TECH_SELECTS = function () {
  const targets = ['tec1', 'tec2', 'tec', 'fTec'];

  targets.forEach((id) => {
    const select = document.getElementById(id);
    if (!select) return;

    const existingValues = new Set(
      Array.from(select.options).map((opt) => String(opt.value || '').trim())
    );

    window.PV_PENDING_TECHS.forEach((tech) => {
      if (!tech.enabled()) return;
      if (existingValues.has(tech.value)) return;

      const opt = document.createElement('option');
      opt.value = tech.value;
      opt.textContent = tech.label;
      select.appendChild(opt);
    });
  });
};
