# CRUD completo para `basedatos`

Proyecto con:
- Node.js
- Express
- REST API
- npm
- HTML + CSS + JavaScript
- MySQL/MariaDB remoto

## Tablas incluidas
- categoria
- clientes
- proveedor
- producto
- ventas
- detalle_venta

## Configuración remota
Copia `.env.example` a `.env` y llena tus datos:

```env
PORT=3127
DB_HOST=tu-host-remoto
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=basedatos
```

## Instalación
En PowerShell usa:

```powershell
npm.cmd install
npm.cmd start
```

## Abrir
`http://localhost:3127`

## Nota
El proyecto está preparado para una base **no local**. Solo depende de que tu servidor MySQL permita conexiones remotas.
