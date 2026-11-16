interface ImportMetaEnv {
  // Origin of the API, for example "http://localhost:3000". Empty or unset:
  // the browser calls /api on its own origin (Vite proxy, nginx).
  readonly VITE_API_BASE_URL?: string;
}
