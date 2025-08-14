// API Service Class
class ApiService {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.apiKey = API_CONFIG.API_KEY;
        this.authToken = API_CONFIG.AUTH_TOKEN;
        this.timeout = API_CONFIG.TIMEOUT;
    }

    // Obtener encabezados predeterminados con autenticación
    getHeaders() {
        return {
            ...API_CONFIG.DEFAULT_HEADERS,
            'apikey': this.apiKey,
            'Authorization': `Bearer ${this.authToken}`
        };
    }

    // Método de solicitud HTTP genérico
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        // Agregar tiempo de espera
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        config.signal = controller.signal;

        try {
            showLoading();
            
            if (ENV_CONFIG.DEBUG) {
                console.log(`API Request: ${options.method || 'GET' || 'POS' || 'PUT' || 'DELETE'} ${url}`, config);
            }

            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (ENV_CONFIG.DEBUG) {
                console.log('API Response:', data);
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            console.error('API Error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    }

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
         return this.request(endpoint, { method: 'DELETE' });
    }
}


// Cursos API Service
class CursosService extends ApiService {
    constructor() {
        super();
        this.endpoint = API_CONFIG.ENDPOINTS.CURSOS;
    }

    async getAll() {
    
       return this.get(this.endpoint+'cursos');

    }

    async getById(id) {
            return this.get(this.endpoint+'/'+id);

    }

    async create(curso) {
       return this.post(this.endpoint, curso);
    }

    async update(id, curso) {
        return this.update(this.endpoint+''+id, curso);
    }

    async delete(id) {
    console.log('${this.endpoint}?id_curso=eq.${id}')
    return super.delete('${this.endpoint}?id_curso=eq.${id}');
    }
}

class EstudiantesService extends ApiService {
    constructor() {
        super();
        this.endpoint = API_CONFIG.ENDPOINTS.ESTUDIANTES;
    }

    async getAll() {
       return this.get(this.endpoint);

    }

    async getById(id) {
            return this.get('${this.endpoint}/${id}');

    }

    async create(estudiante) {
       return this.post(this.endpoint, estudiante);
    }

    async update(id, estudiante) {
        return this.update('${this.endpoint}/${id}', estudiante);
    }

    async delete(id) {
       console.log('${this.endpoint}?id_estudiante=eq.${id}')
    return super.delete('${this.endpoint}?id_estudiante=eq.${id}');
    }
}

class ProfesoresService extends ApiService {
    constructor() {
        super();
        this.endpoint = API_CONFIG.ENDPOINTS.PROFESORES;
    }

    async getAll() {
       return this.get(this.endpoint);

    }

    async getById(id) {
            return this.get('${this.endpoint}/${id}');

    }

    async create(profesores) {
       return this.post(this.endpoint, profesores);
    }

    async update(id, profesores) {
        return this.update('${this.endpoint}/${id}', profesores);
    }

    async delete(id) {
       console.log('${this.endpoint}?id_profesores=eq.${id}')
    return super.delete('${this.endpoint}?id_profesores=eq.${id}');
    }
}

class InscripcionesService extends ApiService {
    constructor() {
        super();
        this.endpoint = API_CONFIG.ENDPOINTS.INSCRIPCIONES;
    }

    async getAll() {
       return this.get(this.endpoint);

    }

    async getById(id) {
            return this.get('${this.endpoint}/${id}');

    }

    async create(inscripciones) {
       return this.post(this.endpoint, inscripciones);
    }

    async update(id, inscripciones) {
        return this.update('${this.endpoint}/${id}', inscripciones);
    }

    async delete(id) {
       console.log('${this.endpoint}?id_inscripciones=eq.${id}')
    return super.delete('${this.endpoint}?id_inscripciones=eq.${id}');
    }
}


// Initialize services
const cursosService = new CursosService();
const estudiantesService = new EstudiantesService();
const profesoresService = new ProfesoresService();
const inscripcionesService = new InscripcionesService();