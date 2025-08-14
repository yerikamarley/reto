// API Configuration
const API_CONFIG = {
    // Base URL for your API
    BASE_URL: 'https://umjkxtgyxiogikyecykx.supabase.co/rest/v1',
    
    // API Key for authentication
    API_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtamt4dGd5eGlvZ2lreWVjeWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxOTk1NTcsImV4cCI6MjA3MDc3NTU1N30.5aSplbMw_WJgYdMECIQvBuAWeXlOBVcOXZCpX6YcyQg',
    
    // Authorization token (Bearer token, JWT, etc.)
    AUTH_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtamt4dGd5eGlvZ2lreWVjeWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxOTk1NTcsImV4cCI6MjA3MDc3NTU1N30.5aSplbMw_WJgYdMECIQvBuAWeXlOBVcOXZCpX6YcyQg',
    
    // API Endpoints
    ENDPOINTS: {
        PROFESORES: '/',
        ESTUDIANTES: '/',
        CURSOS: '/',
        INSCRIPCIONES: '/'
    },
    
    // Request timeout in milliseconds
    TIMEOUT: 10000,
    
    // Default headers for all requests
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Environment configuration
const ENV_CONFIG = {
    // Set to true for development mode
    DEBUG: true,
    
    // Mock data when API is not available
    USE_MOCK_DATA: true,
    
    // Auto-refresh interval for dashboard (in milliseconds)
    REFRESH_INTERVAL: 30000
};

// UI Configuration
const UI_CONFIG = {
    // Animation durations
    ANIMATION_DURATION: 300,
    
    // Toast notification duration
    TOAST_DURATION: 3000,
    
    // Items per page for pagination
    ITEMS_PER_PAGE: 10,
    
    // Date format
    DATE_FORMAT: 'DD/MM/YYYY'
};