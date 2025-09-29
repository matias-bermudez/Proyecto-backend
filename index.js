import { PORT } from "./config/config.js"
import server from './src/server.js'

server.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`)
})
