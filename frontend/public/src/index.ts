// Para comprobar si se ha iniciado sesion o no
let signInClicked = false;

// Función para iniciar sesion
function signIn(clientId: string, redirectUri: string): void {
    
    signInClicked = true;

    // Verificar si el usuario ya tiene un token de autenticacion
    const token = localStorage.getItem('authToken');
    if (!token) {
        const OAUTH_URL = 'https://api.intra.42.fr/oauth/authorize';
        const authUrl = `${OAUTH_URL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
        window.location.href = authUrl;
    }
}

// Obtiene la configuracion desde el backend y maneja la autenticación OAuth
async function getConfig(): Promise<void> {
    try {
        // Obtener la configuración desde el backend
        const response = await fetch('http://localhost:3000/config');
        // Guarda la respuesta en una variable
        const config = await response.json();

        // Usar los valores de la configuración
        const CLIENT_ID = config.client_id;
        const REDIRECT_URI = config.redirect_uri;

        // Al pulsar el botón, llama a la función signIn pasando los parámetros necesarios
        const signinButton = document.getElementById('signinBtn') as HTMLButtonElement;
        signinButton.addEventListener('click', () => signIn(CLIENT_ID, REDIRECT_URI));

    } catch (error) {
        console.error('Error loading config:', error);
    }
}


// Llamar la función para cargar la configuración
getConfig();

// Maneja el callback de OAuth y muestra la información del usuario
async function handleOAuthCallback(): Promise<void> {
    // Obtener el código de autorización de la URL
    const urlParams = new URLSearchParams(window.location.search);
    // Extraer el código de la URL
    const code = urlParams.get('code');

    if (!code) {
        alert('No authorization code found.');
        return;
    }

    // Enviar el código al backend para obtener el token de acceso
    const response = await fetch('http://localhost:3000/proxy-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    });

    // Verificar si la respuesta es exitosa
    if (response.ok) {
        const data = await response.json();

        // Guardar el token de acceso en el almacenamiento local
        const token = data.access_token;
        localStorage.setItem('authToken', token);

        // Extraer información del usuario
        const userLogin = data.user_data.login;
        const userProfileImage = data.user_data.image.link; // Obtener URL de la imagen

        // Mostrar información en la UI
        document.getElementById('userLogin')!.textContent = `Welcome, ${userLogin}`;
        const profileImgElement = document.getElementById('profileImage') as HTMLImageElement;
        profileImgElement.src = userProfileImage;
        profileImgElement.style.display = 'block'; // Asegurar que la imagen sea visible

        showHome();
    } else {
        if (signInClicked) {
            const data = await response.json();
            alert('Error during authentication: ' + (data.error || 'Unknown error'));
        }
    }
}

// Función para cerrar sesión
function signOut(): void {
    // Eliminar el token de acceso y cualquier información relacionada con la cuenta
    localStorage.removeItem('authToken');
    
    // Ocultar la imagen de perfil y el nombre de usuario
    document.getElementById('profileImage')!.style.display = 'none';
    document.getElementById('userLogin')!.textContent = '';

    // Llamar a la función para mostrar la interfaz de inicio de sesión
    showSignin();
}

//-------------------- SECCIONES PAGINA --------------------//

// Función para mostrar la vista de inicio de sesión
function showSignin(): void {
    document.getElementById('signin')!.style.display = 'block';
    document.getElementById('home')!.style.display = 'none';
}
// Función para mostrar la vista de home
function showHome(): void {
    document.getElementById('signin')!.style.display = 'none';
    document.getElementById('home')!.style.display = 'block';
}

// Verificar si el usuario ya tiene un token de autenticación
if (localStorage.getItem('authToken')) {
    showHome();
} else {
    showSignin();
}

//-------------------- BOTONES --------------------//

// Guarda los botones y su funcionalidad
const signoutButton = document.getElementById('signoutBtn') as HTMLButtonElement;

signoutButton.addEventListener('click', signOut);

// Si estamos en la URL de callback de 42 (cuando redirige después de la autenticación)
// Primero debe cargar el html y luego ejecutar el callback
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    // Si el código de autorización está presente, ejecutar el callback
    if (code) {
        handleOAuthCallback();
    } else {
        console.log('No authorization code found, skipping OAuth callback.');
    }
});
