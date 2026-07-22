import { useCallback, useReducer, useRef, useEffect } from "react";
import {
  cacheDirectory,
  readAsStringAsync,
  writeAsStringAsync,
  EncodingType,
} from "expo-file-system/legacy";
import { fromByteArray, toByteArray } from "base64-js";
import { encodePNG } from "../services/pngEncoder";

function readUint32BE(data: Uint8Array, offset: number): number {
  return (
    ((data[offset] << 24) |
      (data[offset + 1] << 16) |
      (data[offset + 2] << 8) |
      data[offset + 3]) >>>
    0
  );
}

function concatUint8Arrays(chunks: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const c of chunks) total += c.length;
  const result = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    result.set(c, offset);
    offset += c.length;
  }
  return result;
}

function inflateStored(data: Uint8Array): Uint8Array {
  const pieces: Uint8Array[] = [];
  let pos = 2;
  while (pos < data.length - 4) {
    const header = data[pos];
    const bfinal = header & 1;
    pos++;
    const btype = (header >> 1) & 3;
    if (btype !== 0) {
      throw new Error("Unsupported deflate block type");
    }
    const len = data[pos] | (data[pos + 1] << 8);
    const nlen = data[pos + 2] | (data[pos + 3] << 8);
    pos += 4;
    if ((len & 0xffff) !== (~nlen & 0xffff)) {
      throw new Error("NLEN check failed in deflate block");
    }
    pieces.push(data.slice(pos, pos + len));
    pos += len;
    if (bfinal) break;
  }
  return concatUint8Arrays(pieces);
}

function paethPredictor(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function unfilterPNG(
  data: Uint8Array,
  width: number,
  height: number,
  bytesPerPixel: number
): Uint8Array {
  const stride = width * 4;
  const rgba = new Uint8Array(width * height * 4);
  const rowBytes = 1 + stride;

  for (let y = 0; y < height; y++) {
    const filterType = data[y * rowBytes];
    const row = data.slice(y * rowBytes + 1, (y + 1) * rowBytes);
    const out = y * stride;

    for (let x = 0; x < stride; x++) {
      const raw = row[x];
      let value: number;

      const a = x >= bytesPerPixel ? rgba[out + x - bytesPerPixel] : 0;
      const b = y > 0 ? rgba[(y - 1) * stride + x] : 0;
      const c =
        x >= bytesPerPixel && y > 0
          ? rgba[(y - 1) * stride + x - bytesPerPixel]
          : 0;

      switch (filterType) {
        case 0:
          value = raw;
          break;
        case 1:
          value = raw + a;
          break;
        case 2:
          value = raw + b;
          break;
        case 3:
          value = raw + Math.floor((a + b) / 2);
          break;
        case 4:
          value = raw + paethPredictor(a, b, c);
          break;
        default:
          value = raw;
      }

      rgba[out + x] = value & 0xff;
    }
  }

  return rgba;
}

function decodePNG(
  data: Uint8Array
): { rgba: Uint8Array; width: number; height: number } {
  if (
    data[0] !== 0x89 ||
    data[1] !== 0x50 ||
    data[2] !== 0x4e ||
    data[3] !== 0x47
  ) {
    throw new Error("Not a PNG file");
  }

  let pos = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 8;
  let colorType = 6;
  const idatChunks: Uint8Array[] = [];

  while (pos < data.length) {
    const length = readUint32BE(data, pos);
    const type = String.fromCharCode(
      data[pos + 4],
      data[pos + 5],
      data[pos + 6],
      data[pos + 7]
    );
    const chunkData = data.slice(pos + 8, pos + 8 + length);

    if (type === "IHDR") {
      width = readUint32BE(chunkData, 0);
      height = readUint32BE(chunkData, 4);
      bitDepth = chunkData[8];
      colorType = chunkData[9];
    } else if (type === "IDAT") {
      idatChunks.push(chunkData);
    } else if (type === "IEND") {
      break;
    }

    pos += 12 + length;
  }

  const idatData = concatUint8Arrays(idatChunks);
  const rawData = inflateStored(idatData);

  const bytesPerPixel = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const rgba = unfilterPNG(rawData, width, height, bytesPerPixel);

  return { rgba, width, height };
}

function applyCircleToAlpha(
  rgba: Uint8Array,
  width: number,
  height: number,
  cx: number,
  cy: number,
  radius: number,
  mode: "restore" | "remove"
): void {
  const r2 = radius * radius;
  const minX = Math.max(0, Math.floor(cx - radius));
  const maxX = Math.min(width - 1, Math.ceil(cx + radius));
  const minY = Math.max(0, Math.floor(cy - radius));
  const maxY = Math.min(height - 1, Math.ceil(cy + radius));

  const alphaVal = mode === "restore" ? 255 : 0;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        rgba[(y * width + x) * 4 + 3] = alphaVal;
      }
    }
  }
}

type HistoryEntry = {
  alpha: Uint8Array;
  uri: string;
};

interface BrushState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  current: HistoryEntry;
  originalUri: string;
}

type BrushAction =
  | { type: "APPLY"; entry: HistoryEntry }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "RESET"; uri: string };

const MAX_HISTORY = 30;

function brushReducer(state: BrushState, action: BrushAction): BrushState {
  switch (action.type) {
    case "APPLY":
      return {
        ...state,
        past: [...state.past.slice(-(MAX_HISTORY - 1)), state.current],
        future: [],
        current: action.entry,
      };
    case "UNDO": {
      if (state.past.length === 0) return state;
      const prev = state.past[state.past.length - 1];
      return {
        ...state,
        past: state.past.slice(0, -1),
        future: [state.current, ...state.future],
        current: prev,
      };
    }
    case "REDO": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        ...state,
        past: [...state.past, state.current],
        future: state.future.slice(1),
        current: next,
      };
    }
    case "RESET":
      return {
        past: [],
        future: [],
        current: { alpha: new Uint8Array(0), uri: action.uri },
        originalUri: action.uri,
      };
  }
}

async function decodeImageFromUri(
  uri: string
): Promise<{
  rgba: Uint8Array;
  width: number;
  height: number;
}> {
  const base64 = await readAsStringAsync(uri, {
    encoding: EncodingType.Base64,
  });
  const raw = toByteArray(base64);
  return decodePNG(raw);
}

async function writePngToFile(
  rgba: Uint8Array,
  width: number,
  height: number
): Promise<string> {
  const pngData = encodePNG(rgba, width, height);
  const base64 = fromByteArray(pngData);
  const outputPath = `${cacheDirectory}snapshot_brush_${Date.now()}.png`;
  await writeAsStringAsync(outputPath, base64, {
    encoding: EncodingType.Base64,
  });
  return outputPath;
}

export function useCanvasBrush(transparentImageUri: string) {
  const pixelRef = useRef<{
    rgba: Uint8Array;
    width: number;
    height: number;
  } | null>(null);

  const initialState: BrushState = {
    past: [],
    future: [],
    current: { alpha: new Uint8Array(0), uri: transparentImageUri },
    originalUri: transparentImageUri,
  };

  const [state, dispatch] = useReducer(brushReducer, initialState);

  const loadedRef = useRef(false);
  const strokeBufferRef = useRef<
    { x: number; y: number; mode: "restore" | "remove"; radius: number }[]
  >([]);
  const needsFlushRef = useRef(false);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!transparentImageUri) return;
    let cancelled = false;

    async function load() {
      try {
        const decoded = await decodeImageFromUri(transparentImageUri);
        if (!cancelled) {
          pixelRef.current = decoded;
          loadedRef.current = true;
          dispatch({
            type: "RESET",
            uri: transparentImageUri,
          });
        }
      } catch {
        loadedRef.current = false;
      }
    }

    loadedRef.current = false;
    strokeBufferRef.current = [];
    load();

    return () => {
      cancelled = true;
    };
  }, [transparentImageUri]);

  const flushStrokes = useCallback(async () => {
    const pixel = pixelRef.current;
    if (!pixel) return;
    const strokes = strokeBufferRef.current;
    if (strokes.length === 0) return;

    strokeBufferRef.current = [];
    needsFlushRef.current = false;

    const rgba = new Uint8Array(pixel.rgba);
    for (const s of strokes) {
      applyCircleToAlpha(
        rgba,
        pixel.width,
        pixel.height,
        s.x,
        s.y,
        s.radius,
        s.mode
      );
    }

    const uri = await writePngToFile(rgba, pixel.width, pixel.height);
    pixelRef.current = { ...pixel, rgba };

    dispatch({
      type: "APPLY",
      entry: { alpha: rgba, uri },
    });
  }, []);

  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
    }
    needsFlushRef.current = true;
    flushTimerRef.current = setTimeout(() => {
      flushStrokes();
    }, 300);
  }, [flushStrokes]);

  const applyStroke = useCallback(
    (
      x: number,
      y: number,
      mode: "restore" | "remove",
      radius: number
    ) => {
      strokeBufferRef.current.push({ x, y, mode, radius });
      scheduleFlush();
    },
    [scheduleFlush]
  );

  const commitStroke = useCallback(async () => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    if (needsFlushRef.current) {
      await flushStrokes();
    }
  }, [flushStrokes]);

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  return {
    applyStroke,
    commitStroke,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    currentImageUri: state.current.uri,
  };
}
