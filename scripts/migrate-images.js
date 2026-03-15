const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const supabase = createClient(
  'https://jgefcxlxalngakklgjtx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZWZjeGx4YWxuZ2Fra2xnanR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM1MzMzNiwiZXhwIjoyMDg4OTI5MzM2fQ.3jcaaD70XR5DnBlrIw0-_2-gEQNJWDAINQmCB-LH13c'
);

const BUCKET = 'car-images';
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

function getMime(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const map = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
  return map[ext] || 'image/jpeg';
}

async function run() {
  const cars = await prisma.car.findMany({ select: { id: true, make: true, model: true, images: true } });

  for (const car of cars) {
    const images = JSON.parse(car.images);
    const hasLocal = images.some(img => img.startsWith('/uploads/'));

    if (!hasLocal) {
      console.log('SKIP', car.make, car.model, '(already migrated)');
      continue;
    }

    console.log('\nMigrating', car.make, car.model, '(' + images.length + ' images)...');
    const newUrls = [];

    for (const imgPath of images) {
      // Already a Supabase URL — keep it
      if (!imgPath.startsWith('/uploads/')) {
        newUrls.push(imgPath);
        continue;
      }

      const filename = imgPath.replace('/uploads/', '');
      const filePath = path.join(uploadsDir, filename);

      if (!fs.existsSync(filePath)) {
        console.log('  MISSING (skipping):', filename);
        continue;
      }

      const buffer = fs.readFileSync(filePath);

      const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
        contentType: getMime(filename),
        upsert: true,
      });

      if (error) {
        console.log('  ERROR:', filename, '-', error.message);
        continue;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      newUrls.push(data.publicUrl);
      console.log('  uploaded:', filename);
    }

    await prisma.car.update({ where: { id: car.id }, data: { images: JSON.stringify(newUrls) } });
    console.log('  DB updated -', newUrls.length, 'Supabase URLs saved');
  }

  console.log('\nMigration complete.');
  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});
