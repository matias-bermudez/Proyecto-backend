const socket = io()

const list = document.getElementById('prodList')
const form = document.getElementById('createForm')

function render(items){
    list.innerHTML = items.map(p => `
        <li data-id="${p.id}">
            <strong>${p.nombre}</strong> — $${p.precio}
            <button data-del="${p.id}" style="margin-left:8px">Eliminar</button>
        </li>
        `)
    .join('') || '<li>No hay productos.</li>'
}

// Escuchar actualizaciones
socket.on('products:update', (data) => {
    render(data)
})

// Crear por HTTP (el controller emite)
if(form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        const body = Object.fromEntries(fd.entries())
        body.precio = Number(body.precio)
        body.stock  = Number(body.stock)

        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type':'application/json' },
            body: JSON.stringify(body)
        })
        if (!res.ok) alert('Error creando')
        return
    })
}

// Eliminar por HTTP (el controller emite)
if(list) {
    list.addEventListener('click', async (e) => {
        const id = e.target.dataset.del
        if (!id) return
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
        if (!res.ok) alert('Error eliminando')
    })
}

