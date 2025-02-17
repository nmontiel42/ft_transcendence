"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const OAUTH_URL = 'https://api.intra.42.fr/oauth/authorize';
const CLIENT_ID = 'u-s4t2ud-3544bd2e13ef9b13992d638561e38b88fa4f533990b5dfc17f1b3ccf53977053'; // Reemplázalo con tu client_id
const REDIRECT_URI = 'http://127.0.0.1:5500/index.html'; // Debe coincidir con la URL configurada en la API de 42
const CLIENT_SECRET = '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'; // Reemplázalo con el client_secret que te proporcionaron.
// Función para iniciar sesión
function signIn() {
    const authUrl = `${OAUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
    window.location.href = authUrl; // Redirigir al usuario a la página de autenticación
}
function handleOAuthCallback() {
    return __awaiter(this, void 0, void 0, function* () {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (!code) {
            alert('No authorization code found.');
            return;
        }
        try {
            // Enviar el código de autorización a nuestro backend para obtener el token
            const response = yield fetch('http://localhost:3000/proxy-auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code })
            });
            const data = yield response.json();
            if (response.ok) {
                const token = data.access_token; // Token de acceso recibido
                localStorage.setItem('authToken', token); // Guardamos el token
                // Mostrar información del usuario para verificar si todo está correcto
                console.log('User information:', data.user_data);
                console.log('Access token:', token); // Mostrar token por si es necesario
                // Puedes acceder al login del usuario aquí
                const userLogin = data.user_data.login; // El login del usuario está en data.user_data.login
                console.log('User login:', userLogin);
                // Mostrar el login en la UI
                document.getElementById('userLogin').textContent = `Welcome, ${userLogin}`;
                showHome(); // Mostramos la vista de home
            }
            else {
                throw new Error(data.error || 'Failed to get token');
            }
        }
        catch (error) {
            if (error instanceof Error) {
                alert('Error during authentication: ' + error.message);
            }
            else {
                alert('Error during authentication: ' + String(error));
            }
        }
    });
}
function signOut() {
    localStorage.removeItem('authToken');
    showSignin();
}
function showSignin() {
    document.getElementById('signin').style.display = 'block';
    document.getElementById('home').style.display = 'none';
}
// Función para mostrar la vista de inicio
function showHome() {
    document.getElementById('signin').style.display = 'none';
    document.getElementById('home').style.display = 'block';
}
// Verificar si el usuario ya tiene un token de autenticación
if (localStorage.getItem('authToken')) {
    showHome();
}
else {
    showSignin();
}
const signinButton = document.getElementById('signinBtn');
const signoutButton = document.getElementById('signoutBtn');
signinButton.addEventListener('click', signIn);
signoutButton.addEventListener('click', signOut);
// Si estamos en la URL de callback de 42 (cuando redirige después de la autenticación)
if (window.location.search.includes('code=')) {
    console.log('Redirect URI received:', window.location.href);
    handleOAuthCallback();
}
