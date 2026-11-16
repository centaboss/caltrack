import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from 'cors';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'entries.json');
const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(cors());
app.use(express.json({ limit: '8mb' }));

let entries = [];
let writeQueue = Promise.resolve();

async function loadEntries() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    entries = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Could not read data file, starting empty:', error.message);
    }
    entries = [];
  }
}

function persist() {
  const snapshot = JSON.stringify(entries, null, 2);
  writeQueue = writeQueue.then(async () => {
    const tempFile = `${DATA_FILE}.tmp`;
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(tempFile, snapshot, 'utf8');
    await fs.rename(tempFile, DATA_FILE);
  });
  return writeQueue;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function normalizeEntry(input = {}, existing) {
  const now = new Date().toISOString();
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name) {
    throw new HttpError(400, 'name is required');
  }

  const calories = Number(input.calories);
  if (!Number.isFinite(calories) || calories < 0) {
    throw new HttpError(400, 'calories must be a non-negative number');
  }

  const meal = MEALS.includes(input.meal) ? input.meal : 'snack';
  const consumedAt = input.consumedAt ? new Date(input.consumedAt) : new Date();
  if (Number.isNaN(consumedAt.getTime())) {
    throw new HttpError(400, 'consumedAt must be a valid date');
  }

  return {
    id: existing?.id || (typeof input.id === 'string' && input.id ? input.id : randomUUID()),
    name,
    calories: Math.round(calories),
    protein: toNumber(input.protein),
    carbs: toNumber(input.carbs),
    fat: toNumber(input.fat),
    meal,
    notes: typeof input.notes === 'string' ? input.notes.trim() : '',
    photo: typeof input.photo === 'string' ? input.photo : '',
    consumedAt: consumedAt.toISOString(),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
}

function dateKey(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'caltrack-api', time: new Date().toISOString() });
});

app.get('/api/entries', (req, res) => {
  let result = [...entries];

  if (req.query.meal) {
    result = result.filter((entry) => entry.meal === req.query.meal);
  }

  if (req.query.date) {
    result = result.filter((entry) => dateKey(entry.consumedAt) === req.query.date);
  } else {
    if (req.query.from) {
      const from = new Date(`${req.query.from}T00:00:00`);
      result = result.filter((entry) => new Date(entry.consumedAt) >= from);
    }
    if (req.query.to) {
      const to = new Date(`${req.query.to}T23:59:59.999`);
      result = result.filter((entry) => new Date(entry.consumedAt) <= to);
    }
  }

  result.sort((a, b) => new Date(b.consumedAt) - new Date(a.consumedAt));
  res.json(result);
});

app.get('/api/summary', (req, res) => {
  const date = typeof req.query.date === 'string' ? req.query.date : dateKey(new Date());
  const dayEntries = entries.filter((entry) => dateKey(entry.consumedAt) === date);
  const totals = dayEntries.reduce(
    (acc, entry) => {
      acc.calories += entry.calories;
      acc.protein += entry.protein;
      acc.carbs += entry.carbs;
      acc.fat += entry.fat;
      acc.count += 1;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 },
  );

  res.json({ date, ...totals });
});

app.get('/api/entries/:id', (req, res) => {
  const entry = entries.find((item) => item.id === req.params.id);
  if (!entry) {
    throw new HttpError(404, 'Entry not found');
  }
  res.json(entry);
});

app.post(
  '/api/entries',
  asyncRoute(async (req, res) => {
    const entry = normalizeEntry(req.body ?? {});
    if (entries.some((item) => item.id === entry.id)) {
      throw new HttpError(409, 'An entry with this id already exists');
    }
    entries.push(entry);
    await persist();
    res.status(201).json(entry);
  }),
);

app.put(
  '/api/entries/:id',
  asyncRoute(async (req, res) => {
    const index = entries.findIndex((item) => item.id === req.params.id);
    if (index === -1) {
      throw new HttpError(404, 'Entry not found');
    }
    const updated = normalizeEntry({ ...req.body, id: req.params.id }, entries[index]);
    entries[index] = updated;
    await persist();
    res.json(updated);
  }),
);

app.delete(
  '/api/entries/:id',
  asyncRoute(async (req, res) => {
    const index = entries.findIndex((item) => item.id === req.params.id);
    if (index === -1) {
      throw new HttpError(404, 'Entry not found');
    }
    entries.splice(index, 1);
    await persist();
    res.status(204).end();
  }),
);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status >= 500) {
    console.error(error);
  }
  res.status(status).json({ error: error.message || 'Internal server error' });
});

await loadEntries();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CalTrack API listening on http://0.0.0.0:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
