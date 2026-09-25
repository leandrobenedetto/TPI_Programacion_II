// Lógica de la aplicación "ToDo List"

const STORAGE_KEY = "tasks"; // PRIMERO: se define una constante para almacenar las tareas en localStorage

const getTasks = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; // devuelve un array vacío si no hay tareas guardadas
const saveTasks = (tasks) => localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); // guarda el array de tareas en localStorage

const PRIORIDAD_LABEL = { alta: "Alta", media: "Media", baja: "Baja" };
const CATEGORIA_LABEL = { trabajo: "Trabajo", estudio: "Estudio", personal: "Personal" };


// --- agregar.html ---
const initTaskForm = () => {
    const form = document.getElementById("task-form");
    if (!form) return;

    const fields = {
        titulo: document.getElementById("titulo"),
        descripcion: document.getElementById("descripcion"),
        fechaVencimiento: document.getElementById("fechaVencimiento"),
        prioridad: document.getElementById("prioridad"),
        categoria: document.getElementById("categoria"),
        email: document.getElementById("email"),
    };

    // Campos con validación (input/select/textarea de valor único)
    const camposSimples = ["titulo", "descripcion", "fechaVencimiento", "prioridad", "categoria", "email"];
    // Grupo de checkboxes (etiquetas) y grupo de radio buttons (estado)
    const etiquetaInputs = Array.from(document.querySelectorAll('input[name="etiquetas"]'));
    const estadoInputs = Array.from(document.querySelectorAll('input[name="estado"]'));
    const feedback = document.getElementById("form-feedback");

    // "¿se está editando una tarea existente?":
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("id") ? Number(params.get("id")) : null;

    if (editId !== null) {
        const task = getTasks().find((t) => t.id === editId);
        if (task) {
            fields.titulo.value = task.titulo;
            fields.descripcion.value = task.descripcion || "";
            fields.fechaVencimiento.value = task.fechaVencimiento;
            fields.prioridad.value = task.prioridad;
            fields.categoria.value = task.categoria;
            fields.email.value = task.email || "";
            const etiquetasGuardadas = Array.isArray(task.etiquetas) ? task.etiquetas : [];
            etiquetaInputs.forEach((input) => {
                input.checked = etiquetasGuardadas.includes(input.value);
            });
            estadoInputs.forEach((input) => {
                input.checked = input.value === task.estado;
            });
            form.querySelector("button[type='submit']").textContent = "Actualizar tarea";
        }
    }

    // Patrón simple de email (no reemplaza una validación de servidor real)
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // validación simulada de mail, significa: "una cadena que empieza con al menos un carácter que no sea espacio ni @, seguido de un @, seguido de al menos un carácter que no sea espacio ni @, seguido de un . y más caracteres, y nada más"

    // validación en tiempo real
    const validateField = (name) => {
        const value = fields[name].value.trim();

        switch (name) {
            case "titulo":
                if (!value) return "El título es obligatorio.";
                if (value.length < 3) return "Debe tener al menos 3 caracteres.";
                return ""; // no hay mensaje de error que mostrar

            case "descripcion":
                if (value.length > 200) return "Máximo 200 caracteres.";
                return "";

            case "fechaVencimiento": {
                if (!value) return "Elegí una fecha de vencimiento.";
                const hoy = new Date(); // fecha actual
                hoy.setHours(0, 0, 0, 0);
                const fechaElegida = new Date(value + "T00:00:00"); // 
                // Validación cruzada: no permitir fechas pasadas
                if (fechaElegida < hoy) return "La fecha no puede ser anterior a hoy.";
                return "";
            }

            case "prioridad":
                if (!value) return "Elegí una prioridad.";
                return "";

            case "categoria":
                if (!value) return "Elegí una categoría.";
                return "";

            case "email":
                // Opcional: solo se valida el formato si el usuario cargó algo
                if (value && !EMAIL_REGEX.test(value)) return "Ingresá un email válido.";
                return "";

            default:
                return "";
        }
    };

    const showFieldResult = (name, errorMsg) => {
        const input = fields[name];
        const errorSpan = document.getElementById(`error-${name}`);
        const iconSpan = document.getElementById(`icon-${name}`);
        const value = input.value.trim();

        if (errorMsg) {
            input.classList.add("invalid");
            input.classList.remove("valid");
            if (errorSpan) errorSpan.textContent = errorMsg;
            if (iconSpan) {
                iconSpan.textContent = "✗";
                iconSpan.className = "status-icon icon-invalid";
            }
        } else {
            input.classList.remove("invalid");
            input.classList.add("valid");
            if (errorSpan) errorSpan.textContent = "";
            if (iconSpan) {
                // Si el campo es opcional y está vacío, no mostramos ícono de éxito
                if (!input.required && !value) {
                    iconSpan.textContent = "";
                    iconSpan.className = "status-icon";
                } else {
                    iconSpan.textContent = "✓";
                    iconSpan.className = "status-icon icon-valid";
                }
            }
        }
    };

    camposSimples.forEach((name) => {
        const input = fields[name];
        input.addEventListener("input", () => showFieldResult(name, validateField(name)));
        input.addEventListener("change", () => showFieldResult(name, validateField(name)));
    });

    // ----- Envío del formulario -----
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const errores = camposSimples.map((name) => {
            const error = validateField(name);
            showFieldResult(name, error);
            return error;
        });

        if (errores.some((err) => err !== "")) {
            if (feedback) {
                feedback.textContent = "Revisá los campos marcados en rojo.";
                feedback.style.color = "var(--color-danger)";
            }
            return;
        }

        const etiquetasSeleccionadas = etiquetaInputs.filter((i) => i.checked).map((i) => i.value);
        const estadoSeleccionado = estadoInputs.find((i) => i.checked)?.value || "pendiente";

        const tasks = getTasks();
        const taskData = {
            titulo: fields.titulo.value.trim(),
            descripcion: fields.descripcion.value.trim(),
            fechaVencimiento: fields.fechaVencimiento.value,
            prioridad: fields.prioridad.value,
            categoria: fields.categoria.value,
            email: fields.email.value.trim(),
            etiquetas: etiquetasSeleccionadas,
            estado: estadoSeleccionado,
        };

        if (editId !== null) {
            const updated = tasks.map((t) =>
                t.id === editId ? { ...t, ...taskData } : t
            );
            saveTasks(updated);
        } else {
            const newTask = { id: Date.now(), completado: false, ...taskData };
            saveTasks([...tasks, newTask]);
        }

        if (feedback) {
            feedback.textContent = "¡Tarea guardada! Redirigiendo...";
            feedback.style.color = "var(--color-success)";
        }

        setTimeout(() => {
            window.location.href = "index.html";
        }, 700);
    });

};

// Toggle de tema claro/oscuro (en las 4 páginas):
// EL TEMA YA SE APLICA DE ENTRADA CON UN SCRIPT "INLINE" EN EL <head> DE CADA PÁGINA (evita un "flash" como se dijo en index.html); acá solo se maneja el click y el ícono del botón
const initThemeToggle = () => {
    const toggleBtn = document.getElementById("theme-toggle");
    if (!toggleBtn) return; // verificador de botón

    const icon = toggleBtn.querySelector(".theme-icon");

    const actualizarIcono = () => {
        const temaActual = document.documentElement.getAttribute("data-theme") || "light";
        if (icon) icon.textContent = temaActual === "dark" ? "☀️" : "🌙";
        toggleBtn.setAttribute(
            "aria-label",
            temaActual === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
        );
    };

    actualizarIcono();

    toggleBtn.addEventListener("click", () => {
        const temaActual = document.documentElement.getAttribute("data-theme") || "light";
        const nuevoTema = temaActual === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", nuevoTema);
        localStorage.setItem("theme", nuevoTema);
        actualizarIcono();
    });
};

// MENÚ HAMBURGUESA (en las 4 páginas)
const initMenuToggle = () => {
    const menuToggle = document.querySelector(".menu-toggle");
    if (!menuToggle) return;

    menuToggle.addEventListener("click", () => {
        const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isOpen));
    });
};

// --- index.html ---
const initTaskList = () => {
    const taskList = document.getElementById("task-list");
    if(!taskList) return;
    const emptyState = document.getElementById("empty-state");
    const filterPriority = document.getElementById("filter-priority");
    const filterCategory = document.getElementById("filter-category");

    const ESTADO_LABEL = { pendiente: "Pendiente", "en-progreso": "En progreso" };
    const ETIQUETA_LABEL = { urgente: "Urgente", importante: "Importante", recordatorio: "🔔 Recordatorio" };

    const createTaskCard = (task) => {
        const etiquetas = Array.isArray(task.etiquetas) ? task.etiquetas : [];
        const card = document.createElement("div");
        card.className = "task-card" + (task.completado ? " completed" : "");
        card.innerHTML = `
            <h3 class="task-title">${task.titulo}</h3>
            ${task.descripcion ? `<p class="task-description">${task.descripcion}</p>` : ""}
            <p class="task-meta">
                📅 ${task.fechaVencimiento || "Sin fecha"} ·
                🚩 ${PRIORIDAD_LABEL[task.prioridad] || task.prioridad} ·
                🏷️ ${CATEGORIA_LABEL[task.categoria] || task.categoria}
                ${task.estado ? ` · 🚦 ${ESTADO_LABEL[task.estado] || task.estado}` : ""}
            </p>
            ${task.email ? `<p class="task-email">✉️ ${task.email}</p>` : ""}
            ${etiquetas.length ? `<p class="task-tags">${etiquetas.map((e) => ETIQUETA_LABEL[e] || e).join(" · ")}</p>` : ""}
            <div class="task-actions">
                <button data-action="toggle" data-id="${task.id}">✅</button>
                <button data-action="edit" data-id="${task.id}">🗒️</button>
                <button data-action="delete" data-id="${task.id}">⛔</button>
            </div>
        `;

        return card;
    };

    const renderTasks = () => {
        let tasks = getTasks();

        const prioridadFiltro = filterPriority ? filterPriority.value : "";
        const categoriaFiltro = filterCategory ? filterCategory.value : "";

        if (prioridadFiltro) {
            tasks = tasks.filter((t) => t.prioridad === prioridadFiltro);
        }
        if (categoriaFiltro) {
            tasks = tasks.filter((t) => t.categoria === categoriaFiltro);
        }

        taskList.innerHTML = "";

        if (tasks.length === 0) {
            if (emptyState) emptyState.hidden = false;
            return;
        }
        if (emptyState) emptyState.hidden = true;

        tasks.forEach((task) => taskList.appendChild(createTaskCard(task)));
    };

    taskList.addEventListener("click", (e) => {
        const button = e.target.closest("button[data-action]");
        if (!button) return;

        const id = Number(button.dataset.id);
        const action = button.dataset.action;
        let tasks = getTasks();

        if (action === "toggle") {
            tasks = tasks.map((t) => (t.id === id ? { ...t, completado: !t.completado } : t));
            saveTasks(tasks);
            renderTasks();
        } else if (action === "delete") {
            if (confirm("¿Eliminar esta tarea?")) {
                tasks = tasks.filter((t) => t.id !== id);
                saveTasks(tasks);
                renderTasks();
            }
        } else if (action === "edit") {
            window.location.href = `agregar.html?id=${id}`;
        }
    });

    if (filterPriority) filterPriority.addEventListener("change", renderTasks);
    if (filterCategory) filterCategory.addEventListener("change", renderTasks);

    renderTasks();
};

// --- estadisticas.html ---
const initStats = () => {
    const statTotal = document.getElementById("stat-total");
    if (!statTotal) return;

    const tasks = getTasks();

    const completadas = tasks.filter((t) => t.completado).length;
    const pendientes = tasks.length - completadas;

    statTotal.textContent = tasks.length;
    document.getElementById("stat-completadas").textContent = completadas;
    document.getElementById("stat-pendientes").textContent = pendientes;

    ["alta", "media", "baja"].forEach((prioridad) => {
        const el = document.getElementById(`stat-${prioridad}`);
        if (el) el.textContent = tasks.filter((t) => t.prioridad === prioridad).length;
    });

    ["trabajo", "estudio", "personal"].forEach((categoria) => {
        const el = document.getElementById(`stat-${categoria}`);
        if (el) el.textContent = tasks.filter((t) => t.categoria === categoria).length;
    });
};

// Inicialización general
document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initMenuToggle();
    initTaskList();
    initTaskForm();
    initStats();
});
