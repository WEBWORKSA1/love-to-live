/* Donation widget */
(function () {
  const { $, $$, CFG } = window.LTL;
  const D = CFG.donate || {};
  let freq = "monthly", amt = 25;
  const go = $("#donate-go"), impact = $("#impact"), customWrap = $("#custom-wrap"), custom = $("#custom-amt");
  const IMPACT = [[5, "covers hosting for a city guide for a month"], [10, "funds a fact-check of one city's data"], [25, "pays a local creator for a neighbourhood photo set"], [50, "funds a new guide from a local writer"], [100, "adds a prize to the Love Where You Live Awards"], [250, "funds a full new city report card"], [500, "sponsors a 'Moving to…' video episode"]];
  function update() {
    const a = amt === "custom" ? parseFloat(custom.value) || 0 : amt;
    const line = IMPACT.slice().reverse().find(([v]) => a >= v);
    impact.innerHTML = a ? "💛 <b>$" + a + (freq === "monthly" ? "/month" : "") + "</b> " + (line ? line[1] : "keeps LoveToLive free for everyone") + "." : "";
    go.textContent = a ? "Donate $" + a + (freq === "monthly" ? " / month" : " once") : "Enter an amount";
  }
  $$("[data-freq]").forEach((b) => b.addEventListener("click", () => { freq = b.dataset.freq; $$("[data-freq]").forEach((x) => x.classList.toggle("active", x === b)); update(); }));
  $$("[data-amt]").forEach((b) => b.addEventListener("click", () => {
    amt = b.dataset.amt === "custom" ? "custom" : +b.dataset.amt;
    $$("[data-amt]").forEach((x) => x.classList.toggle("active", x === b));
    customWrap.hidden = amt !== "custom"; if (amt === "custom") custom.focus(); update();
  }));
  custom.addEventListener("input", update);
  function checkout(a, f) {
    const link = f === "monthly" ? D.stripeMonthly || D.patreon || D.githubSponsors || D.kofi : D.stripeOneTime || D.paypal || D.kofi || D.buyMeACoffee;
    if (window.gtag) gtag("event", "donate_click", { value: a, currency: "USD", frequency: f });
    if (link) {
      // Stripe Payment Links accept ?prefilled_email= ; amount is chosen on Stripe when "customer chooses price" is enabled.
      window.open(link, "_blank", "noopener");
    } else { $("#donate-fallback").hidden = false; $("#donate-fallback").scrollIntoView({ behavior: "smooth", block: "center" }); }
  }
  go.addEventListener("click", () => { const a = amt === "custom" ? parseFloat(custom.value) || 0 : amt; if (!a) { custom.focus(); return; } checkout(a, freq); });
  $$("[data-tier]").forEach((t) => t.addEventListener("click", (e) => { e.preventDefault(); checkout(+t.dataset.tier, "monthly"); }));
  // goal meter
  const goal = +D.goal || 25000, raised = +D.raised || 0, pct = Math.min(100, (raised / goal) * 100);
  setTimeout(() => ($("#goal-bar").style.width = Math.max(2, pct) + "%"), 300);
  $("#goal-text").textContent = "$" + raised.toLocaleString() + " raised of $" + goal.toLocaleString() + " goal — funds new cities, creators and prizes.";
  update();
})();
