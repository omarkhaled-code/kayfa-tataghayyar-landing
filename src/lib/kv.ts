import { promises as fs } from 'fs';
import path from 'path';

// ==========================================================================
//  مخزن key/value بسيط: Upstash Redis لو المتغيرات موجودة، وإلا ملفات
//  محلية في .data/kv (للتجربة محليًا فقط).
// ==========================================================================

const REDIS_URL =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const USE_REDIS = !!(REDIS_URL && REDIS_TOKEN);

const DIR = path.join(process.cwd(), '.data', 'kv');

async function redisCmd(cmd: string[]): Promise<unknown> {
  const res = await fetch(REDIS_URL as string, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cmd),
    cache: 'no-store',
  });
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error('Redis: ' + data.error);
  return data.result ?? null;
}

function file(key: string): string {
  return path.join(DIR, key.replace(/[^a-zA-Z0-9_-]/g, '_') + '.txt');
}

export async function kvGet(key: string): Promise<string | null> {
  if (USE_REDIS) return (await redisCmd(['GET', key])) as string | null;
  try {
    return await fs.readFile(file(key), 'utf8');
  } catch {
    return null;
  }
}

export async function kvSet(key: string, value: string): Promise<void> {
  if (USE_REDIS) {
    await redisCmd(['SET', key, value]);
    return;
  }
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(file(key), value, 'utf8');
}

export async function kvDel(key: string): Promise<void> {
  if (USE_REDIS) {
    await redisCmd(['DEL', key]);
    return;
  }
  await fs.rm(file(key), { force: true });
}
