import db from './lib/db.js';

async function seed() {
    console.log('🌱 Comenzando seed de datos...');

    try {
        // Categorías
        const catCount = await db.category.count();
        if (catCount === 0) {
            console.log('   -> Insertando Categorías...');
            await db.category.createMany({
                data: [
                    { name: 'Herramientas Eléctricas', description: 'Taladros, sierras, etc.' },
                    { name: 'Herramientas Manuales', description: 'Martillos, destornilladores' },
                    { name: 'Conectividad', description: 'Cables, conectores coax, fibra' },
                    { name: 'Consumibles', description: 'Tornillos, cintas, pegamentos' }
                ]
            });
        } else {
            console.log('   -> Categorías ya existen. Saltando.');
        }

        // Ubicaciones
        const locCount = await db.location.count();
        if (locCount === 0) {
            console.log('   -> Insertando Ubicaciones...');
            await db.location.createMany({
                data: [
                    { name: 'Bodega Central', type: 'WAREHOUSE' },
                    { name: 'Camioneta #1', type: 'VEHICLE' },
                    { name: 'Camioneta #2', type: 'VEHICLE' },
                    { name: 'Sitio Alpha', type: 'SITE' }
                ]
            });
        } else {
            console.log('   -> Ubicaciones ya existen. Saltando.');
        }

        console.log('✅ Seed completado con éxito.');
    } catch (error) {
        console.error('❌ Error en seed:', error);
        throw error;
    } finally {
        await db.$disconnect();
    }
}

seed().catch(console.error);