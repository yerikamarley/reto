// Main Application
class SistemaEducativo {
    constructor() {
        this.currentSection = 'dashboard';
        this.editingId = null;
        this.editingType = null;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupSearch();
        await this.loadDashboard();
        
        // Actualización automática del panel si está habilitado
        if (ENV_CONFIG.REFRESH_INTERVAL > 0) {
            setInterval(() => {
                if (this.currentSection === 'dashboard') {
                    this.loadDashboard();
                }
            }, ENV_CONFIG.REFRESH_INTERVAL);
        }
    }

    setupEventListeners() {
        // Navegacion
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobileMenuToggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                const sidebar = document.getElementById('sidebar');
                sidebar.classList.toggle('active');
            });
        }

        // Form submissions
        this.setupFormHandlers();

        // Modal close on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    setupFormHandlers() {
        // Profesor formulario
        const profesorForm = document.getElementById('profesorForm');
        
        if (profesorForm) {
            profesorForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProfesorSubmit();
            });
        }

        // Estudiante formulario
        const estudianteForm = document.getElementById('estudianteForm');
        if (estudianteForm) {
            estudianteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEstudianteSubmit();
            });
        }

        // Curso formulario
        const cursoForm = document.getElementById('cursoForm');
        if (cursoForm) {
            cursoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCursoSubmit();
            });
        }

        // Inscripción formulario
        const inscripcionForm = document.getElementById('inscripcionForm');
        if (inscripcionForm) {
            inscripcionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleInscripcionSubmit();
            });
        }
    }

    setupSearch() {
        // Profesores buscar
        const searchProfesores = document.getElementById('searchProfesores');
        if (searchProfesores) {
            searchProfesores.addEventListener('input', debounce((e) => {
                this.filterProfesores(e.target.value);
            }, 300));
        }

        // Estudiantes buscar
        const searchEstudiantes = document.getElementById('searchEstudiantes');
        if (searchEstudiantes) {
            searchEstudiantes.addEventListener('input', debounce((e) => {
                this.filterEstudiantes(e.target.value);
            }, 300));
        }

        // Cursos buscar
        const searchCursos = document.getElementById('searchCursos');
        if (searchCursos) {
            searchCursos.addEventListener('input', debounce((e) => {
                this.filterCursos(e.target.value);
            }, 300));
        }

        // Inscripciones buscar
        const searchInscripciones = document.getElementById('searchInscripciones');
        if (searchInscripciones) {
            searchInscripciones.addEventListener('input', debounce((e) => {
                this.filterInscripciones(e.target.value);
            }, 300));
        }
    }

    showSection(sectionName) {
        // actulizar navegacion
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // actulizar secsione
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        this.currentSection = sectionName;

        // carga data de la secsion
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'profesores':
                this.loadProfesores();
                break;
            case 'estudiantes':
                this.loadEstudiantes();
                break;
            case 'cursos':
                this.loadCursos();
                break;
            case 'inscripciones':
                this.loadInscripciones();
                break;
        }

        // Cerrar mobile menu
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth < 1024) {
            sidebar.classList.remove('active');
        }
    }

    // Dashboard Metodos
    async loadDashboard() {
        try {
            const [profesores, estudiantes, cursos, inscripciones] = await Promise.all([
                Array(),
                Array(),
                cursosService.getAll(),
                Array()
            ]);

            this.updateDashboardStats(profesores, estudiantes, cursos, inscripciones);
            this.updateDashboardCharts(profesores, estudiantes, cursos, inscripciones);
        } catch (error) {
            handleApiError(error);
        }
    }

    updateDashboardStats(profesores, estudiantes, cursos, inscripciones) {
        document.getElementById('totalProfesores').textContent = profesores.length;
        document.getElementById('totalEstudiantes').textContent = estudiantes.length;
        document.getElementById('totalCursos').textContent = cursos.length;
        document.getElementById('totalInscripciones').textContent = inscripciones.length;
    }

    updateDashboardCharts(profesores, estudiantes, cursos, inscripciones) {
        // Cursos más populares
        const cursosConInscripciones = cursos.map(curso => {
            const inscripcionesCount = inscripciones.filter(ins => ins.id_curso === curso.id_curso).length;
            const profesor = profesores.find(p => p.id_profesor === curso.id_profesor);
            return {
                ...curso,
                inscripciones: inscripcionesCount,
                profesor_nombre: profesor?.nombre || 'Sin profesor'
            };
        }).sort((a, b) => b.inscripciones - a.inscripciones);

        const cursosPopularesContainer = document.getElementById('cursosPopulares');
        cursosPopularesContainer.innerHTML = cursosConInscripciones.slice(0, 5).map(curso => `
            <div class="chart-item">
                <div class="chart-item-info">
                    <h4>${escapeHtml(curso.nombre_curso)}</h4>
                    <p>${escapeHtml(curso.profesor_nombre)}</p>
                </div>
                <div class="chart-item-value">
                    <div class="value">${curso.inscripciones}</div>
                    <div class="label">inscripciones</div>
                </div>
            </div>
        `).join('');

        // Especialidades de profesores
        const especialidadesContainer = document.getElementById('especialidadesProfesores');
        especialidadesContainer.innerHTML = profesores.map(profesor => {
            const cursosCount = cursos.filter(c => c.id_profesor === profesor.id_profesor).length;
            return `
                <div class="chart-item">
                    <div class="chart-item-info">
                        <h4>${escapeHtml(profesor.nombre)}</h4>
                        <p>${escapeHtml(profesor.especialidad)}</p>
                    </div>
                    <div class="chart-item-value">
                        <div class="value">${cursosCount}</div>
                        <div class="label">cursos</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Profesores metodos
    async loadProfesores() {
        try {
            const profesores = await profesoresService.getAll();
            this.renderProfesoresTable(profesores);
        } catch (error) {
            handleApiError(error);
        }
    }

    renderProfesoresTable(profesores) {
        const tbody = document.getElementById('profesoresTableBody');
        tbody.innerHTML = profesores.map(profesor => `
            <tr>
                <td>${profesor.id_profesor}</td>
                <td class="name">${escapeHtml(profesor.nombre)}</td>
                <td>${escapeHtml(profesor.especialidad)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="app.editProfesor(${profesor.id_profesor})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="app.deleteProfesor(${profesor.id_profesor})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    filterProfesores(searchTerm) {
        profesoresService.getAll().then(profesores => {
            const filtered = filterData(profesores, searchTerm, ['nombre', 'especialidad']);
            this.renderProfesoresTable(filtered);
        }).catch(handleApiError);
    }

    async editProfesor(id) {
       
    }

    async deleteProfesor(id) {
      
    }

    async handleProfesorSubmit() {
        try {
            const formData = getFormData('profesorForm');
             console.log("data",formData)
            const errors = validateForm(formData, ['nombre', 'especialidad']);
            console.log("errores",errors)
            if (errors.length > 0) {
                showToast(errors.join(', '), 'error');
                return;
            }

            if (this.editingType === 'profesor' && this.editingId) {
                await profesoresService.update(this.editingId, formData);
                showToast('Profesor actualizado exitosamente', 'success');
            } else {
                await profesoresService.create(formData);
                showToast('Profesor creado exitosamente', 'success');
            }

            this.closeModal('profesorModal');
            this.loadProfesores();
            
            // Actualizar el panel si es la sección actual
            if (this.currentSection === 'dashboard') {
                this.loadDashboard();
            }
        } catch (error) {
            handleApiError(error);
        }
    }

    // Estudiantes Metodos
    async loadEstudiantes() {
        try {
            const [estudiantes, inscripciones] = await Promise.all([
                estudiantesService.getAll(),
                inscripcionesService.getAll()
            ]);
            this.renderEstudiantesTable(estudiantes, inscripciones);
        } catch (error) {
            handleApiError(error);
        }
    }

    renderEstudiantesTable(estudiantes, inscripciones) {
        const tbody = document.getElementById('estudiantesTableBody');
        tbody.innerHTML = estudiantes.map(estudiante => {
            const inscripcionesCount = inscripciones.filter(ins => ins.id_estudiante === estudiante.id_estudiante).length;
            return `
                <tr>
                    <td>${estudiante.id_estudiante}</td>
                    <td class="name">${escapeHtml(estudiante.nombre)}</td>
                    <td class="email">
                        <i class="fas fa-envelope"></i>
                        ${escapeHtml(estudiante.email)}
                    </td>
                    <td class="date">
                        <i class="fas fa-calendar"></i>
                        ${formatDate(estudiante.fecha_registro)}
                    </td>
                    <td>
                        <span class="badge success">${inscripcionesCount} cursos</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="app.editEstudiante(${estudiante.id_estudiante})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="app.deleteEstudiante(${estudiante.id_estudiante})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    filterEstudiantes(searchTerm) {
        Promise.all([
            estudiantesService.getAll(),
            inscripcionesService.getAll()
        ]).then(([estudiantes, inscripciones]) => {
            const filtered = filterData(estudiantes, searchTerm, ['nombre', 'email']);
            this.renderEstudiantesTable(filtered, inscripciones);
        }).catch(handleApiError);
    }

    async editEstudiante(id) {
        
    }

    async deleteEstudiante(id) {
       
    }

    async handleEstudianteSubmit() {
        try {
            const formData = getFormData('estudianteForm');
            const errors = validateForm(formData, ['nombre', 'email', 'fecha_registro']);
            
            if (errors.length > 0) {
                showToast(errors.join(', '), 'error');
                return;
            }

            if (this.editingType === 'estudiante' && this.editingId) {
                await estudiantesService.update(this.editingId, formData);
                showToast('Estudiante actualizado exitosamente', 'success');
            } else {
                await estudiantesService.create(formData);
                showToast('Estudiante creado exitosamente', 'success');
            }

            this.closeModal('estudianteModal');
            this.loadEstudiantes();
            
            // Actualizar el panel si es la sección actual
            if (this.currentSection === 'dashboard') {
                this.loadDashboard();
            }
        } catch (error) {
            handleApiError(error);
        }
    }

    // Cursos Metodos
    async loadCursos() {
        try {
            const [cursos, profesores, inscripciones] = await Promise.all([
                cursosService.getAll(),
                profesoresService.getAll(),
                inscripcionesService.getAll()
            ]);
            this.renderCursosTable(cursos, profesores, inscripciones);
            this.populateProfesoresSelect();
        } catch (error) {
            handleApiError(error);
        }
    }

    renderCursosTable(cursos, profesores, inscripciones) {
        const tbody = document.getElementById('cursosTableBody');
        tbody.innerHTML = cursos.map(curso => {
            const profesor = profesores.find(p => p.id_profesor === curso.id_profesor);
            const estudiantesCount = inscripciones.filter(ins => ins.id_curso === curso.id_curso).length;
            return `
                <tr>
                    <td>${curso.id_curso}</td>
                    <td>
                        <div class="flex items-center">
                            <i class="fas fa-book" style="margin-right: 0.5rem; color: #f59e0b;"></i>
                            <span class="name">${escapeHtml(curso.nombre_curso)}</span>
                        </div>
                    </td>
                    <td>
                        <div class="flex items-center">
                            <i class="fas fa-user" style="margin-right: 0.5rem;"></i>
                            ${profesor ? escapeHtml(profesor.nombre) : 'Sin profesor asignado'}
                        </div>
                    </td>
                    <td>
                        <span class="badge warning">${estudiantesCount} estudiantes</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="app.editCurso(${curso.id_curso})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="app.deleteCurso(${curso.id_curso})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async populateProfesoresSelect() {
        try {
            const profesores = await profesoresService.getAll();
            const select = document.getElementById('cursoProfesor');
            select.innerHTML = '<option value="">Seleccionar profesor</option>' +
                profesores.map(profesor => 
                    `<option value="${profesor.id_profesor}">${escapeHtml(profesor.nombre)} - ${escapeHtml(profesor.especialidad)}</option>`
                ).join('');
        } catch (error) {
            handleApiError(error);
        }
    }

    filterCursos(searchTerm) {
        Promise.all([
            cursosService.getAll(),
            profesoresService.getAll(),
            inscripcionesService.getAll()
        ]).then(([cursos, profesores, inscripciones]) => {
            const cursosConProfesor = cursos.map(curso => {
                const profesor = profesores.find(p => p.id_profesor === curso.id_profesor);
                return { ...curso, profesor_nombre: profesor?.nombre || '' };
            });
            const filtered = filterData(cursosConProfesor, searchTerm, ['nombre_curso', 'profesor_nombre']);
            this.renderCursosTable(filtered, profesores, inscripciones);
        }).catch(handleApiError);
    }

    async editCurso(id) {
       
    }

    async deleteCurso(id) {
      
    }

    async handleCursoSubmit() {
        try {
            const formData = getFormData('cursoForm');
            const errors = validateForm(formData, ['nombre_curso', 'id_profesor']);
            
            if (errors.length > 0) {
                showToast(errors.join(', '), 'error');
                return;
            }

            if (this.editingType === 'curso' && this.editingId) {
                await cursosService.update(this.editingId, formData);
                showToast('Curso actualizado exitosamente', 'success');
            } else {
                await cursosService.create(formData);
                showToast('Curso creado exitosamente', 'success');
            }

            this.closeModal('cursoModal');
            this.loadCursos();
            
            // Actualizar el panel si es la sección actual
            if (this.currentSection === 'dashboard') {
                this.loadDashboard();
            }
        } catch (error) {
            handleApiError(error);
        }
    }

    // Inscripciones Metodos
    async loadInscripciones() {
        try {
            const [inscripciones, estudiantes, cursos, profesores] = await Promise.all([
                inscripcionesService.getAll(),
                estudiantesService.getAll(),
                cursosService.getAll(),
                profesoresService.getAll()
            ]);
            this.renderInscripcionesTable(inscripciones, estudiantes, cursos, profesores);
            this.populateEstudiantesSelect();
            this.populateCursosSelect();
        } catch (error) {
            handleApiError(error);
        }
    }

    renderInscripcionesTable(inscripciones, estudiantes, cursos, profesores) {
        const tbody = document.getElementById('inscripcionesTableBody');
        tbody.innerHTML = inscripciones.map(inscripcion => {
            const estudiante = estudiantes.find(e => e.id_estudiante === inscripcion.id_estudiante);
            const curso = cursos.find(c => c.id_curso === inscripcion.id_curso);
            const profesor = profesores.find(p => p.id_profesor === curso?.id_profesor);
            
            return `
                <tr>
                    <td>${inscripcion.id_inscripcion}</td>
                    <td>
                        <div class="flex items-center">
                            <i class="fas fa-user-graduate" style="margin-right: 0.5rem; color: #8b5cf6;"></i>
                            <span class="name">${estudiante ? escapeHtml(estudiante.nombre) : 'Estudiante no encontrado'}</span>
                        </div>
                    </td>
                    <td>
                        <div class="flex items-center">
                            <i class="fas fa-book" style="margin-right: 0.5rem; color: #f59e0b;"></i>
                            ${curso ? escapeHtml(curso.nombre_curso) : 'Curso no encontrado'}
                        </div>
                    </td>
                    <td>${profesor ? escapeHtml(profesor.nombre) : 'Sin profesor'}</td>
                    <td class="date">
                        <i class="fas fa-calendar"></i>
                        ${formatDate(inscripcion.fecha_inscripcion)}
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="app.editInscripcion(${inscripcion.id_inscripcion})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="app.deleteInscripcion(${inscripcion.id_inscripcion})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async populateEstudiantesSelect() {
        try {
            const estudiantes = await estudiantesService.getAll();
            const select = document.getElementById('inscripcionEstudiante');
            select.innerHTML = '<option value="">Seleccionar estudiante</option>' +
                estudiantes.map(estudiante => 
                    `<option value="${estudiante.id_estudiante}">${escapeHtml(estudiante.nombre)} - ${escapeHtml(estudiante.email)}</option>`
                ).join('');
        } catch (error) {
            handleApiError(error);
        }
    }

    async populateCursosSelect() {
        try {
            const [cursos, profesores] = await Promise.all([
                cursosService.getAll(),
                profesoresService.getAll()
            ]);
            const select = document.getElementById('inscripcionCurso');
            select.innerHTML = '<option value="">Seleccionar curso</option>' +
                cursos.map(curso => {
                    const profesor = profesores.find(p => p.id_profesor === curso.id_profesor);
                    return `<option value="${curso.id_curso}">${escapeHtml(curso.nombre_curso)} - ${profesor ? escapeHtml(profesor.nombre) : 'Sin profesor'}</option>`;
                }).join('');
        } catch (error) {
            handleApiError(error);
        }
    }

    filterInscripciones(searchTerm) {
        Promise.all([
            inscripcionesService.getAll(),
            estudiantesService.getAll(),
            cursosService.getAll(),
            profesoresService.getAll()
        ]).then(([inscripciones, estudiantes, cursos, profesores]) => {
            const inscripcionesConDetalles = inscripciones.map(inscripcion => {
                const estudiante = estudiantes.find(e => e.id_estudiante === inscripcion.id_estudiante);
                const curso = cursos.find(c => c.id_curso === inscripcion.id_curso);
                return {
                    ...inscripcion,
                    estudiante_nombre: estudiante?.nombre || '',
                    curso_nombre: curso?.nombre_curso || ''
                };
            });
            const filtered = filterData(inscripcionesConDetalles, searchTerm, ['estudiante_nombre', 'curso_nombre']);
            this.renderInscripcionesTable(filtered, estudiantes, cursos, profesores);
        }).catch(handleApiError);
    }

    async editInscripcion(id) {
       
    }

    async deleteInscripcion(id) {
       
    }

    async handleInscripcionSubmit() {
        try {
            const formData = getFormData('inscripcionForm');
            const errors = validateForm(formData, ['id_estudiante', 'id_curso', 'fecha_inscripcion']);
            
            if (errors.length > 0) {
                showToast(errors.join(', '), 'error');
                return;
            }

            if (this.editingType === 'inscripcion' && this.editingId) {
                await inscripcionesService.update(this.editingId, formData);
                showToast('Inscripción actualizada exitosamente', 'success');
            } else {
                await inscripcionesService.create(formData);
                showToast('Inscripción creada exitosamente', 'success');
            }

            this.closeModal('inscripcionModal');
            this.loadInscripciones();
            
            // Actualizar el panel si es la sección actual
            if (this.currentSection === 'dashboard') {
                this.loadDashboard();
            }
        } catch (error) {
            handleApiError(error);
        }
    }

    // Modal Metodos
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            
            // Establecer fecha predeterminada para nuevos registros
            if (!this.editingId) {
                const today = new Date().toISOString().split('T')[0];
                if (modalId === 'estudianteModal') {
                    document.getElementById('estudianteFechaRegistro').value = today;
                } else if (modalId === 'inscripcionModal') {
                    document.getElementById('inscripcionFecha').value = today;
                }
            }
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            clearForm(modalId.replace('Modal', 'Form'));
            this.editingId = null;
            this.editingType = null;
        }
    }
}

// Funciones globales para controladores onclick
function openModal(modalId) {
    app.openModal(modalId);
}

function closeModal(modalId) {
    app.closeModal(modalId);
}

// Inicializar aplicación
const app = new SistemaEducativo();

// Hacer que la aplicación esté disponible globalmente para depuración
window.app = app;