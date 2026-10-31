-- Consulta de lectura para ejecutar en la base femfitai con acceso autorizado.
-- No muestra hashes ni cambia cuentas o roles.
SELECT "IdUsuario", "Nombres", "Apellidos", "Correo", "Rol", "Estado"
FROM public."Usuarios"
WHERE upper(trim("Rol")) = 'PROGRAMADOR'
  AND "Estado" = true
ORDER BY "IdUsuario";
