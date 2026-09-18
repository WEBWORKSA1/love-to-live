/* Multi-step lead generation form (get-quotes.html) */
(function () {
  const { $, $$, submitForm, CFG } = window.LTL;
  const form = $("#lead"); if (!form) return;
  const steps = $$(".step", form), bar = $("#ld-bar"), label = $("#ld-step"), back = $("#ld-back"), next = $("#ld-next"), err = $("#ld-err");
  let i = 0;

  // Prefill from URL (?need=&from=&to=)
  const p = new URLSearchParams(location.search);
  if (p.get("need")) { const r = form.querySelector('input[name=need][value="' + p.get("need") + '"]'); if (r) r.checked = true; }
  if (p.get("from")) $("#ld-from").value = p.get("from");
  if (p.get("to")) $("#ld-to").value = p.get("to");
  if (p.get("need") && (p.get("from") || p.get("to"))) i = 1; // skip straight to step 2

  function need() { const r = form.querySelector("input[name=need]:checked"); return r ? r.value : "movers"; }
  function tailor() {
    const n = need();
    $$("[data-for]", form).forEach((f) => {
      const show = f.dataset.for.split(" ").includes(n) || (n === "consult" && false);
      f.hidden = !show; $$("select,input", f).forEach((el) => (el.disabled = !show));
    });
  }
  function go(n) {
    i = Math.max(0, Math.min(steps.length - 1, n));
    steps.forEach((s, k) => s.classList.toggle("active", k === i));
    bar.style.width = ((i + 1) / steps.length) * 100 + "%";
    label.textContent = "Step " + (i + 1) + " of " + steps.length;
    back.disabled = i === 0;
    next.textContent = i === steps.length - 1 ? "Get my free quotes ✓" : "Continue →";
    err.classList.remove("show");
    if (i === 2) tailor();
    if (window.gtag) gtag("event", "lead_step", { step: i + 1, need: need() });
  }
  function valid() {
    const fields = $$("input,select,textarea", steps[i]).filter((f) => !f.disabled && f.willValidate);
    for (const f of fields) if (!f.checkValidity()) { f.reportValidity(); err.classList.add("show"); return false; }
    return true;
  }
  $$("input[name=need]", form).forEach((r) => r.addEventListener("change", () => setTimeout(() => go(1), 180)));
  back.addEventListener("click", () => go(i - 1));
  next.addEventListener("click", async () => {
    if (!valid()) return;
    if (i < steps.length - 1) { go(i + 1); return; }
    next.disabled = true; next.textContent = "Matching you…";
    try {
      await submitForm(form);
      if (window.gtag) gtag("event", "generate_lead", { form_type: "quotes", need: need() });
      form.hidden = true;
      const ok = $("#ld-success"); ok.classList.add("show"); ok.focus();
      const map = { movers: "movers", international: "movers", agent: "realEstate", rentals: "realEstate", mortgage: "mortgage", insurance: "insurance" };
      const url = CFG.partners && CFG.partners[map[need()]];
      if (url) $("#ld-offers").innerHTML = '<div class="card" style="border:2px solid var(--love)"><span class="sponsored-tag">Partner offer</span><h3 style="margin-top:6px">Want an instant price now?</h3><p class="small muted">See live prices from our featured partner while you wait.</p><a class="btn btn-primary" href="' + url + '" target="_blank" rel="sponsored noopener">See instant prices →</a></div>';
      scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      err.textContent = "Sorry — something went wrong. Please try again or email " + (CFG.contactEmail || "us") + ".";
      err.classList.add("show");
    } finally { next.disabled = false; if (!form.hidden) next.textContent = "Get my free quotes ✓"; }
  });
  form.addEventListener("submit", (e) => e.preventDefault());
  form.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") { e.preventDefault(); next.click(); } });
  go(i);
})();
