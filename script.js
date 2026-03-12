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