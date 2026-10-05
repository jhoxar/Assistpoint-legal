/**
 * kie.ai client — images (GPT Image 2.5, Nano Banana Pro) and video (Kling 3.0).
 *
 * Adapted from troy-lp/v03/scripts/kie.mjs. Every call spends real credits, so
 * the script is built around that constraint, not around convenience:
 *
 *   · Nothing is sent without first printing the estimated cost, the live
 *     account balance, and what the refactor has spent against its cap.
 *   · Every call — ok or failed — is appended to docs/refactor/kie-log.md, so
 *     spend is auditable without opening the account.
 *   · Results are downloaded into assets-src/kie/ immediately: kie.ai URLs
 *     expire, and regenerating a file because it was lost is wasted money.
 *   · The refactor cap (DECISIONS.md L-05, $10 = 2000 credits) is enforced by
 *     summing the log before every paid call.
 *
 * Run with the key loaded from .env (KIE_AI_API) and never printed:
 *   node --env-file=.env scripts/kie.mjs <command> ...
 *
 * Commands:
 *   upload  <name> <file>                                 free; stores URL in manifest
 *   image   <name> <prompt-file> [opts] [ref...]           refs = manifest names or URLs
 *             --model=flare|sunburst|nano-banana-pro       (default flare)
 *             --aspect=auto|1:1|16:9|...  --res=1K|2K|4K  --bg=transparent|opaque|auto
 *   video   <name> <prompt-file> <aspect> [dur=3..15] [mode=std|pro] <start-ref> [end-ref]
 *   rescue  <name> <taskId> <ext>                          fetch a paid task whose process died
 *   balance                                                 live balance + logged spend
 */

import { readFile, writeFile, appendFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, join } from "node:path";

const API = "https://api.kie.ai/api/v1/jobs";
const UPLOAD_API = "https://kieai.redpandaai.co/api/file-stream-upload";
const ROOT = process.cwd();
const OUT = join(ROOT, "assets-src", "kie");
const LOG = join(ROOT, "docs", "kie-log.md");
const MANIFEST = join(OUT, "urls.json");

/* 1 credit = $0.005. L-05 caps the whole refactor at $10. */
const CREDIT_USD = 0.005;
const CAP_CREDITS = 2000;

/* Credits per generation, from the kie.ai model pages (2026-09). Kept here so
   the cost is visible when reading the script. */
const IMAGE_MODELS = {
  flare: {
    id: "gpt-image-2-5-flare-image-to-image",
    textId: "gpt-image-2-5-flare-text-to-image",
    credits: { "1K": 6, "2K": 10, "4K": 16 },
  },
  sunburst: {
    id: "gpt-image-2-5-sunburst-image-to-image",
    textId: "gpt-image-2-5-sunburst-text-to-image",
    credits: { "1K": 6, "2K": 10, "4K": 16 },
  },
  "nano-banana-pro": { id: "nano-banana-pro", credits: { "1K": 18, "2K": 18, "4K": 24 } },
};
// Kling 3.0, no sound, credits per second by mode (kie.ai model page, 2026-09).
const KLING_CREDITS_PER_SECOND = { std: 14, pro: 18, "4K": 67 };

function key() {
  // This project's .env names the key KIE_API_KEY; assist-point used KIE_AI_API.
  // Accept either rather than duplicating the secret into a second .env line.
  const k = process.env.KIE_AI_API || process.env.KIE_API_KEY;
  if (!k) throw new Error("KIE_API_KEY missing. Run with: node --env-file=.env scripts/kie.mjs ...");
  return k;
}

/* ── manifest of remote URLs ─────────────────────────────────────────────────
   Lets a generation reference an earlier one (or an uploaded reference) by
   name without re-uploading. The local file is the backup; this is the
   pointer. */

async function readManifest() {
  if (!existsSync(MANIFEST)) return {};
  return JSON.parse(await readFile(MANIFEST, "utf8"));
}

async function rememberUrl(name, url) {
  const manifest = await readManifest();
  manifest[name] = url;
  await mkdir(OUT, { recursive: true });
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
}

async function resolveRef(ref) {
  if (ref.startsWith("http")) return ref;
  const url = (await readManifest())[ref];
  if (!url) throw new Error(`No stored URL for "${ref}". Upload or generate it first.`);
  return url;
}

/* ── balance and budget ─────────────────────────────────────────────────────
   The balance is asked of the account (a free GET) rather than derived: a
   derived balance breaks silently the moment the log moves. The cap, on the
   other hand, is about this refactor only, so it is summed from the log. */

async function balance() {
  const res = await fetch("https://api.kie.ai/api/v1/chat/credit", {
    headers: { Authorization: `Bearer ${key()}` },
  });
  if (!res.ok) throw new Error(`Could not read balance: ${res.status}`);
  const { data } = await res.json();
  return Number(data);
}

/* KIE_ACCOUNT=user marks a run on a separate key the user supplied for one job
   (2026-09-25: the Seedance 2.5 hero flight). Its rows are logged with
   "[user key]" in the name and do not count against the project's L-05 cap,
   which only governs the project account. The key itself is never logged. */
const USER_ACCOUNT = process.env.KIE_ACCOUNT === "user";
const USER_TAG = "[user key]";

/** Credits spent so far on the project account, read from the log itself. */
async function spentSoFar() {
  if (!existsSync(LOG)) return 0;
  const log = await readFile(LOG, "utf8");
  return [...log.matchAll(/^\|\s*\d{4}-[^|]+\|([^|]+)\|\s*(\d+)\s*\|/gm)]
    .filter((m) => !m[1].includes(USER_TAG))
    .reduce((sum, m) => sum + Number(m[2]), 0);
}

const usd = (credits) => `$${(credits * CREDIT_USD).toFixed(2)}`;

async function guardBudget(credits, label) {
  const [remaining, spent] = await Promise.all([balance(), spentSoFar()]);

  console.log(`\n── Budget ──────────────────────────────────`);
  console.log(`  live balance        : ${remaining} credits`);
  console.log(`  this call (est.)    : ${credits} credits ${usd(credits)}  (${label})`);
  console.log(`  refactor spent      : ${spent} / ${CAP_CREDITS} credits (${usd(spent)} / ${usd(CAP_CREDITS)})`);
  console.log(`  after this call     : ${spent + credits} / ${CAP_CREDITS}`);
  console.log(`────────────────────────────────────────────\n`);

  if (USER_ACCOUNT) {
    console.log(`  account             : user-supplied key (outside the L-05 project cap)\n`);
  } else if (spent + credits > CAP_CREDITS) {
    throw new Error(
      `ABORTED: ${spent + credits} credits would exceed the L-05 cap of ${CAP_CREDITS} (${usd(CAP_CREDITS)}). Ask the lead.`,
    );
  }
  if (!USER_ACCOUNT && remaining < credits) {
    throw new Error(`ABORTED: account balance ${remaining} is below the call cost ${credits}.`);
  }
  return remaining;
}

async function logCall({ kind, name, model, credits, taskId, result, note }) {
  if (USER_ACCOUNT) name = `${name} ${USER_TAG}`;
  if (!existsSync(LOG)) {
    await writeFile(
      LOG,
      `# kie.ai — spend log (Assist Point Global refactor v2)\n\n` +
        `Written by scripts/kie.mjs only. 1 credit = $0.005. Cap (L-05): ${CAP_CREDITS} credits = $10.\n` +
        `Failed tasks are not charged but are logged with 0 credits. "Credits" is the charged\n` +
        `estimate; the note carries the live balance delta when it could be measured.\n\n` +
        `| Date (UTC) | What | Credits | Model | taskId | Result |\n` +
        `|---|---|---|---|---|---|\n`,
    );
  }
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  await appendFile(
    LOG,
    `| ${stamp} | ${kind}: ${name} | ${credits} | ${model} | \`${taskId}\` | ${result}${note ? ` — ${note}` : ""} |\n`,
  );
}

/* ── transport ─────────────────────────────────────────────────────────────── */

/* kie.ai rate-limits by frequency, sometimes by accepting createTask and then
   letting it die with "generate task timeout". The last-call stamp lives on
   disk because each generation is a separate node process. */
const GAP_MS = 20_000;
const STAMP = join(OUT, ".kie-last-call");

async function throttle() {
  let last = 0;
  try { last = Number(await readFile(STAMP, "utf8")) || 0; } catch { /* first call */ }
  const wait = last + GAP_MS - Date.now();
  if (wait > 0) {
    console.log(`Throttle: waiting ${Math.ceil(wait / 1000)} s…`);
    await new Promise((r) => setTimeout(r, wait));
  }
  await mkdir(OUT, { recursive: true });
  await writeFile(STAMP, String(Date.now()));
}

function isTransient(msg) {
  return /too high|frequency|timeout|429|rate/i.test(msg);
}

async function post(path, body) {
  await throttle();
  const res = await fetch(`${API}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.code !== 200) throw new Error(`createTask failed (${json.code}): ${json.msg}`);
  return json.data;
}

/* A dropped poll must not orphan a task that is already paid for: credits are
   charged on submit, so network errors while polling are retried. */
async function getTask(taskId) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      const res = await fetch(`${API}/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
        headers: { Authorization: `Bearer ${key()}` },
      });
      return await res.json();
    } catch (err) {
      if (attempt >= 6) throw err;
      process.stdout.write(`\n  [net] ${err.message} — retry ${attempt}/5 in 10 s`);
      await new Promise((r) => setTimeout(r, 10_000));
    }
  }
}

async function waitFor(taskId, { timeoutMs = 900_000 } = {}) {
  const started = Date.now();
  let lastState = "";
  while (Date.now() - started < timeoutMs) {
    const json = await getTask(taskId);
    const data = json.data ?? {};
    const state = data.state ?? json.msg ?? "unknown";
    if (state !== lastState) {
      process.stdout.write(`\n  [${Math.round((Date.now() - started) / 1000)}s] ${state}`);
      lastState = state;
    } else {
      process.stdout.write(".");
    }
    if (state === "success") {
      const urls = JSON.parse(data.resultJson ?? "{}").resultUrls ?? [];
      if (!urls.length) throw new Error("Task succeeded without resultUrls.");
      process.stdout.write("\n");
      return urls;
    }
    if (state === "fail") throw new Error(`Task failed: ${data.failMsg ?? json.msg ?? "no detail"}`);
    await new Promise((r) => setTimeout(r, 6000));
  }
  throw new Error(`Timed out waiting for task ${taskId}.`);
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not download ${url}: ${res.status}`);
  await mkdir(OUT, { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return dest;
}

function extOf(url, fallback) {
  const m = /\.([a-z0-9]{3,4})(?:\?|$)/i.exec(url);
  return m ? m[1].toLowerCase() : fallback;
}

/* Measured charge: the balance delta around a call. Other traffic on the same
   account would pollute it, so it is a note, never the logged figure. */
async function balanceDelta(before) {
  try {
    const after = await balance();
    return `balance ${before}→${after} (Δ${before - after})`;
  } catch {
    return "";
  }
}

/* ── commands ──────────────────────────────────────────────────────────────── */

async function upload(name, file) {
  const form = new FormData();
  form.append("file", new Blob([await readFile(file)]), basename(file));
  form.append("uploadPath", "assistpoint-legal/refs");
  form.append("fileName", basename(file));
  const res = await fetch(UPLOAD_API, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}` },
    body: form,
  });
  const json = await res.json();
  const url = json.data?.downloadUrl ?? json.data?.fileUrl ?? json.data?.url;
  if (!json.success && json.code !== 200) throw new Error(`Upload failed (${json.code}): ${json.msg}`);
  if (!url) throw new Error(`Upload returned no URL: ${JSON.stringify(json.data)}`);
  await rememberUrl(name, url);
  console.log(`✓ uploaded ${file} as "${name}" (temporary URL, stored in manifest)`);
}

function parseOpts(args) {
  const opts = {};
  const rest = [];
  for (const a of args) {
    const m = /^--([a-z]+)=(.+)$/.exec(a);
    if (m) opts[m[1]] = m[2];
    else rest.push(a);
  }
  return { opts, rest };
}

async function image(name, promptFile, args) {
  const { opts, rest: refNames } = parseOpts(args);
  const modelKey = opts.model ?? "flare";
  const spec = IMAGE_MODELS[modelKey];
  if (!spec) throw new Error(`Unknown model "${modelKey}". Use: ${Object.keys(IMAGE_MODELS).join(", ")}`);
  const res = opts.res ?? "2K";
  const aspect = opts.aspect ?? "auto";
  const credits = spec.credits[res];
  if (!credits) throw new Error(`Resolution ${res} not priced for ${modelKey}.`);

  const prompt = (await readFile(promptFile, "utf8")).trim();
  const refs = await Promise.all(refNames.map(resolveRef));
  const isNano = modelKey === "nano-banana-pro";
  const model = isNano ? spec.id : refs.length ? spec.id : spec.textId;
  const modelLabel = `${model} ${res}${opts.bg ? ` bg=${opts.bg}` : ""}`;

  const before = await guardBudget(credits, `image ${name} ${aspect} ${res}`);
  console.log(`Generating image "${name}" with ${model}…`);
  if (refs.length) console.log(`refs: ${refNames.join(", ")}`);

  const input = isNano
    ? { prompt, image_input: refs, aspect_ratio: aspect, resolution: res, output_format: "png" }
    : {
        prompt,
        ...(refs.length ? { input_urls: refs } : {}),
        aspect_ratio: aspect,
        resolution: res,
        ...(opts.bg ? { background: opts.bg } : {}),
      };

  let taskId = "—";
  try {
    ({ taskId } = await post("createTask", { model, input }));
    console.log(`taskId: ${taskId}`);
    const urls = await waitFor(taskId);
    const dest = join(OUT, `${name}.${extOf(urls[0], "png")}`);
    await download(urls[0], dest);
    await rememberUrl(name, urls[0]);
    await logCall({
      kind: "image", name, model: modelLabel, credits, taskId, result: "ok",
      note: `${refs.length} ref(s) · ${await balanceDelta(before)}`,
    });
    console.log(`\n✓ ${dest}`);
    return urls[0];
  } catch (err) {
    await logCall({ kind: "image", name, model: modelLabel, credits: 0, taskId, result: `FAILED — ${err.message}` });
    throw err;
  }
}

/**
 * Kling 3.0, interpolation mode: image_urls = [start, end]. For a seamless
 * loop pass the same frame twice. Both frames must imply motion, or the clip
 * decelerates into a freeze. `sound: false` — the hero is muted.
 */
async function video(name, promptFile, aspect, args) {
  const prompt = (await readFile(promptFile, "utf8")).trim();
  if (prompt.length > 2500) {
    throw new Error(`Prompt is ${prompt.length} chars; kie.ai rejects over 2500. Trim ${promptFile}.`);
  }
  const flag = (k) => args.find((a) => a.startsWith(`${k}=`))?.slice(k.length + 1);
  const refNames = args.filter((a) => !/^(dur|mode)=/.test(a));
  const seconds = Number(flag("dur") ?? 8);
  const mode = flag("mode") ?? "pro";
  if (!Number.isInteger(seconds) || seconds < 3 || seconds > 15) {
    throw new Error(`Kling 3.0 takes 3-15 s; got ${seconds}.`);
  }
  if (!KLING_CREDITS_PER_SECOND[mode]) throw new Error(`Unknown mode "${mode}".`);
  const credits = KLING_CREDITS_PER_SECOND[mode] * seconds;
  const image_urls = await Promise.all(refNames.map(resolveRef));
  const modelLabel = `kling-3.0/video ${mode} ${seconds}s`;

  const before = await guardBudget(credits, `video ${name} ${aspect} · ${modelLabel}`);
  console.log(`Generating video "${name}" (${aspect}, ${seconds}s, ${mode})…`);

  let taskId = "—";
  try {
    ({ taskId } = await post("createTask", {
      model: "kling-3.0/video",
      input: {
        prompt, image_urls, duration: String(seconds), aspect_ratio: aspect,
        mode, sound: false, multi_shots: false,
      },
    }));
    console.log(`taskId: ${taskId}`);
    const urls = await waitFor(taskId, { timeoutMs: 1_800_000 });
    const dest = join(OUT, `${name}.mp4`);
    await download(urls[0], dest);
    await rememberUrl(name, urls[0]);
    await logCall({
      kind: "video", name, model: modelLabel, credits, taskId, result: "ok",
      note: `${aspect} · ${await balanceDelta(before)}`,
    });
    console.log(`\n✓ ${dest}`);
    return urls[0];
  } catch (err) {
    await logCall({ kind: "video", name, model: modelLabel, credits: 0, taskId, result: `FAILED — ${err.message}` });
    throw err;
  }
}

/* Seedance 2.5 (bytedance/seedance-2-5, docs.kie.ai/market/bytedance/seedance-2-5).
   kie.ai does not publish its per-second price, so the guard runs on an explicit
   estimate (est=) and the logged figure is the MEASURED balance delta, which keeps
   the L-05 cap honest after the first call reveals the real rate. */
async function seedance(name, promptFile, args) {
  const prompt = (await readFile(promptFile, "utf8")).trim();
  const flag = (k) => args.find((a) => a.startsWith(`${k}=`))?.slice(k.length + 1);
  const refNames = args.filter((a) => !/^(dur|res|aspect|est)=/.test(a));
  const seconds = Number(flag("dur") ?? 10);
  const resolution = flag("res") ?? "1080p";
  const aspect = flag("aspect") ?? "16:9";
  const estimate = Number(flag("est") ?? 600);
  if (!Number.isInteger(seconds) || seconds < 4 || seconds > 30) {
    throw new Error(`Seedance 2.5 takes 4-30 s; got ${seconds}.`);
  }
  if (!["480p", "720p", "1080p"].includes(resolution)) throw new Error(`Unknown resolution "${resolution}".`);
  const [first, last] = await Promise.all(refNames.map(resolveRef));
  if (!first) throw new Error("Seedance needs a first-frame ref (and optionally a last-frame ref).");
  const modelLabel = `bytedance/seedance-2-5 ${resolution} ${seconds}s`;

  const before = await guardBudget(estimate, `video ${name} ${aspect} · ${modelLabel}`);
  console.log(`Generating video "${name}" (${aspect}, ${seconds}s, ${resolution}, Seedance 2.5)…`);

  let taskId = "—";
  try {
    ({ taskId } = await post("createTask", {
      model: "bytedance/seedance-2-5",
      input: {
        prompt,
        first_frame_url: first,
        ...(last ? { last_frame_url: last } : {}),
        resolution, aspect_ratio: aspect, duration: seconds,
        generate_audio: false, output_format: "mp4",
      },
    }));
    console.log(`taskId: ${taskId}`);
    const urls = await waitFor(taskId, { timeoutMs: 2_400_000 });
    const dest = join(OUT, `${name}.mp4`);
    await download(urls[0], dest);
    await rememberUrl(name, urls[0]);
    const after = await balance().catch(() => null);
    const measured = after === null ? estimate : before - after;
    await logCall({
      kind: "video", name, model: modelLabel, credits: measured, taskId, result: "ok",
      note: `${aspect} · balance ${before}→${after ?? "?"} (Δ${measured}; est. ${estimate})`,
    });
    console.log(`\n✓ ${dest}  (charged ${measured} credits)`);
    return urls[0];
  } catch (err) {
    await logCall({ kind: "video", name, model: modelLabel, credits: 0, taskId, result: `FAILED — ${err.message}` });
    throw err;
  }
}

/* Only transient failures are retried; a rejected prompt fails the same way
   every time and retrying it burns credits. */
async function withRetry(fn, attempts = 3) {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i >= attempts || !isTransient(err.message)) throw err;
      const wait = 60_000 * i;
      console.log(`\n⟳ attempt ${i}/${attempts} hit rate limiting. Retrying in ${wait / 1000} s.`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

async function main() {
  const [cmd, a, b, c, ...rest] = process.argv.slice(2);
  if (cmd === "upload") {
    await upload(a, b);
  } else if (cmd === "image") {
    await withRetry(() => image(a, b, [c, ...rest].filter(Boolean)));
  } else if (cmd === "video") {
    await withRetry(() => video(a, b, c, rest));
  } else if (cmd === "seedance") {
    await withRetry(() => seedance(a, b, [c, ...rest].filter(Boolean)));
  } else if (cmd === "rescue") {
    // Credits are charged on submit; this fetches a result whose process died.
    const urls = await waitFor(b, { timeoutMs: 1_800_000 });
    const dest = join(OUT, `${a}.${c ?? extOf(urls[0], "bin")}`);
    await download(urls[0], dest);
    await rememberUrl(a, urls[0]);
    console.log(`\n✓ ${dest} (already logged? if not, add the row by hand)`);
  } else if (cmd === "balance") {
    const spent = await spentSoFar();
    console.log(`live balance   : ${await balance()} credits`);
    console.log(`refactor spent : ${spent} / ${CAP_CREDITS} credits (${usd(spent)} / ${usd(CAP_CREDITS)})`);
  } else {
    console.error("Commands: upload | image | video | rescue | balance");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
