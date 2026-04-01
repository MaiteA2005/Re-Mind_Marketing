//Loader
document.body.classList.add("loading");

window.addEventListener("load", () => {
    const loadingScreen = document.getElementById("loading-screen");

    setTimeout(() => {
        loadingScreen.style.opacity = "0";
        loadingScreen.style.transition = "opacity 0.5s ease";

        document.body.classList.remove("loading");

        setTimeout(() => {
            loadingScreen.style.display = "none";
        }, 500);
    }, 3000);
});

//Navigation
if (window.location.pathname === '/index.html' || window.location.hash === '#') {
    window.history.replaceState(null, null, '/');
}

const menuButton = document.querySelector('.menu-button');
const navLogo = document.querySelector('.navLogo');
const navLinks = document.querySelector('#main-nav-links');

navLogo.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: 'smooth' });
});

if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Close menu" : "Open menu",
        );
    });
}

//Feature tabs
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
            panel.classList.remove("is-active");
            panel.hidden = true;
        });

        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");

        const activePanel = document.getElementById(`panel-${target}`);
        activePanel.classList.add("is-active");
        activePanel.hidden = false;
    });
});

//Billing toggle
const billingButtons = document.querySelectorAll(".billing-pill");
const premiumPrice = document.querySelector(".premium-price");

billingButtons.forEach((button) => {
    button.addEventListener("click", () => {
        billingButtons.forEach((item) => {
            item.classList.remove("active");
            item.setAttribute("aria-pressed", "false");
        });

        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");

        if (button.dataset.billing === "monthly") {
            premiumPrice.innerHTML = "€2,99/maand";
        } else {
            premiumPrice.innerHTML = "€33/jaar";
        }
    });
});

//Contact form
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

const viewport = document.querySelector(".slider-viewport");
const track = document.querySelector(".slider-track");
const vorige = document.querySelector(".slider-pijl--links");
const volgende = document.querySelector(".slider-pijl--rechts");
const indicatoren = document.querySelectorAll(".indicator");

if (viewport && track && vorige && volgende && indicatoren.length) {
  const origineleKaarten = Array.from(track.querySelectorAll(".kaart"));
  const aantalOrigineel = origineleKaarten.length;

  const eersteClone = origineleKaarten[0].cloneNode(true);
  const laatsteClone = origineleKaarten[aantalOrigineel - 1].cloneNode(true);

  eersteClone.classList.add("kaart--clone");
  laatsteClone.classList.add("kaart--clone");

  track.appendChild(eersteClone);
  track.insertBefore(laatsteClone, origineleKaarten[0]);

  let kaarten = Array.from(track.querySelectorAll(".kaart"));
  let huidigeIndex = 1;
  let isTransitioning = false;
  let startX = 0;

  function updateIndicatoren() {
    const echteIndex =
      ((huidigeIndex - 1) % aantalOrigineel + aantalOrigineel) % aantalOrigineel;

    indicatoren.forEach((dot, i) => {
      dot.classList.toggle("indicator--actief", i === echteIndex);
    });
  }

  function updateActieveKaart() {
    kaarten.forEach((kaart) => kaart.classList.remove("kaart--actief"));

    if (kaarten[huidigeIndex]) {
      kaarten[huidigeIndex].classList.add("kaart--actief");
    }

    updateIndicatoren();
  }

  function centreerActieveKaart(zonderAnimatie = false) {
    const actieveKaart = kaarten[huidigeIndex];
    if (!actieveKaart) return;

    const viewportBreedte = viewport.offsetWidth;
    const kaartLinks = actieveKaart.offsetLeft;
    const kaartBreedte = actieveKaart.offsetWidth;

    const verschuiving = kaartLinks - (viewportBreedte / 2) + (kaartBreedte / 2);

    track.style.transition = zonderAnimatie ? "none" : "transform 0.45s ease";
    track.style.transform = `translateX(-${verschuiving}px)`;

    updateActieveKaart();
  }

  function gaNaarIndex(index) {
    if (isTransitioning) return;
    isTransitioning = true;
    huidigeIndex = index;
    centreerActieveKaart(false);
  }

  volgende.addEventListener("click", () => {
    gaNaarIndex(huidigeIndex + 1);
  });

  vorige.addEventListener("click", () => {
    gaNaarIndex(huidigeIndex - 1);
  });

  indicatoren.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      gaNaarIndex(index + 1);
    });
  });

  viewport.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  viewport.addEventListener("touchend", (e) => {
    const eindX = e.changedTouches[0].clientX;
    const verschil = startX - eindX;

    if (verschil > 50) {
      gaNaarIndex(huidigeIndex + 1);
    } else if (verschil < -50) {
      gaNaarIndex(huidigeIndex - 1);
    }
  });

  track.addEventListener("transitionend", () => {
    if (huidigeIndex === kaarten.length - 1) {
      huidigeIndex = 1;
      centreerActieveKaart(true);
    }

    if (huidigeIndex === 0) {
      huidigeIndex = aantalOrigineel;
      centreerActieveKaart(true);
    }

    isTransitioning = false;
  });

  window.addEventListener("load", () => {
    centreerActieveKaart(true);
  });

  window.addEventListener("resize", () => {
    centreerActieveKaart(true);
  });
}