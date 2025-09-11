const { PORT } = require('./config/config');
const app = require('./src/app');

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
