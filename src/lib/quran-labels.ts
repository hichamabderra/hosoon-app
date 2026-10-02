import { formatNum } from "./format";
import { getSurah, type Thumun } from "./quran-data";
import quranIncipitsData from "./quran-incipits.json";

/** Returns the opening verse words (incipit) for any thumun (1..480) */
export function getThumunIncipit(thumunId: number): string {
  const safeId = Math.max(1, Math.min(480, thumunId));
  const item = quranIncipitsData.thumuns[safeId - 1];
  return item?.incipit || "";
}

/** Returns the opening verse words (incipit) for any hizb (1..60) */
export function getHizbIncipit(hizb: number): string {
  const safeHizb = Math.max(1, Math.min(60, hizb));
  const item = quranIncipitsData.hizbs[safeHizb - 1];
  return item?.incipit || "";
}

/** "سورة البقرة" */
export function surahName(sura: number): string {
  const s = getSurah(sura);
  return s ? `سورة ${s.name}` : `سورة ${sura}`;
}

/** "البقرة 16" */
export function ayaRef(sura: number, aya: number, arabic = false): string {
  const s = getSurah(sura);
  const name = s ? s.name : String(sura);
  return `${name} ${formatNum(aya, arabic)}`;
}

/** Full range label: "من سورة الفاتحة آية 1 إلى سورة البقرة آية 15" */
export function thumunRangeLabel(t: Thumun, arabic = false): string {
  const from = `سورة ${getSurah(t.startSura)?.name ?? t.startSura} آية ${formatNum(t.startAya, arabic)}${t.partialStart ? " (منتصفها)" : ""}`;
  const to =
    t.startSura === t.endSura && t.startAya === t.endAya
      ? t.partialEnd
        ? "منتصفها"
        : null
      : `سورة ${getSurah(t.endSura)?.name ?? t.endSura} آية ${formatNum(t.endAya, arabic)}${t.partialEnd ? " (منتصفها)" : ""}`;
  return to ? `من ${from} إلى ${to}` : `آية ${from}`;
}

/** Compact: "الفاتحة 1 ← البقرة 15" */
export function thumunShort(t: Thumun, arabic = false): string {
  const a = ayaRef(t.startSura, t.startAya, arabic);
  const b =
    t.startSura === t.endSura && t.startAya === t.endAya
      ? ""
      : ` ← ${ayaRef(t.endSura, t.endAya, arabic)}${t.partialEnd ? "…" : ""}`;
  return `${t.partialStart ? "…" : ""}${a}${b}`;
}

/** "الثمن 5 — وَلَا تَلْبِسُواْ اُ۬لْحَقَّ بِالْبَٰطِلِ" */
export function thumunTitle(t: Thumun, arabic = false): string {
  const incipit = getThumunIncipit(t.id);
  return incipit ? `الثمن ${formatNum(t.id, arabic)} — ${incipit}` : `الثمن ${formatNum(t.id, arabic)} — ${t.name}`;
}

/** "الحزب 3 — سَيَقُولُ اُ۬لسُّفَهَآءُ مِنَ اَ۬لنَّاسِ" */
export function hizbTitle(hizb: number, arabic = false): string {
  const incipit = getHizbIncipit(hizb);
  return incipit ? `الحزب ${formatNum(hizb, arabic)} — ${incipit}` : `الحزب ${formatNum(hizb, arabic)}`;
}

/** Multi-thumun span → per-surah ayah ranges (for audio + display). */
export interface SurahSpan {
  sura: number;
  name: string;
  fromAya: number;
  toAya: number;
}

export function surahSpan(from: Thumun, to: Thumun): SurahSpan[] {
  const spans: SurahSpan[] = [];
  for (let s = from.startSura; s <= to.endSura; s++) {
    const info = getSurah(s);
    const fromAya = s === from.startSura ? from.startAya : 1;
    const toAya = s === to.endSura ? to.endAya : (info?.verses ?? 0);
    spans.push({ sura: s, name: info?.name ?? String(s), fromAya, toAya });
  }
  return spans;
}
