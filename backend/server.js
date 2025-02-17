import Fastify from 'fastify';
import fetch from 'node-fetch';  // Asegúrate de que estás usando node-fetch
import fastifyCors from 'fastify-cors';  // Plugin CORS

const fastify = Fastify();
const port = 3000;

fastify.register(fastifyCors);  // Permite solicitudes CORS desde cualquier origen

fastify.post('/proxy-auth', async (request, reply) => {
    const { code } = request.body;

    try {
        const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: 'u-s4t2ud-3544bd2e13ef9b13992d638561e38b88fa4f533990b5dfc17f1b3ccf53977053',
                client_secret: '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',
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: 'http://127.0.0.1:5500/index.html',
            })
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
            return reply.status(400).send({ error: 'Failed to obtain token' });
        }

        const accessToken = tokenData.access_token;

        // Obtener información del usuario usando el access_token
        const userResponse = await fetch('https://api.intra.42.fr/v2/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const userData = await userResponse.json();

        if (!userResponse.ok) {
            return reply.status(400).send({ error: 'Failed to fetch user data' });
        }

        return reply.send({
            access_token: accessToken,
            user_data: userData,  // Devolvemos los datos del usuario
        });
    } catch (error) {
        console.error('Error during authentication:', error);
        return reply.status(500).send({ error: 'Internal server error' });
    }
});

// Utiliza el método listen en forma asincrónica
const start = async () => {
    try {
        await fastify.listen({ port: 3000 });  // Cambiar a un objeto con la propiedad port
        console.log(`Server listening at http://localhost:3000`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();