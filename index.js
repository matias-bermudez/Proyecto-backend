const { PORT } = require('./config/config');
const app = require('./app');

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
