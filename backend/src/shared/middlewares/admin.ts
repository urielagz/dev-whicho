import { permitirRoles } from "./roles";

// Atajo conservado por legibilidad en las rutas de administración.
export const adminMiddleware = permitirRoles("admin");
