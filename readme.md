# Proyecto Backend — Express + Handlebars (HBS) + WebSockets (Socket.IO)

Aplicación Node.js que renderiza **HTML** con **Handlebars**, usa **Express** como framework web y **Socket.IO** para **actualización en tiempo real** de productos en la vista `/realtimeproducts`.  
Se incluye una API mínima para crear/eliminar productos (usada por los formularios del sitio).

---

## 🚀 Stack
- **Node.js + Express**
- **Handlebars (HBS)** para vistas (SSR)
- **Socket.IO** (WebSockets) para tiempo real
- **JavaScript** (cliente y servidor)
- **JSON** como “DB” simple (`/data/product.json`)

---

## ▶️ Cómo ejecutar

```bash
# 1) Instalar dependencias
npm install

# 2) (Opcional) crear .env con el puerto
# PORT=8080

# 3) Arrancar el proyecto
npm start
# → http://localhost:8080


mongodb+srv://matiasbermudezmunoz_db_user:O6Oj13Rf9XrGk7vU@cluster001.hiliizx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster001

mongodb+srv://matiasbermudezmunoz_db_user:O6Oj13Rf9XrGk7vU@cluster001.hiliizx.mongodb.net/<DB_NAME>?retryWrites=true&w=majority&appName=Cluster001