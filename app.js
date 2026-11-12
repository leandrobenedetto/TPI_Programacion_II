// Gestor de tareas

function obtenerTareas() {
    const datos = localStorage.getItem("tasks");
    if (datos === null) {
        return [];
    }
    return JSON.parse(datos);
}

function guardarTareas(tareas) {
    localStorage.setItem("tasks", JSON.stringify(tareas));
}

function valor(id) {
    return document.getElementById(id).value.trim();
}

// ---------- Tema claro/oscuro ----------
function iniciarTema() {
    const boton = document.getElementById("theme-toggle");
    const icono = boton.querySelector(".theme-icon");

    function actualizarIcono() {
        if (document.documentElement.getAttribute("data-theme") === "dark") {
            icono.textContent = "☀️";
        } else {
            icono.textContent = "🌙";
        }
    }

    actualizarIcono();

    boton.addEventListener("click", function () {
        let tema = "dark";
        if (document.documentElement.getAttribute("data-theme") === "dark") {
            tema = "light";
        }
        document.documentElement.setAttribute("data-theme", tema);
        localStorage.setItem("theme", tema);
        actualizarIcono();
    });
}

// ---------- Menú hamburguesa ----------
function iniciarMenu() {
    const boton = document.querySelector(".menu-toggle");

    boton.addEventListener("click", function () {
        if (boton.getAttribute("aria-expanded") === "true") {
            boton.setAttribute("aria-expanded", "false");
        } else {
            boton.setAttribute("aria-expanded", "true");
        }
    });
}

// ---------- index.html: lista de tareas ----------
function crearTarjeta(tarea) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "task-card";
    if (tarea.estado === "completada") {
        tarjeta.className = "task-card completed";
    }

    const titulo = document.createElement("h3");
    titulo.className = "task-title";
    titulo.textContent = tarea.titulo;
    tarjeta.appendChild(titulo);

    if (tarea.descripcion !== "") {
        const descripcion = document.createElement("p");
        descripcion.className = "task-description";
        descripcion.textContent = tarea.descripcion;
        tarjeta.appendChild(descripcion);
    }

    const datos = document.createElement("p");
    datos.className = "task-meta";
    datos.textContent = "📅 " + tarea.fechaVencimiento + " · 🚩 " + tarea.prioridad + " · 🏷️ " + tarea.categoria + " · 🚦 " + tarea.estado;
    tarjeta.appendChild(datos);

    if (tarea.email !== "") {
        const email = document.createElement("p");
        email.className = "task-email";
        email.textContent = "✉️ " + tarea.email;
        tarjeta.appendChild(email);
    }

    if (tarea.etiquetas.length > 0) {
        const etiquetas = document.createElement("p");
        etiquetas.className = "task-tags";
        etiquetas.textContent = tarea.etiquetas.join(" · ");
        tarjeta.appendChild(etiquetas);
    }

    const acciones = document.createElement("div");
    acciones.className = "task-actions";

    const botonEstado = document.createElement("button");
    botonEstado.textContent = "✅";
    botonEstado.addEventListener("click", function () {
        cambiarEstado(tarea.id);
    });

    // el editar es un link: al hacer click guarda el id y el link nos lleva a agregar.html
    const botonEditar = document.createElement("a");
    botonEditar.href = "agregar.html";
    botonEditar.textContent = "🗒️";
    botonEditar.addEventListener("click", function () {
        localStorage.setItem("idEditar", tarea.id);
    });

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "⛔";
    botonEliminar.addEventListener("click", function () {
        eliminarTarea(tarea.id);
    });

    acciones.appendChild(botonEstado);
    acciones.appendChild(botonEditar);
    acciones.appendChild(botonEliminar);
    tarjeta.appendChild(acciones);

    return tarjeta;
}

function cambiarEstado(id) {
    const tareas = obtenerTareas();
    for (let i = 0; i < tareas.length; i++) {
        if (tareas[i].id === id) {
            if (tareas[i].estado === "completada") {
                tareas[i].estado = "pendiente";
            } else {
                tareas[i].estado = "completada";
            }
        }
    }
    guardarTareas(tareas);
    mostrarTareas();
}

function eliminarTarea(id) {
    if (confirm("¿Eliminar esta tarea?") === false) {
        return;
    }
    const tareas = obtenerTareas();
    const nuevas = [];
    for (let i = 0; i < tareas.length; i++) {
        if (tareas[i].id !== id) {
            nuevas.push(tareas[i]);
        }
    }
    guardarTareas(nuevas);
    mostrarTareas();
}

function compararFechas(a, b) {
    if (a.fechaVencimiento < b.fechaVencimiento) {
        return -1;
    }
    if (a.fechaVencimiento > b.fechaVencimiento) {
        return 1;
    }
    return 0;
}

function mostrarTareas() {
    const lista = document.getElementById("task-list");
    const vacio = document.getElementById("empty-state");
    const filtroEstado = valor("filter-status");
    const filtroPrioridad = valor("filter-priority");
    const filtroCategoria = valor("filter-category");
    const orden = valor("sort-date");

    const todas = obtenerTareas();

    // contadores
    let pendientes = 0;
    let completadas = 0;
    for (let i = 0; i < todas.length; i++) {
        if (todas[i].estado === "completada") {
            completadas++;
        } else {
            pendientes++;
        }
    }
    document.getElementById("contador-pendientes").textContent = pendientes;
    document.getElementById("contador-completadas").textContent = completadas;

    // filtros
    const tareas = [];
    for (let i = 0; i < todas.length; i++) {
        const t = todas[i];
        let pasa = true;
        if (filtroEstado !== "" && t.estado !== filtroEstado) {
            pasa = false;
        }
        if (filtroPrioridad !== "" && t.prioridad !== filtroPrioridad) {
            pasa = false;
        }
        if (filtroCategoria !== "" && t.categoria !== filtroCategoria) {
            pasa = false;
        }
        if (pasa) {
            tareas.push(t);
        }
    }

    // orden por fecha
    if (orden === "asc") {
        tareas.sort(compararFechas);
    }
    if (orden === "desc") {
        tareas.sort(compararFechas);
        tareas.reverse();
    }

    // mostrar
    lista.innerHTML = "";
    if (tareas.length === 0) {
        vacio.hidden = false;
        return;
    }
    vacio.hidden = true;

    for (let i = 0; i < tareas.length; i++) {
        lista.appendChild(crearTarjeta(tareas[i]));
    }
}

function iniciarLista() {
    document.getElementById("filter-status").addEventListener("change", mostrarTareas);
    document.getElementById("filter-priority").addEventListener("change", mostrarTareas);
    document.getElementById("filter-category").addEventListener("change", mostrarTareas);
    document.getElementById("sort-date").addEventListener("change", mostrarTareas);
    mostrarTareas();
}

// ---------- agregar.html: formulario ----------
const campos = ["titulo", "descripcion", "fechaVencimiento", "prioridad", "categoria", "email"];

// devuelve el mensaje de error, o "" si el campo está bien
function validarCampo(nombre) {
    const v = valor(nombre);

    if (nombre === "titulo") {
        if (v === "") {
            return "El título es obligatorio.";
        }
        if (v.length < 3) {
            return "Debe tener al menos 3 caracteres.";
        }
    }

    if (nombre === "descripcion") {
        if (v.length > 200) {
            return "Máximo 200 caracteres.";
        }
    }

    if (nombre === "fechaVencimiento") {
        if (v === "") {
            return "Elegí una fecha de vencimiento.";
        }
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fecha = new Date(v + "T00:00:00");
        if (fecha < hoy) {
            return "La fecha no puede ser anterior a hoy.";
        }
    }

    if (nombre === "prioridad" && v === "") {
        return "Elegí una prioridad.";
    }

    if (nombre === "categoria" && v === "") {
        return "Elegí una categoría.";
    }

    if (nombre === "email") {
        // como el email es opcional solo se revisa si escribió algo
        if (v !== "" && (v.includes("@") === false || v.includes(".") === false)) {
            return "Ingresá un email válido.";
        }
    }

    return "";
}

function mostrarResultado(nombre, mensaje) {
    const input = document.getElementById(nombre);
    const error = document.getElementById("error-" + nombre);
    const icono = document.getElementById("icon-" + nombre);

    if (mensaje !== "") {
        input.classList.add("invalid");
        input.classList.remove("valid");
        error.textContent = mensaje;
        icono.textContent = "✗";
        icono.className = "status-icon icon-invalid";
    } else {
        input.classList.remove("invalid");
        input.classList.add("valid");
        error.textContent = "";
        if (valor(nombre) === "") {
            // campo opcional vacío, sin ícono
            icono.textContent = "";
            icono.className = "status-icon";
        } else {
            icono.textContent = "✓";
            icono.className = "status-icon icon-valid";
        }
    }
}

function iniciarFormulario() {
    const form = document.getElementById("task-form");
    const etiquetas = document.querySelectorAll('input[name="etiquetas"]');
    const estados = document.querySelectorAll('input[name="estado"]');
    const mensajeFinal = document.getElementById("form-feedback");

    // si venimos de "editar", hay un id guardado
    let idEditar = null;
    if (localStorage.getItem("idEditar") !== null) {
        idEditar = Number(localStorage.getItem("idEditar"));
        localStorage.removeItem("idEditar");
    }

    // si estamos editando, cargamos los datos en el formulario
    if (idEditar !== null) {
        const tareas = obtenerTareas();
        for (let i = 0; i < tareas.length; i++) {
            if (tareas[i].id === idEditar) {
                const t = tareas[i];
                document.getElementById("titulo").value = t.titulo;
                document.getElementById("descripcion").value = t.descripcion;
                document.getElementById("fechaVencimiento").value = t.fechaVencimiento;
                document.getElementById("prioridad").value = t.prioridad;
                document.getElementById("categoria").value = t.categoria;
                document.getElementById("email").value = t.email;

                for (let j = 0; j < etiquetas.length; j++) {
                    etiquetas[j].checked = t.etiquetas.includes(etiquetas[j].value);
                }
                for (let j = 0; j < estados.length; j++) {
                    estados[j].checked = (estados[j].value === t.estado);
                }
                form.querySelector("button[type='submit']").textContent = "Actualizar tarea";
            }
        }
    }

    // validación en tiempo real
    for (let i = 0; i < campos.length; i++) {
        const nombre = campos[i];
        document.getElementById(nombre).addEventListener("input", function () {
            mostrarResultado(nombre, validarCampo(nombre));
        });
    }

    // al enviar
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        let hayErrores = false;
        for (let i = 0; i < campos.length; i++) {
            const mensaje = validarCampo(campos[i]);
            mostrarResultado(campos[i], mensaje);
            if (mensaje !== "") {
                hayErrores = true;
            }
        }

        if (hayErrores) {
            mensajeFinal.textContent = "Revisá los campos marcados en rojo.";
            return;
        }

        // etiquetas marcadas
        const etiquetasMarcadas = [];
        for (let i = 0; i < etiquetas.length; i++) {
            if (etiquetas[i].checked) { //.checked propiedad de checkbox
                etiquetasMarcadas.push(etiquetas[i].value);
            }
        }

        // estado elegido
        let estado = "pendiente";
        for (let i = 0; i < estados.length; i++) {
            if (estados[i].checked) {
                estado = estados[i].value;
            }
        }

        const tareas = obtenerTareas();

        if (idEditar !== null) {
            // actualizar la tarea existente
            for (let i = 0; i < tareas.length; i++) {
                if (tareas[i].id === idEditar) {
                    tareas[i].titulo = valor("titulo");
                    tareas[i].descripcion = valor("descripcion");
                    tareas[i].fechaVencimiento = valor("fechaVencimiento");
                    tareas[i].prioridad = valor("prioridad");
                    tareas[i].categoria = valor("categoria");
                    tareas[i].email = valor("email");
                    tareas[i].etiquetas = etiquetasMarcadas;
                    tareas[i].estado = estado;
                }
            }
        } else {
            // crear una tarea nueva
            const nueva = {
                id: Date.now(),
                titulo: valor("titulo"),
                descripcion: valor("descripcion"),
                fechaVencimiento: valor("fechaVencimiento"),
                prioridad: valor("prioridad"),
                categoria: valor("categoria"),
                email: valor("email"),
                etiquetas: etiquetasMarcadas,
                estado: estado
            };
            tareas.push(nueva);

            // si vuelve a apretar guardar, actualiza esta tarea en vez de crear otra
            idEditar = nueva.id;
            form.querySelector("button[type='submit']").textContent = "Actualizar tarea";
        }

        guardarTareas(tareas);

        mensajeFinal.textContent = "¡Tarea guardada! Podés verla en Inicio.";
    });
}

// ---------- estadisticas.html ----------
function contar(campo, dato) {
    const tareas = obtenerTareas();
    let cantidad = 0;
    for (let i = 0; i < tareas.length; i++) {
        if (tareas[i][campo] === dato) {
            cantidad++;
        }
    }
    return cantidad;
}

function iniciarEstadisticas() {
    document.getElementById("stat-total").textContent = obtenerTareas().length;
    document.getElementById("stat-completadas").textContent = contar("estado", "completada");
    document.getElementById("stat-pendientes").textContent = contar("estado", "pendiente");

    document.getElementById("stat-alta").textContent = contar("prioridad", "alta");
    document.getElementById("stat-media").textContent = contar("prioridad", "media");
    document.getElementById("stat-baja").textContent = contar("prioridad", "baja");

    document.getElementById("stat-trabajo").textContent = contar("categoria", "trabajo");
    document.getElementById("stat-estudio").textContent = contar("categoria", "estudio");
    document.getElementById("stat-personal").textContent = contar("categoria", "personal");
}

// ---------- Inicio ----------
// Vemos qupe hay en cada página antes de iniciar qué hay antes de iniciar
document.addEventListener("DOMContentLoaded", function () {
    iniciarTema();
    iniciarMenu();

    if (document.getElementById("task-list") !== null) {
        iniciarLista();
    }
    if (document.getElementById("task-form") !== null) {
        iniciarFormulario();
    }
    if (document.getElementById("stat-total") !== null) {
        iniciarEstadisticas();
    }
});