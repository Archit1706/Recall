#!/usr/bin/env node
/* Generates minimal monochrome PNG icons for the PWA. Pure Node, no deps.
 * Renders a rounded-square background + uppercase "R" using a 7x7 bitmap font.
 * Replace these with your own art at any time. */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), "..");
const OUT_DIR = resolve(ROOT, "public/icons");
mkdirSync(OUT_DIR, { recursive: true });

// 7x7 R glyph.
const R_GLYPH = [
  "##### .",
  "#....#.",
  "#....#.",
  "#####..",
  "##.....",
  "#.#....",
  "#..#...",
].map((row) => row.replace(/\s/g, ""));

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[n] = c >>> 0;
  }
  return t;
})();

const SIZES = [
  { name: "icon-192.png", size: 192, padding: 24 },
  { name: "icon-512.png", size: 512, padding: 64 },
  { name: "icon-512-maskable.png", size: 512, padding: 96 },
];

for (const { name, size, padding } of SIZES) {
  const bytes = renderIcon(size, padding);
  writeFileSync(resolve(OUT_DIR, name), bytes);
  console.log(`wrote ${name} (${size}×${size})`);
}

function renderIcon(size, padding) {
  // RGBA, fg = warm off-white, bg = ink black with subtle gradient.
  const data = Buffer.alloc(size * size * 4);
  const bgA = [10, 10, 11]; // top
  const bgB = [20, 20, 24]; // bottom
  const fg = [248, 248, 248];

  // Background gradient + rounded corners.
  const radius = Math.round(size * 0.22);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const t = y / (size - 1);
      const r = Math.round(bgA[0] + (bgB[0] - bgA[0]) * t);
      const g = Math.round(bgA[1] + (bgB[1] - bgA[1]) * t);
      const b = Math.round(bgA[2] + (bgB[2] - bgA[2]) * t);
      const inside = pointInRoundedRect(x, y, size, size, radius);
      const i = (y * size + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = inside ? 255 : 0;
    }
  }

  // Draw the R glyph centered, scaled to fit within (size - 2*padding).
  const grid = R_GLYPH.length; // 7
  const cell = Math.floor((size - padding * 2) / grid);
  const offsetX = Math.floor((size - cell * grid) / 2);
  const offsetY = Math.floor((size - cell * grid) / 2);
  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      if (R_GLYPH[gy][gx] !== "#") continue;
      for (let py = 0; py < cell; py++) {
        for (let px = 0; px < cell; px++) {
          const x = offsetX + gx * cell + px;
          const y = offsetY + gy * cell + py;
          if (x < 0 || x >= size || y < 0 || y >= size) continue;
          const i = (y * size + x) * 4;
          data[i] = fg[0];
          data[i + 1] = fg[1];
          data[i + 2] = fg[2];
          data[i + 3] = 255;
        }
      }
    }
  }

  return encodePng(size, size, data);
}

function pointInRoundedRect(x, y, w, h, r) {
  if (x >= r && x < w - r) return true;
  if (y >= r && y < h - r) return true;
  // corners
  const cx = x < r ? r : w - r - 1;
  const cy = y < r ? r : h - r - 1;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type (RGBA)
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0;
    rgba.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw);

  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}
