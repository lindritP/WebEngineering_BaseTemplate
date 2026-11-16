const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

// In development and in Docker the web app and the API share one origin, so
// paths stay relative. A build with VITE_API_BASE_URL calls the API on another
// origin instead, which is when CORS starts to matter.
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
