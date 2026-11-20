export function formatearFecha(fecha?: string | null): string {
  if (!fecha) return "";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("es-MX", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
}

export function formatearFechaLarga(fecha?: string | null): string {
  if (!fecha) return "";
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString("es-MX");
}

/** Valor para <input type="datetime-local"> en hora local. */
export function fechaParaInput(fecha?: string | null): string {
  if (!fecha) return "";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function truncar(texto: string | null | undefined, max = 70): string {
  if (!texto) return "";
  return texto.length > max ? `${texto.slice(0, max).trim()}…` : texto;
}

export function nombreCompleto(p: { nombre?: string; apellido?: string | null }): string {
  return `${p.nombre ?? ""} ${p.apellido ?? ""}`.trim();
}

export function iniciales(p: { nombre?: string; apellido?: string | null }): string {
  return `${p.nombre?.[0] ?? "?"}${p.apellido?.[0] ?? ""}`.toUpperCase();
}

export function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const CATEGORIAS: Array<{ etiqueta: string; clase: string; ext: string[] }> = [
  { etiqueta: "PDF", clase: "pdf", ext: ["pdf"] },
  { etiqueta: "DOC", clase: "doc", ext: ["doc", "docx", "docm", "dot", "dotx", "dotm", "txt", "rtf", "odt", "wps", "pages", "tex", "md", "epub", "mobi", "azw", "azw3", "fb2", "djvu", "xps", "oxps", "ps", "ini", "cfg", "log"] },
  { etiqueta: "XLS", clase: "xls", ext: ["xls", "xlsx", "csv", "tsv", "ods"] },
  { etiqueta: "PPT", clase: "ppt", ext: ["ppt", "pptx", "odp", "key"] },
  { etiqueta: "IMG", clase: "img", ext: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"] },
  { etiqueta: "VIDEO", clase: "video", ext: ["mp4", "avi", "mov", "wmv", "mkv", "webm"] },
  { etiqueta: "AUDIO", clase: "audio", ext: ["mp3", "wav", "ogg", "m4a", "aac"] },
  { etiqueta: "ZIP", clase: "zip", ext: ["zip", "rar", "7z", "tar", "gz"] },
  { etiqueta: "CODE", clase: "codigo", ext: ["java", "py", "cpp", "c", "cs", "js", "ts", "php", "sql", "json", "xml", "yaml", "yml", "html", "htm", "mht", "mhtml", "css"] },
  { etiqueta: "DSN", clase: "diseno", ext: ["psd", "ai", "fig", "xd", "indd"] },
  { etiqueta: "3D", clase: "3d", ext: ["stl", "obj", "fbx"] },
];

/** Solo para la etiqueta visual; la validación real la hace el backend. */
export function categoriaArchivo(nombre: string): { etiqueta: string; clase: string } {
  const ext = (nombre.split(".").pop() ?? "").toLowerCase();
  return CATEGORIAS.find(c => c.ext.includes(ext)) ?? { etiqueta: "FILE", clase: "otro" };
}
