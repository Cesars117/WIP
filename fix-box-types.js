require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBoxTypes() {
  try {
    // Find items with unitsPerBox but no unitType set
    const items = await prisma.item.findMany({
      where: {
        OR: [
          { 
            AND: [
              { unitsPerBox: { not: null } },
              { unitType: null }
            ]
          },
          {
            AND: [
              { unitsPerBox: { not: null } },
              { unitType: { not: 'BOX' } }
            ]
          }
        ]
      }
    });

    console.log(`Found ${items.length} items that need fixing:`);
    
    for (const item of items) {
      console.log(`- ${item.name}: quantity=${item.quantity}, unitsPerBox=${item.unitsPerBox}, unitType=${item.unitType}`);
    }

    if (items.length > 0) {
      // Update items to have BOX type
      const updateResult = await prisma.item.updateMany({
        where: {
          AND: [
            { unitsPerBox: { not: null } },
            { OR: [
              { unitType: null },
              { unitType: { not: 'BOX' } }
            ]}
          ]
        },
        data: {
          unitType: 'BOX'
        }
      });
      
      console.log(`Updated ${updateResult.count} items to BOX type`);
    }

    // Show drywall screw specifically
    const drywall = await prisma.item.findFirst({
      where: {
        name: {
          contains: 'drywall',
          mode: 'insensitive'
        }
      }
    });
    
    if (drywall) {
      console.log('\nDrywall screw data:');
      console.log({
        name: drywall.name,
        quantity: drywall.quantity,
        unitType: drywall.unitType,
        unitsPerBox: drywall.unitsPerBox,
        totalUnits: drywall.totalUnits
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBoxTypes();