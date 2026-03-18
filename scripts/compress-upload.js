const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const supabase = createClient(
  'https://jgefcxlxalngakklgjtx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZWZjeGx4YWxuZ2Fra2xnanR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM1MzMzNiwiZXhwIjoyMDg4OTI5MzM2fQ.3jcaaD70XR5DnBlrIw0-_2-gEQNJWDAINQmCB-LH13c'
);

const CAR_ID = 'cmmo7gjzp0003mstgsh7ozgq6'; // 2014 Ford F150
const BUCKET = 'car-images';
const sourceDir = path.join(process.cwd(), 'public', 'imageCompressionTest');

async function run() {
  const files = fs.readdirSync(sourceDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  console.log(`Found ${files.length} images\n`);

  const newUrls = [];

  for (const file of files) {
    const inputPath = path.join(sourceDir, file);
    const originalSize = fs.statSync(inputPath).size;

    // Step 1 (browser simulation): resize to 1200px, JPEG 75
    const step1 = await sharp(inputPath)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer();

    // Step 2 (server pass): convert to WebP 68
    const final = await sharp(step1)
      .webp({ quality: 68 })
      .toBuffer();

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

    console.log(`${file}`);
    console.log(`  Original : ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  After step 1 (JPEG 75, 1200px): ${(step1.length / 1024).toFixed(0)} KB`);
    console.log(`  After step 2 (WebP 68): ${(final.length / 1024).toFixed(0)} KB`);

    const { error } = await supabase.storage.from(BUCKET).upload(filename, final, {
      contentType: 'image/webp',
      upsert: false,
    });

    if (error) {
      console.error(`  Upload error: ${error.message}`);
      continue;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    newUrls.push(data.publicUrl);
    console.log(`  Uploaded: ${filename}\n`);
  }

  if (!newUrls.length) {
    console.log('No images uploaded.');
    await prisma.$disconnect();
    return;
  }

  // Replace car images with new compressed versions
  await prisma.car.update({ where: { id: CAR_ID }, data: { images: JSON.stringify(newUrls) } });
  console.log(`Done. 2014 Ford F-150 now has ${newUrls.length} image(s).`);

  await prisma.$disconnect();
}

run().catch(async (e) => { console.error(e); await prisma.$disconnect(); });
