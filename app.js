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
