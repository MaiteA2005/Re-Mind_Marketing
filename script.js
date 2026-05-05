// Anchor tijdelijk bewaren, zodat de browser niet al scrolt tijdens de loader
const initialHash = window.location.hash;

if (initialHash && initialHash !== "#") {
  history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search
  );
}

// Loader: alleen tonen vanaf tablet/desktop
const showLoader = window.innerWidth >= 834;
const MIN_LOADER_TIME = 300;
const MAX_LOADER_TIME = 1200;
const loaderStart = performance.now();

if (showLoader) {
  document.body.classList.add("loading");
} else {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) loadingScreen.remove();
  document.body.classList.remove("loading");
}

function scrollToHashTarget() {
  if (!initialHash || initialHash === "#") return;

  const target = document.querySelector(initialHash);
  if (!target) return;

  target.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search + initialHash
  );
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");

  const elapsed = performance.now() - loaderStart;
  const remaining = Math.max(0, MIN_LOADER_TIME - elapsed);

  setTimeout(() => {
    document.body.classList.remove("loading");

    if (!loadingScreen) {
      scrollToHashTarget();
      return;
    }

    loadingScreen.classList.add("is-hidden");

    loadingScreen.addEventListener(
      "transitionend",
      (event) => {
        if (event.propertyName !== "opacity") return;
        loadingScreen.remove();
        scrollToHashTarget();
      },
      { once: true }
    );
  }, remaining);

  setTimeout(() => {
    if (loadingScreen && loadingScreen.parentNode) {
      loadingScreen.remove();
      document.body.classList.remove("loading");
      scrollToHashTarget();
    }
  }, MAX_LOADER_TIME);
}

if (showLoader) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hideLoadingScreen, { once: true });
  } else {
    hideLoadingScreen();
  }
} else {
  scrollToHashTarget();
}

// Navigation
if (window.location.pathname === "/index.html" && !initialHash) {
  window.history.replaceState(null, null, "/");
}

const menuButton = document.querySelector(".menu-button");
const navLogo = document.querySelector(".navLogo");
const navOverlay = document.querySelector(".nav-overlay");
const navSluitknop = document.querySelector(".nav-sluitknop");
const navLinks = document.querySelectorAll(".nav-links a");

function openMenu() {
  if (!navOverlay || !menuButton) return;

  navOverlay.classList.add("is-open");
  document.body.classList.add("nav-open");
  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute("aria-label", "Sluit menu");
}

function closeMenu() {
  if (!navOverlay || !menuButton) return;

  navOverlay.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
}

if (navLogo) {
  navLogo.addEventListener("click", () => {
    window.location.href = "./index.html";
  });
}

if (menuButton && navOverlay) {
  menuButton.addEventListener("click", () => {
    const isOpen = navOverlay.classList.contains("is-open");
    isOpen ? closeMenu() : openMenu();
  });
}

if (navSluitknop) {
  navSluitknop.addEventListener("click", closeMenu);
}

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 834) {
    closeMenu();
  }
});

// Feature tabs
const tabs = document.querySelectorAll(".feature-tab");
const panels = document.querySelectorAll(".feature-panel");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;

    tabs.forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-selected", "false");
    });

    panels.forEach((panel) => {
      panel.classList.remove("is-active", "is-animating");
      panel.hidden = true;
    });

    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");

    const activePanel = document.getElementById(`panel-${target}`);
    if (!activePanel) return;

    activePanel.classList.add("is-active");
    activePanel.hidden = false;

    requestAnimationFrame(() => {
      activePanel.classList.add("is-animating");
    });
  });
});

// Billing toggle
const billingButtons = document.querySelectorAll(".billing-pill");
const premiumPrice = document.querySelector(".premium-price");
const companyPrice = document.querySelector(".company-price");

billingButtons.forEach((button) => {
  button.addEventListener("click", () => {
    billingButtons.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    if (!premiumPrice || !companyPrice) return;

    if (button.dataset.billing === "monthly") {
      premiumPrice.innerHTML = "€2,99/maand";
      companyPrice.innerHTML = "€2,20/maand<br />per werknemer";
    } else {
      premiumPrice.innerHTML = "€33/jaar";
      companyPrice.innerHTML = "€20/jaar<br />per werknemer";
    }
  });
});

// Contact form
const form = document.getElementById("contact-form");

if (form) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        window.location.href = "succes.html";
      } else {
        alert("Er liep iets mis bij het verzenden. Probeer het opnieuw.");
      }
    } catch (error) {
      alert("Er kon geen verbinding worden gemaakt. Probeer later opnieuw.");
    }
  });
}

// Carousel
const viewport = document.querySelector(".slider-viewport");
const track = document.querySelector(".slider-track");
const vorige = document.querySelector(".slider-pijl--links");
const volgende = document.querySelector(".slider-pijl--rechts");
const indicatoren = document.querySelectorAll(".indicator");
const sliderBreakpoint = window.matchMedia("(min-width: 1194px)");

if (viewport && track && vorige && volgende && indicatoren.length) {
  let origineleKaarten = [];
  let kaarten = [];
  let aantalOrigineel = 0;
  let huidigeIndex = 1;
  let isTransitioning = false;
  let startX = 0;
  let eersteClone = null;
  let laatsteClone = null;
  let sliderActief = false;
  let kaartBreedte = 0;
  let kaartStap = 0;
  let viewportBreedte = 0;

  function updateIndicatoren() {
    const echteIndex =
      ((huidigeIndex - 1) % aantalOrigineel + aantalOrigineel) %
      aantalOrigineel;

    Array.from(indicatoren).forEach((dot, index) => {
      dot.classList.toggle("indicator--actief", index === echteIndex);
    });
  }

  function updateActieveKaart() {
    kaarten.forEach((kaart) => kaart.classList.remove("kaart--actief"));

    if (kaarten[huidigeIndex]) {
      kaarten[huidigeIndex].classList.add("kaart--actief");
    }

    updateIndicatoren();
  }

  function meetSliderMaten() {
    if (!sliderActief || !viewport || !track || !kaarten[1]) return;

    const trackStijl = window.getComputedStyle(track);
    const kaartGap =
      parseFloat(trackStijl.columnGap || trackStijl.gap || "0") || 0;

    kaartBreedte = kaarten[1].getBoundingClientRect().width;
    viewportBreedte = viewport.getBoundingClientRect().width;
    kaartStap = kaartBreedte + kaartGap;
  }

  function centreerActieveKaart(zonderAnimatie = false) {
    if (!sliderActief) return;

    const actieveKaart = kaarten[huidigeIndex];
    if (!actieveKaart) return;

    if (!kaartStap || !kaartBreedte || !viewportBreedte) {
      meetSliderMaten();
    }

    const verschuiving =
      huidigeIndex * kaartStap - (viewportBreedte / 2 - kaartBreedte / 2);

    track.style.transition = zonderAnimatie ? "none" : "transform 0.45s ease";
    track.style.transform = `translateX(${-verschuiving}px)`;

    updateActieveKaart();
  }

  function gaNaarIndex(index) {
    if (isTransitioning || !sliderActief) return;

    isTransitioning = true;
    huidigeIndex = index;
    centreerActieveKaart(false);
  }

  function gaVolgende() {
    gaNaarIndex(huidigeIndex + 1);
  }

  function gaVorige() {
    gaNaarIndex(huidigeIndex - 1);
  }

  function klikIndicator(event) {
    const index = Array.from(indicatoren).indexOf(event.currentTarget);
    gaNaarIndex(index + 1);
  }

  function startSwipe(event) {
    startX = event.touches[0].clientX;
  }

  function eindSwipe(event) {
    const eindX = event.changedTouches[0].clientX;
    const verschil = startX - eindX;

    if (verschil > 50) {
      gaNaarIndex(huidigeIndex + 1);
    } else if (verschil < -50) {
      gaNaarIndex(huidigeIndex - 1);
    }
  }

  function eindeTransitie() {
    if (huidigeIndex === kaarten.length - 1) {
      huidigeIndex = 1;
      centreerActieveKaart(true);
    }

    if (huidigeIndex === 0) {
      huidigeIndex = aantalOrigineel;
      centreerActieveKaart(true);
    }

    isTransitioning = false;
  }

  function verwijderSliderClones() {
    if (eersteClone && eersteClone.parentNode) {
      eersteClone.parentNode.removeChild(eersteClone);
    }

    if (laatsteClone && laatsteClone.parentNode) {
      laatsteClone.parentNode.removeChild(laatsteClone);
    }

    eersteClone = null;
    laatsteClone = null;
  }

  function resetSliderWeergave() {
    track.style.transition = "";
    track.style.transform = "";

    kaarten.forEach((kaart) => {
      kaart.classList.remove("kaart--actief", "kaart--clone");
    });

    indicatoren.forEach((dot) => {
      dot.classList.remove("indicator--actief");
    });

    if (indicatoren[0]) {
      indicatoren[0].classList.add("indicator--actief");
    }
  }

  function initialiseSlider() {
    if (sliderActief || sliderBreakpoint.matches) return;

    origineleKaarten = Array.from(
      track.querySelectorAll(".kaart:not(.kaart--clone)")
    );

    aantalOrigineel = origineleKaarten.length;

    if (aantalOrigineel < 3) return;

    eersteClone = origineleKaarten[0].cloneNode(true);
    laatsteClone = origineleKaarten[aantalOrigineel - 1].cloneNode(true);

    eersteClone.classList.add("kaart--clone");
    laatsteClone.classList.add("kaart--clone");

    track.appendChild(eersteClone);
    track.insertBefore(laatsteClone, origineleKaarten[0]);

    kaarten = Array.from(track.querySelectorAll(".kaart"));
    huidigeIndex = 1;
    isTransitioning = false;
    startX = 0;

    volgende.addEventListener("click", gaVolgende);
    vorige.addEventListener("click", gaVorige);

    Array.from(indicatoren).forEach((dot) => {
      dot.addEventListener("click", klikIndicator);
    });

    viewport.addEventListener("touchstart", startSwipe, { passive: true });
    viewport.addEventListener("touchend", eindSwipe, { passive: true });
    track.addEventListener("transitionend", eindeTransitie);

    sliderActief = true;
    meetSliderMaten();
    centreerActieveKaart(true);
  }

  function destroySlider() {
    if (!sliderActief) {
      resetSliderWeergave();
      return;
    }

    volgende.removeEventListener("click", gaVolgende);
    vorige.removeEventListener("click", gaVorige);

    Array.from(indicatoren).forEach((dot) => {
      dot.removeEventListener("click", klikIndicator);
    });

    viewport.removeEventListener("touchstart", startSwipe);
    viewport.removeEventListener("touchend", eindSwipe);
    track.removeEventListener("transitionend", eindeTransitie);

    verwijderSliderClones();

    kaarten = Array.from(track.querySelectorAll(".kaart"));
    sliderActief = false;
    isTransitioning = false;

    resetSliderWeergave();
  }

  function updateSliderOpBreakpoint() {
    if (sliderBreakpoint.matches) {
      destroySlider();
    } else {
      initialiseSlider();
    }
  }

  updateSliderOpBreakpoint();

  if (typeof sliderBreakpoint.addEventListener === "function") {
    sliderBreakpoint.addEventListener("change", updateSliderOpBreakpoint);
  } else if (typeof sliderBreakpoint.addListener === "function") {
    sliderBreakpoint.addListener(updateSliderOpBreakpoint);
  }

  requestAnimationFrame(() => {
    if (!sliderBreakpoint.matches) {
      meetSliderMaten();
      centreerActieveKaart(true);
    }
  });

  window.addEventListener("resize", () => {
    if (!sliderBreakpoint.matches) {
      meetSliderMaten();
      centreerActieveKaart(true);
    }
  });
}

// Scroll reveal
const revealElements = document.querySelectorAll(".reveal");

if (revealElements.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}

// Trigger animatie eerste feature panel
requestAnimationFrame(() => {
  const firstPanel = document.querySelector(".feature-panel.is-active");

  if (firstPanel) {
    firstPanel.classList.add("is-animating");
  }
});