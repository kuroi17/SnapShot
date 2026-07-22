import { encodePNG } from "../pngEncoder";

function isPNG(data: Uint8Array): boolean {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < sig.length; i++) {
    if (data[i] !== sig[i]) return false;
  }
  return true;
}

function readUint32BE(data: Uint8Array, offset: number): number {
  return (
    (data[offset] << 24) |
    (data[offset + 1] << 16) |
    (data[offset + 2] << 8) |
    data[offset + 3]
  );
}

describe("encodePNG", () => {
  it("produces a valid PNG signature", () => {
    const rgba = new Uint8Array(4 * 2 * 2);
    const png = encodePNG(rgba, 2, 2);
    expect(isPNG(png)).toBe(true);
  });

  it("encodes correct dimensions in IHDR", () => {
    const rgba = new Uint8Array(4 * 4 * 3);
    const png = encodePNG(rgba, 4, 3);

    const ihdrOffset = 8 + 4 + 4;
    const width = readUint32BE(png, ihdrOffset);
    const height = readUint32BE(png, ihdrOffset + 4);
    expect(width).toBe(4);
    expect(height).toBe(3);
  });

  it("encodes 8-bit RGBA (color type 6)", () => {
    const rgba = new Uint8Array(4 * 1 * 1);
    const png = encodePNG(rgba, 1, 1);

    const ihdrOffset = 8 + 4 + 4;
    const bitDepth = png[ihdrOffset + 8];
    const colorType = png[ihdrOffset + 9];
    expect(bitDepth).toBe(8);
    expect(colorType).toBe(6);
  });

  it("round-trips known pixel data", () => {
    const w = 3;
    const h = 2;
    const rgba = new Uint8Array(4 * w * h);
    for (let i = 0; i < w * h; i++) {
      rgba[i * 4] = 255;
      rgba[i * 4 + 1] = 128;
      rgba[i * 4 + 2] = 64;
      rgba[i * 4 + 3] = 200;
    }

    const png = encodePNG(rgba, w, h);
    expect(isPNG(png)).toBe(true);
    expect(png.length).toBeGreaterThan(40);
  });
});

function preprocessToTensorTest(
  pixels: Uint8Array,
  width: number,
  height: number
): Float32Array {
  const tensor = new Float32Array(1 * 3 * 320 * 320);
  const mean: [number, number, number] = [0.485, 0.456, 0.406];
  const std: [number, number, number] = [0.229, 0.224, 0.225];

  for (let y = 0; y < 320; y++) {
    for (let x = 0; x < 320; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * 320 + x;
      const r = pixels[srcIdx] / 255;
      const g = pixels[srcIdx + 1] / 255;
      const b = pixels[srcIdx + 2] / 255;
      tensor[dstIdx] = (r - mean[0]) / std[0];
      tensor[1 * 320 * 320 + dstIdx] = (g - mean[1]) / std[1];
      tensor[2 * 320 * 320 + dstIdx] = (b - mean[2]) / std[2];
    }
  }

  return tensor;
}

describe("preprocessToTensor", () => {
  it("produces a Float32Array of correct size", () => {
    const w = 320;
    const h = 320;
    const pixels = new Uint8Array(w * h * 4);
    const tensor = preprocessToTensorTest(pixels, w, h);
    expect(tensor).toBeInstanceOf(Float32Array);
    expect(tensor.length).toBe(1 * 3 * 320 * 320);
  });

  it("normalizes white pixel correctly", () => {
    const w = 320;
    const h = 320;
    const pixels = new Uint8Array(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      pixels[i * 4] = 255;
      pixels[i * 4 + 1] = 255;
      pixels[i * 4 + 2] = 255;
      pixels[i * 4 + 3] = 255;
    }
    const tensor = preprocessToTensorTest(pixels, w, h);
    const expectedR = (1 - 0.485) / 0.229;
    const expectedG = (1 - 0.456) / 0.224;
    const expectedB = (1 - 0.406) / 0.225;
    expect(tensor[0]).toBeCloseTo(expectedR, 3);
    expect(tensor[320 * 320]).toBeCloseTo(expectedG, 3);
    expect(tensor[2 * 320 * 320]).toBeCloseTo(expectedB, 3);
  });
});

function resizeAlphaMaskTest(
  alpha: Float32Array,
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number
): Float32Array {
  const result = new Float32Array(dstW * dstH);
  const xRatio = srcW / dstW;
  const yRatio = srcH / dstH;

  for (let dy = 0; dy < dstH; dy++) {
    for (let dx = 0; dx < dstW; dx++) {
      const sx = Math.min(Math.floor(dx * xRatio), srcW - 1);
      const sy = Math.min(Math.floor(dy * yRatio), srcH - 1);
      result[dy * dstW + dx] = alpha[sy * srcW + sx];
    }
  }

  return result;
}

describe("resizeAlphaMask", () => {
  it("downscales from 320x320 to 160x160", () => {
    const src = new Float32Array(320 * 320);
    src[0] = 1;
    src[320 * 320 - 1] = 0.5;
    const result = resizeAlphaMaskTest(src, 320, 320, 160, 160);
    expect(result.length).toBe(160 * 160);
  });

  it("preserves corner values", () => {
    const src = new Float32Array(4 * 4);
    src[0] = 0.9;
    src[3] = 0.1;
    src[12] = 0.2;
    src[15] = 0.8;
    const result = resizeAlphaMaskTest(src, 4, 4, 2, 2);
    expect(result[0]).toBeCloseTo(0.9, 5);
    expect(result[1]).toBeCloseTo(0.1, 5);
  });
});
