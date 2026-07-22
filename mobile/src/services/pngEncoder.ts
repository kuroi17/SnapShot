function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const lenBytes = new Uint8Array(4);
  const dv = new DataView(lenBytes.buffer);
  dv.setUint32(0, data.length);

  const crcInput = new Uint8Array(typeBytes.length + data.length);
  crcInput.set(typeBytes);
  crcInput.set(data, typeBytes.length);
  const crcVal = crc32(crcInput);
  const crcBytes = new Uint8Array(4);
  const cdv = new DataView(crcBytes.buffer);
  cdv.setUint32(0, crcVal);

  const chunk = new Uint8Array(4 + 4 + data.length + 4);
  chunk.set(lenBytes, 0);
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);
  chunk.set(crcBytes, 8 + data.length);
  return chunk;
}

function deflateUncompressed(data: Uint8Array): Uint8Array {
  const blockHeader = new Uint8Array(5);
  const dv = new DataView(blockHeader.buffer);
  dv.setUint8(0, 0x01);
  dv.setUint16(1, data.length, true);
  dv.setUint16(3, ~data.length & 0xffff, true);

  const result = new Uint8Array(2 + blockHeader.length + data.length);
  const adv = new DataView(result.buffer);
  adv.setUint16(0, 0x78da, false);
  result.set(blockHeader, 2);
  result.set(data, 2 + blockHeader.length);
  return result;
}

export function encodePNG(
  rgba: Uint8Array,
  width: number,
  height: number
): Uint8Array {
  const signature = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  const ihdrData = new Uint8Array(13);
  const dv = new DataView(ihdrData.buffer);
  dv.setUint32(0, width);
  dv.setUint32(4, height);
  dv.setUint8(8, 8);
  dv.setUint8(9, 6);
  dv.setUint8(10, 0);
  dv.setUint8(11, 0);
  dv.setUint8(12, 0);
  const ihdr = pngChunk("IHDR", ihdrData);

  const raw = new Uint8Array(width * 4 * height + height);
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0;
    for (let x = 0; x < width * 4; x++) {
      raw[offset++] = rgba[y * width * 4 + x];
    }
  }
  const compressed = deflateUncompressed(raw);
  const idat = pngChunk("IDAT", compressed);
  const iend = pngChunk("IEND", new Uint8Array(0));

  const result = new Uint8Array(
    signature.length + ihdr.length + idat.length + iend.length
  );
  result.set(signature, 0);
  result.set(ihdr, signature.length);
  result.set(idat, signature.length + ihdr.length);
  result.set(iend, signature.length + ihdr.length + idat.length);
  return result;
}
