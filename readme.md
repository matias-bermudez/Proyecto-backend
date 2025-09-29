# 🛒 Proyecto Backend — Express + Handlebars + MongoDB + Socket.IO

Aplicación Node.js que renderiza **HTML con Handlebars**, usa **Express** como framework web, **MongoDB (Mongoose)** para persistencia de datos y **Socket.IO** para actualización en tiempo real.  
Se implementan **productos y carritos** con todas las operaciones CRUD.

---

## 🚀 Stack
- **Node.js + Express**
- **Handlebars (HBS)** para vistas (SSR)
- **MongoDB Atlas + Mongoose**
- **Socket.IO** (WebSockets) para tiempo real
- **Dotenv** para variables de entorno
- **JavaScript** (cliente y servidor)

---

## ▶️ Ejecución

```bash
# 1) Instalar dependencias
npm install
npm i express-handlebars
npm i socket.io


# 2) Configurar variables en .env
MONGO_URI=mongodb+srv://<db_usr>:<password>@cluster001.hiliizx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster001
PORT=8080
DB_NAME=proyecto-backend

# 3) Levantar el servidor
npm start

## 🌐 Vistas (SSR con Handlebars)

| Ruta                  | Descripción |
|-----------------------|-------------|
| `/`                   | Página de inicio |
| `/products`           | Lista paginada de productos|
| `/products/view/:pid` | Detalle de producto|
| `/realtimeproducts`   | Gestión en tiempo real de productos|
| `/carts`              | Obtiene (o crea) un carrito|
| `/carts/view/:cid`    | Vista de carrito con productos|
| `/carts/:cid/finalize`| Finalizar carrito|

---

## 📡 API Endpoints

### 🔹 Productos (`/api/products`)
- **GET `/api/products`**  
  Lista de productos con soporte de filtros:
  - `limit` → cantidad por página  
  - `page` → número de página  
  - `query` → `category:<nombre>` o `availability:true/false`  
  - `sort` → ordenar por precio `asc` o `desc`  

  **Ejemplo:**  

- **GET `/api/products/:pid`** → Detalle de un producto  
- **POST `/api/products`** → Crear producto  
- **PUT `/api/products/:pid`** → Actualizar producto  
- **DELETE `/api/products/:pid`** → Eliminar producto  

Cada cambio emite `products:update` vía **Socket.IO** a los clientes conectados.

---

### 🔹 Carritos (`/api/carts`)
- **POST `/api/carts`** → Crear un carrito  
- **GET `/api/carts/:cid`** → Obtener carrito con productos **populate**  
- **PUT `/api/carts/:cid`** → Reemplazar todos los productos  
- **PUT `/api/carts/:cid/products/:pid`** → Actualizar cantidad de un producto (o agregar si no existe)  
- **DELETE `/api/carts/:cid/products/:pid`** → Eliminar un producto específico  
- **DELETE `/api/carts/:cid`** → Vaciar carrito  

---

## ⚡ WebSockets (Socket.IO)

- Canal: `products:update`  
- Se emite cada vez que se crea/actualiza/elimina un producto.  
- El cliente (`/realtimeproducts`) re-renderiza la lista automáticamente.

---

