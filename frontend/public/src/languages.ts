/*--------------------------------- SIGN IN ---------------------------------*/

const languagesSignIn = {
    es: {
        welcome: "Bienvenido al<br>mundo arcade",
        signInPrompt: "INICIA SESIÓN PARA JUGAR",
        startButton: "PULSA EMPEZAR",
        homeWelcome: "Bienvenid@,",
        signOutButton: "Cerrar sesión",
    },
    en: {
        welcome: "Welcome to the<br>arcade world",
        signInPrompt: "SIGN IN TO PLAY",
        startButton: "PRESS START",
        homeWelcome: "Welcome,",
        signOutButton: "Sign Out",
    },
    fr: {
        welcome: "Bienvenue dans le<br>monde arcade",
        signInPrompt: "CONNECTEZ-VOUS POUR JOUER",
        startButton: "APPUYEZ POUR COMMENCER",
        homeWelcome: "Bienvenue,",
        signOutButton: "Déconnexion",
    }
};

function changeLanguage(lang: "es" | "en" | "fr") {
    localStorage.setItem("selectedLanguage", lang); // Guarda el idioma seleccionado
    applyLanguage(lang);
}

function applyLanguage(lang: "es" | "en" | "fr") {
    // Página de inicio de sesión (signin)
    document.querySelector(".neon-text")!.innerHTML = languagesSignIn[lang].welcome;
    document.querySelector(".neon-subtitle")!.textContent = languagesSignIn[lang].signInPrompt;
    document.querySelector("#signinBtn")!.textContent = languagesSignIn[lang].startButton;

    // Página de inicio (home)
    document.querySelector("#welcome-text")!.innerHTML = `${languagesSignIn[lang].homeWelcome} <span id="userLogin"></span>`;
    document.querySelector("#signoutBtn")!.textContent = languagesSignIn[lang].signOutButton;
}

// Event listeners para los botones de idioma
document.getElementById("esBtn")!.addEventListener("click", () => changeLanguage("es"));
document.getElementById("enBtn")!.addEventListener("click", () => changeLanguage("en"));
document.getElementById("frBtn")!.addEventListener("click", () => changeLanguage("fr"));

// Al cargar la página, aplicar el idioma guardado o usar español por defecto
document.addEventListener("DOMContentLoaded", () => {
    const savedLanguage = localStorage.getItem("selectedLanguage") as "es" | "en" | "fr" || "es";
    applyLanguage(savedLanguage);
});
