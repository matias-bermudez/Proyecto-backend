const { PORT } = require('./config/config');
const server = require('./src/server');

server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
