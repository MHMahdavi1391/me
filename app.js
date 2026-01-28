// تنظیمات اولیه
let currentLang = "fa";
let isInitialLoad = true;

// تابع کمکی برای بارگذاری JSON
async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`خطا در بارگذاری ${path}`);
    return res.json();
  } catch (error) {
    console.error('خطا در بارگذاری داده:', error);
    return null;
  }
}

// بارگذاری نام سایت
async function loadSite() {
  const site = await loadJSON("data/site.json");
  if (site) {
    const siteName = site.name[currentLang] || site.name.fa;
    document.getElementById("site-name").innerText = siteName;
    
    // به‌روزرسانی title صفحه
    document.title = `${siteName} | بنیان‌گذار DNI CO`;
  }
}

// بارگذاری بخش Hero
async function loadHero() {
  const hero = await loadJSON("data/hero.json");
  if (hero) {
    const heroSection = document.getElementById("hero");
    heroSection.innerHTML = `
      <div class="hero-image-container">
        <img src="images/${hero.image}" alt="${hero.alt}" loading="lazy">
        <div class="hero-overlay"></div>
      </div>
      <div id="hero-note" class="hero-note"></div>
    `;
    
    // اضافه کردن کلاس fade-in برای انیمیشن
    setTimeout(() => {
      heroSection.classList.add('fade-in');
    }, 100);
    
    loadHeroNote();
  }
}

// بارگذاری متن Hero
async function loadHeroNote() {
  const note = await loadJSON("data/note.json");
  if (note && note.notes && note.notes.length > 0) {
    const text = note.notes[0][currentLang] || note.notes[0].fa;
    const heroNote = document.getElementById("hero-note");
    
    if (heroNote) {
      heroNote.innerText = text;
      
      // انیمیشن تایپ برای اولین بار
      if (isInitialLoad) {
        typeWriterEffect(heroNote, text);
      }
    }
  }
}

// افکت تایپ برای متن Hero
function typeWriterEffect(element, text) {
  element.innerText = '';
  let i = 0;
  
  function type() {
    if (i < text.length) {
      element.innerText += text.charAt(i);
      i++;
      setTimeout(type, 30);
    }
  }
  
  setTimeout(type, 500);
}

// بارگذاری گالری
async function loadGallery() {
  const gallery = await loadJSON("data/gallery.json");
  const container = document.getElementById("gallery");
  
  if (!gallery || !container) return;
  
  container.innerHTML = "";
  
  gallery.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    
    // تأخیر برای انیمیشن‌های متوالی
    card.style.animationDelay = `${index * 0.1}s`;
    
    const title = item.title?.[currentLang] || item.title?.fa || "";
    const text = item.text?.[currentLang] || item.text?.fa || "";
    
    const innerHTML = `
      <img src="images/${item.image}" alt="${title}" loading="lazy">
      <div class="text">
        <h3>${title}</h3>
        <p>${text}</p>
        ${item.link ? '<div class="card-link"><i class="fas fa-external-link-alt"></i> مشاهده پروژه</div>' : ''}
      </div>
    `;
    
    if (item.link) {
      card.innerHTML = `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${innerHTML}</a>`;
    } else {
      card.innerHTML = innerHTML;
    }
    
    container.appendChild(card);
  });
  
  initReveal();
}

// بارگذاری فوتر
async function loadFooter() {
  const footer = await loadJSON("data/footer.json");
  if (footer && footer.text) {
    document.getElementById("footer-text").innerText = footer.text;
  }
}

// تنظیم تغییر زبان
function initLangSwitch() {
  const btn = document.getElementById("lang-switch");
  const btnText = btn.querySelector("span");
  
  // تنظیم متن اولیه
  btnText.innerText = currentLang === "fa" ? "EN" : "FA";
  
  // رویداد کلیک
  btn.onclick = async () => {
    // انیمیشن دکمه
    btn.style.transform = "scale(0.9)";
    setTimeout(() => {
      btn.style.transform = "";
    }, 150);
    
    // تغییر زبان
    currentLang = currentLang === "fa" ? "en" : "fa";
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "fa" ? "rtl" : "ltr";
    
    // به‌روزرسانی متن دکمه
    btnText.innerText = currentLang === "fa" ? "EN" : "FA";
    
    // بارگذاری مجدد محتوا
    await start();
    
    // ذخیره تنظیم زبان در localStorage
    localStorage.setItem("preferredLang", currentLang);
  };
  
  // بارگذاری تنظیمات ذخیره شده
  const savedLang = localStorage.getItem("preferredLang");
  if (savedLang && (savedLang === "fa" || savedLang === "en")) {
    currentLang = savedLang;
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "fa" ? "rtl" : "ltr";
    btnText.innerText = currentLang === "fa" ? "EN" : "FA";
  }
}

// انیمیشن نمایش کارت‌ها
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal");
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });
  
  document.querySelectorAll(".card").forEach((el) => {
    observer.observe(el);
  });
}

// بارگذاری اولیه تمام محتوا
async function start() {
  try {
    // نمایش وضعیت لودینگ (اختیاری)
    document.body.classList.add("loading");
    
    // بارگذاری موازی برای عملکرد بهتر
    await Promise.all([
      loadSite(),
      loadHero(),
      loadGallery(),
      loadFooter()
    ]);
    
    isInitialLoad = false;
    
    // حذف حالت لودینگ
    document.body.classList.remove("loading");
    
  } catch (error) {
    console.error("خطا در بارگذاری صفحه:", error);
    document.body.classList.remove("loading");
  }
}

// مقداردهی اولیه و شروع
function initialize() {
  initLangSwitch();
  start();
  
  // لودینگ اولیه تمام شده
  setTimeout(() => {
    isInitialLoad = false;
  }, 2000);
}

// شروع برنامه زمانی که DOM لود شد
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
