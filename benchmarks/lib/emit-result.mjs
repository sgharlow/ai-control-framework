// Appends one JSON result line to results.jsonl from BM_* env vars.
// Node writes bytes as UTF-8 explicitly — no cp1252 text-mode pitfalls.
import { appendFileSync } from "node:fs";

const e = process.env;
const lines = (s) => (s || "").split("\n").map((x) => x.trim()).filter(Boolean);
const boolish = (s) => (s === "true" ? true : s === "false" ? false : s ?? null);

const row = {
  cohort: e.BM_COHORT ?? null,
  name: e.BM_NAME ?? null,
  sha: e.BM_SHA ?? null,
};

if (e.BM_ERROR) {
  row.error = e.BM_ERROR;
} else {
  row.m1_hits = Number(e.BM_M1_HITS ?? 0);
  row.m1_file_count = Number(e.BM_M1_FILE_COUNT ?? 0);
  row.m1_files = lines(e.BM_M1_FILES); // sample (first 5 file:line); full data in data/raw/m1-<name>.txt
  row.m2_flags = lines(e.BM_M2_FLAGS);
  row.m3_ci = boolish(e.BM_M3_CI);
  row.m3_raw = e.BM_M3_RAW ?? null;
  row.m4_builds = e.BM_M4_BUILDS === "n/a" ? "n/a" : boolish(e.BM_M4_BUILDS);
  row.m4_detail = e.BM_M4_DETAIL ?? null;
  const drs = e.BM_M5_DRS ?? "";
  row.m5_drs = /^[0-9]+$/.test(drs) ? Number(drs) : drs; // number, or "error: ..."
  row.m6_license = boolish(e.BM_M6_LICENSE);
  row.m6_lockfile = e.BM_M6_LOCKFILE === "n/a" ? "n/a" : boolish(e.BM_M6_LOCKFILE);
}

appendFileSync(e.BM_OUT, JSON.stringify(row) + "\n", { encoding: "utf8" });
