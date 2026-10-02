import { describe, expect, it } from "vitest";
import {
  TOTAL_MUSHAF_PAGES,
  TOTAL_ATHMAN,
  getMushafPagesForThumun,
  getThumunFromMushafPage,
  getMushafPageTitle,
  getMushafPageInfo,
} from "./mushaf-mapping";

describe("mushaf-mapping", () => {
  it("exports correct totals and maps page to thumun", () => {
    expect(TOTAL_MUSHAF_PAGES).toBe(485);
    expect(TOTAL_ATHMAN).toBe(480);
    expect(getThumunFromMushafPage(1)).toBe(1);
    expect(getThumunFromMushafPage(485)).toBe(480);
  });

  it("maps Thumun 1 to exactly 3 pages [1, 2, 3]", () => {
    const pages = getMushafPagesForThumun(1);
    expect(pages).toEqual([1, 2, 3]);
  });

  it("maps Thumun 2 to page 4", () => {
    expect(getMushafPagesForThumun(2)).toEqual([4]);
  });

  it("maps Thumun 457 (Hizb 58 start - Al-Jinn) to page 459", () => {
    expect(getMushafPagesForThumun(457)).toEqual([459]);
  });

  it("maps Thumun 472 (end of Hizb 59) to page 474", () => {
    expect(getMushafPagesForThumun(472)).toEqual([474]);
  });

  it("maps Hizb 60 athman accurately", () => {
    expect(getMushafPagesForThumun(473)).toEqual([475]);
    expect(getMushafPagesForThumun(474)).toEqual([476]);
    expect(getMushafPagesForThumun(475)).toEqual([477]);
    expect(getMushafPagesForThumun(476)).toEqual([478]);
    expect(getMushafPagesForThumun(477)).toEqual([479, 480]);
    expect(getMushafPagesForThumun(478)).toEqual([480, 481]);
    expect(getMushafPagesForThumun(479)).toEqual([481, 482, 483]);
    expect(getMushafPagesForThumun(480)).toEqual([483, 484, 485]);
  });

  it("has valid titles for boundary and shifted pages", () => {
    expect(getMushafPageTitle(1)).toContain("الفاتحة");
    expect(getMushafPageTitle(458)).toContain("نوح");
    expect(getMushafPageTitle(459)).toContain("الجن");
    expect(getMushafPageTitle(460)).toContain("المزمل");
    expect(getMushafPageTitle(485)).toContain("الناس");
  });

  it("returns full MushafPageInfo correctly", () => {
    const info = getMushafPageInfo(1);
    expect(info.pageNumber).toBe(1);
    expect(info.imageUrl).toBe("/mushaf/pages/page1.jpg");
    expect(info.thumunId).toBe(1);
    expect(info.hizb).toBe(1);
  });
});
