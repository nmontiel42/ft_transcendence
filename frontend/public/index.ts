
// Obtiene la configuracion desde el backend y maneja la autenticación OAuth
async function getConfig(): Promise<void> {
    try {
        // Obtener la configuración desde el backend
        const response = await fetch('http://localhost:3000/config');
        // Guarda la respuesta en una variable
        const config = await response.json();
        
        // Definir las constantes necesarias para OAuth
        const OAUTH_URL = 'https://api.intra.42.fr/oauth/authorize';
        const CLIENT_ID = config.client_id;
        const REDIRECT_URI = config.redirect_uri;

        // Función para iniciar sesión (definida aquí solo una vez)
        function signIn(): void {
            const authUrl = `${OAUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
            window.location.href = authUrl;
        }

        // Al pulsar el boton, llama a la función signIn
        const signinButton = document.getElementById('signinBtn') as HTMLButtonElement;
        signinButton.addEventListener('click', signIn);

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

    try {
        // Enviar el código al backend para obtener el token de acceso
        const response = await fetch('http://localhost:3000/proxy-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });

        // Guardar la respuesta en una variable
        const data = await response.json();

        if (response.ok) {
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
            throw new Error(data.error || 'Failed to get token');
        }
    } catch (error) {
        alert('Error during authentication: ' + (error instanceof Error ? error.message : String(error)));
    }
}

// Función para cerrar sesión
function signOut(): void {
    localStorage.removeItem('authToken');
    document.getElementById('profileImage')!.style.display = 'none'; // Ocultar la imagen
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
const signinButton = document.getElementById('signinBtn') as HTMLButtonElement;
const signoutButton = document.getElementById('signoutBtn') as HTMLButtonElement;

signinButton.addEventListener('click', signIn);
signoutButton.addEventListener('click', signOut);

// Si estamos en la URL de callback de 42 (cuando redirige después de la autenticación)
if (window.location.search.includes('code=')) {
    handleOAuthCallback();
}

function signIn(this: HTMLButtonElement, ev: MouseEvent) {
    throw new Error("Function not implemented.");
}

