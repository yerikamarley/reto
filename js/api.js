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
                console.log(`API Request: ${options.method || 'GET'} ${url}`, config);
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
       
    }

    async getById(id) {
            
    }

    async create(curso) {
       
    }

    async update(id, curso) {
       
    }

    async delete(id) {
       
    }

}



// Initialize services
const cursosService = new CursosService();
