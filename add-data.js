const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function addData() {
  try {
    console.log('🔄 Agregando categorías...');
    await db.category.createMany({
      data: [
        { name: 'Electric-Tool', description: 'Herramientas eléctricas y equipos con motor' },
        { name: 'Manual-Tool', description: 'Herramientas manuales y de mano' },
        { name: 'Material', description: 'Materiales de construcción y consumibles' }
      ],
      skipDuplicates: true
    });

    console.log('🔄 Agregando ubicaciones...');
    await db.location.createMany({
      data: [
        { name: '8 Floor NRG', type: 'WAREHOUSE', description: 'Piso 8 del edificio NRG' },
        { name: 'Astrodome', type: 'SITE', description: 'Sitio Astrodome' },
        { name: 'Memorial', type: 'SITE', description: 'Sitio Memorial' },
        { name: 'Center NRG', type: 'WAREHOUSE', description: 'Centro del complejo NRG' }
      ],
      skipDuplicates: true
    });

    console.log('✅ Datos agregados exitosamente');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.$disconnect();
  }
}

addData();