// ================================
// Funciones Utilitarias (Utilities)
// creado por: Cristian Toloza
// ================================

// -------------------------------
// Mostrar el spinner de carga
// -------------------------------
function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.add('active'); // Activa la clase para mostrar el spinner
    }
}

// -------------------------------
// Ocultar el spinner de carga
// -------------------------------
function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.remove('active'); // Quita la clase para ocultar el spinner
    }
}

// -------------------------------
// Mostrar notificación tipo "toast"
// message: texto del mensaje
// type: tipo de mensaje (success, error, warning, info)
// -------------------------------
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <strong>${getToastIcon(type)}</strong>
            <span>${message}</span>
        </div>
    `;

    container.appendChild(toast);

    // Eliminar automáticamente después del tiempo definido
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, UI_CONFIG.TOAST_DURATION);
}

// -------------------------------
// Obtener ícono según el tipo de notificación
// -------------------------------
function getToastIcon(type) {
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// -------------------------------
// Formatear fecha para visualización (ej: 13/08/2025)
// -------------------------------
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

// -------------------------------
// Formatear fecha para input tipo date (ej: 2025-08-13)
// -------------------------------
function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// -------------------------------
// Función debounce: retrasa la ejecución de la función
// hasta que el usuario deje de interactuar por X tiempo
// -------------------------------
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// -------------------------------
// Validar email con expresión regular
// -------------------------------
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// -------------------------------
// Validar campos obligatorios en un formulario
// - formData: objeto con los valores
// - requiredFields: array con los nombres de los campos requeridos
// -------------------------------
function validateForm(formData, requiredFields) {
    const errors = [];
    requiredFields.forEach(field => {
        if (!formData[field] || formData[field].toString().trim() === '') {
            errors.push(`${field} es requerido`);
        }
    });

    // Validar email si existe
    if (formData.email && !isValidEmail(formData.email)) {
        errors.push('Email no válido');
    }

    return errors;
}

// -------------------------------
// Mostrar cuadro de confirmación nativo del navegador
// -------------------------------
function confirmDialog(message) {
    return confirm(message);
}

// -------------------------------
// Limpiar un formulario (por ID)
// -------------------------------
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

// -------------------------------
// Asignar datos a un formulario desde un objeto
// -------------------------------
function setFormData(formId, data) {
    const form = document.getElementById(formId);
    if (!form) return;

    Object.keys(data).forEach(key => {
        const input = form.querySelector(`#${formId.replace('Form', '')}${key.charAt(0).toUpperCase() + key.slice(1)}`);
        if (input) {
            if (input.type === 'date' && data[key]) {
                input.value = formatDateForInput(data[key]);
            } else {
                input.value = data[key] || '';
            }
        }
    });
}

// -------------------------------
// Obtener datos de un formulario
// Convierte nombres de campos a nombres de BD usando fieldMapping
// -------------------------------
function getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // Mapeo entre nombres del formulario y nombres en BD
    const fieldMapping = {
        profesorNombre: 'nombre',
        profesorEspecialidad: 'especialidad',
        estudianteNombre: 'nombre',
        estudianteEmail: 'email',
        estudianteFechaRegistro: 'fecha_registro',
        cursoNombre: 'nombre_curso',
        cursoProfesor: 'id_profesor',
        inscripcionEstudiante: 'id_estudiante',
        inscripcionCurso: 'id_curso',
        inscripcionFecha: 'fecha_inscripcion'
    };

    const mappedData = {};
    Object.keys(data).forEach(key => {
        const mappedKey = fieldMapping[key] || key;
        mappedData[mappedKey] = data[key];
    });

    // Convertir IDs a número entero si existen
    if (mappedData.id_profesor) mappedData.id_profesor = parseInt(mappedData.id_profesor);
    if (mappedData.id_estudiante) mappedData.id_estudiante = parseInt(mappedData.id_estudiante);
    if (mappedData.id_curso) mappedData.id_curso = parseInt(mappedData.id_curso);

    return mappedData;
}

// -------------------------------
// Filtrar un array según un término de búsqueda
// searchFields: array de campos donde buscar
// -------------------------------
function filterData(data, searchTerm, searchFields) {
    if (!searchTerm) return data;

    const term = searchTerm.toLowerCase();
    return data.filter(item => {
        return searchFields.some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(term);
        });
    });
}

// -------------------------------
// Ordenar un array según un campo
// direction: asc o desc
// -------------------------------
function sortData(data, field, direction = 'asc') {
    return [...data].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        if (direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}

// -------------------------------
// Manejar errores de API mostrando mensaje amigable
// -------------------------------
function handleApiError(error) {
    console.error('API Error:', error);

    let message = 'Ha ocurrido un error';

    if (error.message.includes('timeout')) {
        message = 'Tiempo de espera agotado. Intenta nuevamente.';
    } else if (error.message.includes('Network')) {
        message = 'Error de conexión. Verifica tu conexión a internet.';
    } else if (error.message.includes('404')) {
        message = 'Recurso no encontrado.';
    } else if (error.message.includes('401')) {
        message = 'No autorizado. Verifica tus credenciales.';
    } else if (error.message.includes('403')) {
        message = 'Acceso denegado.';
    } else if (error.message.includes('500')) {
        message = 'Error interno del servidor.';
    } else if (error.message) {
        message = error.message;
    }

    showToast(message, 'error'); // Mostrar error en un toast
}

// -------------------------------
// Generar un ID único
// -------------------------------
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// -------------------------------
// Escapar caracteres peligrosos (prevención XSS)
// -------------------------------
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// -------------------------------
// Agregar animación CSS para salida de toast
// -------------------------------
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
