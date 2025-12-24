let currentLang = "fa";

async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

async function loadSite() {
  const site = await loadJSON("data/site.json");
  document.getElementById("site-name").innerText =
    site.name[currentLang] || site.name.fa;
}

async function loadHero() {
  const hero = await loadJSON("data/hero.json");
  document.getElementById("hero").innerHTML = `
    <img src="images/${hero.image}" alt="${hero.alt}">
  `;
}

async function loadGallery() {
  const gallery = await loadJSON("data/gallery.json");
  const container = document.getElementById("gallery");
  container.innerHTML = "";

  gallery.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "card reveal";

    const inner = `
      <img src="images/${item.image}">
      <div class="text">
        <h3>${item.title?.[currentLang] || item.title?.fa || ""}</h3>
        <p>${item.text?.[currentLang] || item.text?.fa || ""}</p>
      </div>
    `;

    card.innerHTML = item.link
      ? `<a href="${item.link}" target="_blank">${inner}</a>`
      : inner;

    container.appendChild(card);
  });

  initReveal();
}

async function loadFooter() {
  const footer = await loadJSON("data/footer.json");
  document.getElementById("footer-text").innerText = footer.text;
}

function initLangSwitch() {
  document.querySelectorAll("#lang-switch button").forEach(btn => {
    btn.onclick = () => {
      currentLang = btn.dataset.lang;
      document.documentElement.lang = currentLang;
      document.documentElement.dir = currentLang === "fa" ? "rtl" : "ltr";
      start();
    };
  });
}

function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".reveal").forEach(el => {
    el.style.opacity = 0;
    el.style.transform = "translateY(30px)";
    el.style.transition = "0.6s ease";
    observer.observe(el);
  });
}

async function start() {
  await loadSite();
  await loadHero();
  await loadGallery();
  await loadFooter();
}

initLangSwitch();
start();
