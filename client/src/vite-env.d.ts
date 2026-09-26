/// <reference types="vite/client" />

/** Types for the environment variables we read with import.meta.env. */
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}