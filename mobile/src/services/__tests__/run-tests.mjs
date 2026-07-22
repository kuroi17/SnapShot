import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { encodePNG } = require("../pngEncoder.ts");

function isPNG(data) {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < sig.length; i++) if (data[i] !== sig[i]) return false;
  return true;
}

function readUint32BE(data, offset) {
  return (
    (data[offset] << 24) |
    (data[offset + 1] << 16) |
    (data[offset + 2] << 8) |
    data[offset + 3]
  );
}

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}`);
  }
}

// --- encodePNG tests ---
console.log("\nencodePNG:");

{
  const rgba = new Uint8Array(4 * 2 * 2);
  const png = encodePNG(rgba, 2, 2);
  assert(isPNG(png), "produces valid PNG signature");
}

{
  const rgba = new Uint8Array(4 * 4 * 3);
  const png = encodePNG(rgba, 4, 3);
  const ihdrOff = 8 + 4 + 4;
  assert(readUint32BE(png, ihdrOff) === 4, "width = 4");
  assert(readUint32BE(png, ihdrOff + 4) === 3, "height = 3");
}

{
  const rgba = new Uint8Array(4 * 1 * 1);
  const png = encodePNG(rgba, 1, 1);
  const ihdrOff = 8 + 4 + 4;
  assert(png[ihdrOff + 8] === 8, "bit depth = 8");
  assert(png[ihdrOff + 9] === 6, "color type = 6 (RGBA)");
}

{
  const w = 3, h = 2;
  const rgba = new Uint8Array(4 * w * h);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = 255;
    rgba[i * 4 + 1] = 128;
    rgba[i * 4 + 2] = 64;
    rgba[i * 4 + 3] = 200;
  }
  const png = encodePNG(rgba, w, h);
  assert(isPNG(png), "valid PNG");
  assert(png.length > 40, "file size > 40 bytes");
}

// --- preprocessToTensor tests ---
console.log("\npreprocessToTensor:");

function preprocessToTensor(pixels, width, height) {
  const tensor = new Float32Array(1 * 3 * 320 * 320);
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];
  for (let y = 0; y < 320; y++) {
    for (let x = 0; x < 320; x++) {
      const si = (y * width + x) * 4;
      const di = y * 320 + x;
      const r = pixels[si] / 255, g = pixels[si + 1] / 255, b = pixels[si + 2] / 255;
      tensor[di] = (r - mean[0]) / std[0];
      tensor[1 * 320 * 320 + di] = (g - mean[1]) / std[1];
      tensor[2 * 320 * 320 + di] = (b - mean[2]) / std[2];
    }
  }
  return tensor;
}

{
  const w = 320, h = 320;
  const pixels = new Uint8Array(w * h * 4);
  const tensor = preprocessToTensor(pixels, w, h);
  assert(tensor instanceof Float32Array, "returns Float32Array");
  assert(tensor.length === 1 * 3 * 320 * 320, "correct tensor size");
}

{
  const w = 320, h = 320;
  const pixels = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    pixels[i * 4] = 255;
    pixels[i * 4 + 1] = 255;
    pixels[i * 4 + 2] = 255;
    pixels[i * 4 + 3] = 255;
  }
  const tensor = preprocessToTensor(pixels, w, h);
  const eR = (1 - 0.485) / 0.229;
  const eG = (1 - 0.456) / 0.224;
  const eB = (1 - 0.406) / 0.225;
  assert(Math.abs(tensor[0] - eR) < 0.001, "normalizes red channel");
  assert(Math.abs(tensor[320 * 320] - eG) < 0.001, "normalizes green channel");
  assert(Math.abs(tensor[2 * 320 * 320] - eB) < 0.001, "normalizes blue channel");
}

// --- resizeAlphaMask tests ---
console.log("\nresizeAlphaMask:");

function resizeAlphaMask(alpha, srcW, srcH, dstW, dstH) {
  const result = new Float32Array(dstW * dstH);
  const xR = srcW / dstW, yR = srcH / dstH;
  for (let dy = 0; dy < dstH; dy++) {
    for (let dx = 0; dx < dstW; dx++) {
      const sx = Math.min(Math.floor(dx * xR), srcW - 1);
      const sy = Math.min(Math.floor(dy * yR), srcH - 1);
      result[dy * dstW + dx] = alpha[sy * srcW + sx];
    }
  }
  return result;
}

{
  const src = new Float32Array(320 * 320);
  src[0] = 1;
  src[320 * 320 - 1] = 0.5;
  const r = resizeAlphaMask(src, 320, 320, 160, 160);
  assert(r.length === 160 * 160, "downscales to correct size");
}

{
  const src = new Float32Array(4 * 4);
  src[0] = 0.9; src[2] = 0.1; src[8] = 0.2; src[10] = 0.8;
  const r = resizeAlphaMask(src, 4, 4, 2, 2);
  assert(Math.abs(r[0] - 0.9) < 0.00001, "preserves top-left corner");
  assert(Math.abs(r[1] - 0.1) < 0.00001, "preserves top-right corner");
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
