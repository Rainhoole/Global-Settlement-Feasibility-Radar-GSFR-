import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(appRoot, '..');

const sourceTextsPath = path.resolve(appRoot, 'src/locales/source-texts.json');
const countryDataPath = path.resolve(appRoot, 'src/data/countries.json');
const outputPath = path.resolve(appRoot, 'src/locales/zh-CN.json');

const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_MODEL = 'deepseek-chat';
const BATCH_SIZE = 50;

function parseEnv(content) {
  const parsed = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
    if (match) {
      parsed[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return parsed;
}

async function loadEnvFromFiles() {
  const files = [
    path.resolve(repoRoot, '.env'),
    path.resolve(appRoot, '.env'),
    path.resolve(repoRoot, 'backend/.env'),
  ];

  const textParts = [];
  const merged = {};

  for (const filePath of files) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      textParts.push(content);
      Object.assign(merged, parseEnv(content));
    } catch {
      // Ignore missing files.
    }
  }

  return {
    merged,
    rawText: textParts.join('\n'),
  };
}

function resolveDeepSeekConfig(fileEnv, rawText) {
  const keyFromRaw = rawText.match(/sk-[A-Za-z0-9_-]{20,}/)?.[0];
  const baseUrlFromRaw = rawText.match(/https?:\/\/[^\s"'`]+/)?.[0];

  const apiKey = (
    process.env.DEEPSEEK_API_KEY ??
    process.env.DEEPSEEK_KEY ??
    fileEnv.DEEPSEEK_API_KEY ??
    fileEnv.DEEPSEEK_KEY ??
    keyFromRaw
  )?.trim();

  if (!apiKey) {
    throw new Error('DeepSeek API key not found. Set DEEPSEEK_API_KEY in .env before running.');
  }

  let baseUrl = (
    process.env.DEEPSEEK_BASE_URL ??
    process.env.DEEPSEEK_API_BASE ??
    fileEnv.DEEPSEEK_BASE_URL ??
    fileEnv.DEEPSEEK_API_BASE ??
    baseUrlFromRaw ??
    DEFAULT_BASE_URL
  ).trim();

  if (baseUrl.includes('api-docs.deepseek.com')) {
    baseUrl = DEFAULT_BASE_URL;
  }
  baseUrl = baseUrl.replace(/\/+$/, '');
  if (baseUrl.endsWith('/chat/completions')) {
    baseUrl = baseUrl.slice(0, -'/chat/completions'.length);
  }

  const model = (
    process.env.DEEPSEEK_MODEL ??
    fileEnv.DEEPSEEK_MODEL ??
    DEFAULT_MODEL
  ).trim() || DEFAULT_MODEL;

  return { apiKey, baseUrl, model };
}

function isProbablyTranslatable(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const value = text.trim();
  if (!value || value.length > 500) {
    return false;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return false;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  if (/^[A-Z0-9_./+-]{1,8}$/.test(value)) {
    return false;
  }

  if (/[\u4e00-\u9fff]/.test(value)) {
    return false;
  }

  return /[A-Za-z]/.test(value);
}

function collectStringsFromObject(value, collector) {
  if (typeof value === 'string') {
    if (isProbablyTranslatable(value)) {
      collector.add(value.trim());
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectStringsFromObject(item, collector));
    return;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectStringsFromObject(item, collector));
  }
}

async function loadSourceTexts() {
  const manual = JSON.parse(await fs.readFile(sourceTextsPath, 'utf8'));
  const countries = JSON.parse(await fs.readFile(countryDataPath, 'utf8'));

  const set = new Set();
  for (const text of manual) {
    if (isProbablyTranslatable(text)) {
      set.add(text.trim());
    }
  }

  collectStringsFromObject(countries, set);
  return [...set];
}

function stripMarkdownCodeFence(text) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

function parseModelResult(content, expectedCount) {
  const normalized = stripMarkdownCodeFence(content);
  const parsed = JSON.parse(normalized);
  const list = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.translations)
      ? parsed.translations
      : null;

  if (!list || list.length !== expectedCount) {
    throw new Error(`Invalid translation result count. Expected ${expectedCount}, got ${list?.length ?? 0}`);
  }

  return list.map((item) => String(item));
}

async function requestBatch(batch, config) {
  const endpoint = `${config.baseUrl}/chat/completions`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            'Translate each input text into Simplified Chinese. Keep product names, acronyms, and URLs unchanged when needed. Return strict JSON only: {"translations":["..."]}.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            target_language: 'Simplified Chinese',
            texts: batch,
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('DeepSeek API returned empty content');
  }

  return parseModelResult(content, batch.length);
}

function toSortedObject(map) {
  return Object.fromEntries(
    Object.entries(map).sort((a, b) => a[0].localeCompare(b[0], 'en')),
  );
}

async function readExistingOutput() {
  try {
    const raw = await fs.readFile(outputPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const result = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof key === 'string' && typeof value === 'string') {
          result[key] = value;
        }
      }
      return result;
    }
  } catch {
    // ignore missing file
  }
  return {};
}

async function main() {
  const { merged, rawText } = await loadEnvFromFiles();
  const config = resolveDeepSeekConfig(merged, rawText);
  const sourceTexts = await loadSourceTexts();
  const existing = await readExistingOutput();

  const missing = sourceTexts.filter((text) => !existing[text]);
  console.log(`[i18n] source texts: ${sourceTexts.length}`);
  console.log(`[i18n] cached translations: ${Object.keys(existing).length}`);
  console.log(`[i18n] missing translations: ${missing.length}`);

  const translations = { ...existing };
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);
    console.log(`[i18n] translating batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(missing.length / BATCH_SIZE)} (${batch.length})`);
    const translated = await requestBatch(batch, config);
    batch.forEach((text, index) => {
      translations[text] = translated[index];
    });
  }

  const sorted = toSortedObject(translations);
  await fs.writeFile(outputPath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
  console.log(`[i18n] written: ${outputPath}`);
  console.log(`[i18n] total translations: ${Object.keys(sorted).length}`);
}

main().catch((error) => {
  console.error('[i18n] failed:', error);
  process.exitCode = 1;
});
