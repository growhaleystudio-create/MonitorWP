const fs = require('fs');

function getWebpSize(filepath) {
  const buf = fs.readFileSync(filepath);
  
  // Basic validation of WEBP RIFF header
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
    console.log('Not a valid WEBP file.');
    return;
  }

  const type = buf.toString('ascii', 12, 16);
  console.log('WEBP Type:', type);

  if (type === 'VP8 ') {
    // Lossy WebP
    const width = buf.readUInt16LE(26) & 0x3fff;
    const height = buf.readUInt16LE(28) & 0x3fff;
    console.log(`Dimensions: ${width}x${height}`);
  } else if (type === 'VP8L') {
    // Lossless WebP
    const n = buf.readUInt32LE(21);
    const width = (n & 0x3fff) + 1;
    const height = ((n >> 14) & 0x3fff) + 1;
    console.log(`Dimensions: ${width}x${height}`);
  } else if (type === 'VP8X') {
    // Extended WebP
    const width = (buf.readUIntLE(24, 3)) + 1;
    const height = (buf.readUIntLE(27, 3)) + 1;
    console.log(`Dimensions: ${width}x${height}`);
  } else {
    console.log('Unknown WEBP sub-type.');
  }
}

getWebpSize('frontend/src/assets/ddo-zvzo.webp');
