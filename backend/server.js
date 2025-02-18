import Fastify from 'fastify';
import fetch from 'node-fetch';
import fastifyCors from 'fastify-cors';
import dotenv from 'dotenv';

// Carga las variables de entono en .env
dotenv.config();

// Crear una instancia de Fastify
const fastify = Fastify();

// Obtener las variables de entorno
const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Definir una ruta para obtener la configuración
fastify.get('/config', (request, reply) => {
    reply.send({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI
    });
});

// Registrar el plugin de CORS
// Permite solicitudes CORS desde cualquier origen
fastify.register(fastifyCors);  

// Definir una ruta para manejar la autenticación
fastify.post('/proxy-auth', async (request, reply) => {
    // Obtener el código de autorización del cuerpo de la solicitud
    const { code } = request.body;

    if (!code) {
        return reply.status(400).send({ error: 'No authorization code found' });
    }
    // Verificar si el código de autorización está presente
    try {
        // Intercambiar el código de autorización por un token de acceso
        const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.REDIRECT_URI,
            })
        });

        // Verificar si la solicitud fue exitosa
        const tokenData = await tokenResponse.json();
        
        // Si falla muestra un mensaje de error
        if (!tokenResponse.ok) {
            return reply.status(400).send({ error: 'Failed to obtain token' });
        }

        // Token de acceso
        const accessToken = tokenData.access_token;

        // Obtener información del usuario usando el access_token
        const userResponse = await fetch('https://api.intra.42.fr/v2/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        // Verificar si la solicitud fue exitosa
        const userData = await userResponse.json();

        // Si falla muestra un mensaje de error
        if (!userResponse.ok) {
            return reply.status(400).send({ error: 'Failed to fetch user data' });
        }

        // Devolver el token de acceso y los datos del usuario
        return reply.send({
            access_token: accessToken,
            user_data: userData,
        });
    } catch (error) {
        console.error('Error during authentication:', error);
        return reply.status(500).send({ error: 'Internal server error' });
    }
});

// Iniciar el servidor
const start = async () => {
    try {
        // Esccuah enb el puerto 3000
        await fastify.listen({ port: 3000 });  // Cambiar a un objeto con la propiedad port
        console.log(`Server listening at http://localhost:3000`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

// Llamar la función para iniciar el servidor
start();