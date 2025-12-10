// server.js
// ÚLTIMA MODIFICACION: 10/12/2025
// DESCRIPCIÓN: Servidor local de desarrollo.
// Importamos la misma app que usa Vercel para asegurar consistencia.

import app from './api/index.js';

const port = 3001;

app.listen(port, () => {
    console.log(`✅ Servidor de desarrollo (API) corriendo en http://localhost:${port}`);
    console.log(`   - Proxy a Google Sheets: /api/save-resource`);
    console.log(`   - Validación IA: /api/validate`);
    console.log(`   - Metadata IA: /api/metadata`);
});