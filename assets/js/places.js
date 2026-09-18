/* Rankings page: search, filter, sort, grid/table views (progressive enhancement of pre-rendered cards) */
(function () {
  const { $, $$, cities } = window.LTL;
  const grid = $("#pf-grid"), table = $("#pf-table"), count = $("#pf-count");
  const qIn = $("#pf-q"), region = $("#pf-region"), sort = $("#pf-sort");
  const cards = new Map($$("article", grid).map((a) => [a.querySelector("h3 a").getAttribute("href").split("/").pop().replace(".html", ""), a]));
  const params = new URLSearchParams(location.search);
  let tag = params.get("tag") || "", view = "grid", data = [];
  if (params.get("q")) qIn.value = params.get("q");
  if (params.get("region")) region.value = params.get("region");
  if (params.get("sort")) sort.value = params.get("sort");
  $$("#pf-tags .chip").forEach((c) => c.classList.toggle("active", c.dataset.tag === tag));

  const LOWER_FIRST = { monthly: true };
  function apply() {
    const q = qIn.value.trim().toLowerCase(), r = region.value, s = sort.value;
    let list = data.filter((c) => (!q || (c.name + " " + c.country + " " + c.tags.join(" ")).toLowerCase().includes(q)) && (!r || c.region === r) && (!tag || c.tags.includes(tag) || (tag === "safe" && c.safety >= 85) || (tag === "english" && c.english >= 90) || (tag === "outdoors" && c.nature >= 88) || (tag === "career" && c.jobs >= 86) || (tag === "culture" && c.culture >= 90) || (tag === "affordable" && c.afford >= 65)));
    list.sort((a, b) => LOWER_FIRST[s] ? a[s] - b[s] : b[s] - a[s]);
    count.textContent = list.length + (list.length === 1 ? " city" : " cities") + (tag ? " · " + tag : "") + (r ? " · " + r : "");
    // grid
    cards.forEach((el) => (el.hidden = true));
    list.forEach((c) => { const el = cards.get(c.slug); if (el) { el.hidden = false; el.classList.add("in"); grid.appendChild(el); } });
    // table
    table.innerHTML = "<table><thead><tr>" + [["rank", "#"], ["name", "City"], ["score", "LiveScore"], ["monthly", "Monthly $"], ["rent", "Rent 1BR"], ["safety", "Safety"], ["health", "Health"], ["afford", "Afford."], ["jobs", "Jobs"], ["internet", "Internet"], ["temp", "°C"]]
      .map(([k, l]) => '<th><button data-k="' + k + '">' + l + "</button></th>").join("") + "</tr></thead><tbody>" +
      list.map((c) => "<tr><td>" + c.rank + '</td><td><a href="places/' + c.slug + '.html">' + c.flag + " " + c.name + '</a> <span class="small muted">' + c.country + '</span></td><td><span class="score-pill">' + c.score + "</span></td><td>$" + c.monthly.toLocaleString() + "</td><td>$" + c.rent.toLocaleString() + "</td><td>" + c.safety + "</td><td>" + c.health + "</td><td>" + c.afford + "</td><td>" + c.jobs + "</td><td>" + c.mbps + " Mbps</td><td>" + c.temp + "</td></tr>").join("") + "</tbody></table>";
    $$("th button", table).forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.k; if ([...sort.options].some((o) => o.value === k)) { sort.value = k; apply(); }
    }));
    const u = new URL(location.href);
    ["q", "tag", "region", "sort"].forEach((k) => u.searchParams.delete(k));
    if (q) u.searchParams.set("q", q); if (tag) u.searchParams.set("tag", tag); if (r) u.searchParams.set("region", r); if (s !== "score") u.searchParams.set("sort", s);
    history.replaceState(null, "", u);
  }
  cities().then((d) => { data = d; apply(); });
  [qIn, region, sort].forEach((el) => el.addEventListener("input", apply));
  $$("#pf-tags .chip").forEach((c) => c.addEventListener("click", () => { tag = c.dataset.tag; $$("#pf-tags .chip").forEach((x) => x.classList.toggle("active", x === c)); apply(); }));
  $$("[data-view]").forEach((b) => b.addEventListener("click", () => {
    view = b.dataset.view; $$("[data-view]").forEach((x) => x.classList.toggle("active", x === b));
    grid.hidden = view !== "grid"; table.hidden = view !== "table";
  }));
})();
