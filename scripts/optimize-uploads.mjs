import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const uploadsDir = path.resolve('public/uploads');

async function optimizeImages() {
  console.log('Optimizing heavy assets in', uploadsDir);

  const files = [
    { name: 'skill_75.png', max: 160, isPng: true },
    { name: 'skill_81.png', max: 160, isPng: true },
    { name: 'skill_82.png', max: 160, isPng: true },
    { name: 'skill_83.png', max: 160, isPng: true },
    { name: 'skill_84.png', max: 160, isPng: true },
    { name: 'skill_99.png', max: 160, isPng: true },
    { name: 'edu_4_logo.png', max: 160, isPng: true },
    { name: 'about_profile.jpg', max: 800, isJpeg: true },
    { name: 'media_1789117259295_3cc3ea8e.png', max: 640, isPng: true }
  ];

  for (const item of files) {
    const filePath = path.join(uploadsDir, item.name);
    if (!fs.existsSync(filePath)) {
      console.log('File not found:', item.name);
      continue;
    }

    const origSize = fs.statSync(filePath).size;
    const tempPath = filePath + '.tmp';

    let transformer = sharp(filePath).resize({
      width: item.max,
      height: item.max,
      fit: 'inside',
      withoutEnlargement: true
    });

    if (item.isPng) {
      transformer = transformer.png({ compressionLevel: 9, quality: 85, effort: 8 });
    } else if (item.isJpeg) {
      transformer = transformer.jpeg({ quality: 82, mozjpeg: true });
    }

    await transformer.toFile(tempPath);
    const newSize = fs.statSync(tempPath).size;

    fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);

    const savedKb = ((origSize - newSize) / 1024).toFixed(1);
    const percent = (((origSize - newSize) / origSize) * 100).toFixed(1);
    console.log(`[OPTIMIZED] ${item.name}: ${(origSize/1024).toFixed(1)} KB -> ${(newSize/1024).toFixed(1)} KB (Saved ${savedKb} KB / ${percent}%)`);
  }
}

optimizeImages();
