import { describe, it, expect } from "vitest";
import {
  getHizbAudioUrl,
  getThumunAudioUrl,
  thumunToHizbAndPos,
  HIZB_RECITERS,
  THUMUN_RECITERS,
  NORMAL_THUMUN_RECITERS,
  FAST_THUMUN_RECITERS,
  isFastThumunReciter,
} from "./quran-audio";

describe("Quran Audio Service (Ahzab & Athman)", () => {
  it("computes hizb and pos correctly from thumunId", () => {
    expect(thumunToHizbAndPos(1)).toEqual({ hizb: 1, pos: 1 });
    expect(thumunToHizbAndPos(2)).toEqual({ hizb: 1, pos: 2 });
    expect(thumunToHizbAndPos(8)).toEqual({ hizb: 1, pos: 8 });
    expect(thumunToHizbAndPos(9)).toEqual({ hizb: 2, pos: 1 });
    expect(thumunToHizbAndPos(480)).toEqual({ hizb: 60, pos: 8 });
  });

  describe("Hizb Audio URLs (Khatma)", () => {
    it("generates correct URL for Al-Husary", () => {
      expect(getHizbAudioUrl("husary", 1)).toBe("https://archive.org/download/06_20220525vvv/01.mp3");
      expect(getHizbAudioUrl("husary", 60)).toBe("https://archive.org/download/06_20220525vvv/60.mp3");
    });

    it("generates correct URL for Abdul Basit", () => {
      expect(getHizbAudioUrl("abdulbasit", 1)).toBe(
        "https://archive.org/download/rabi3246234623632146234623462364/01.mp3",
      );
    });

    it("generates correct URL for Benkiran", () => {
      expect(getHizbAudioUrl("benkiran", 1)).toBe("https://archive.org/download/kirane2013/01.mp3");
    });

    it("generates correct URL for Moukatili", () => {
      expect(getHizbAudioUrl("moukatili", 1)).toBe(
        "https://archive.org/download/alfirdwsiy1433_gmail_5777777777777777779997/01.mp3",
      );
    });

    it("generates correct URL for Rasheed Belaachia with H prefix", () => {
      expect(getHizbAudioUrl("belaachia", 1)).toBe(
        "https://archive.org/download/full_____--------quran_____--60-part--hezb-full-ahzab--by-rasheed-bel3asheyyah/H01.mp3",
      );
      expect(getHizbAudioUrl("belaachia", 60)).toBe(
        "https://archive.org/download/full_____--------quran_____--60-part--hezb-full-ahzab--by-rasheed-bel3asheyyah/H60.mp3",
      );
    });

    it("generates correct URL for all 15 Hizb reciters", () => {
      expect(HIZB_RECITERS).toHaveLength(15);
      for (const reciter of HIZB_RECITERS) {
        const u1 = reciter.getUrl(1);
        const u60 = reciter.getUrl(60);
        expect(u1).toContain("archive.org/download");
        expect(u60).toContain("archive.org/download");
      }
    });
  });

  describe("Thumun Audio URLs (Hifz)", () => {
    it("generates correct URL for Mohamed Sayed", () => {
      expect(getThumunAudioUrl("sayed", 1)).toBe(
        "https://archive.org/download/hxxxxxxxxxz/H01-T01.mp3",
      );
      expect(getThumunAudioUrl("sayed", 2)).toBe(
        "https://archive.org/download/hxxxxxxxxxz/H01-T02.mp3",
      );
      expect(getThumunAudioUrl("sayed", 480)).toBe(
        "https://archive.org/download/hxxxxxxxxxz/H60-T08.mp3",
      );
    });

    it("generates correct URL for Abdelhamid Hassaine", () => {
      expect(getThumunAudioUrl("hassaine", 1)).toBe(
        "https://archive.org/download/vh-45-t-0v4v/H01_T01.mp3",
      );
    });

    it("generates correct URL for Al-Husary Thumun", () => {
      expect(getThumunAudioUrl("husary_thumun", 1)).toBe(
        "https://archive.org/download/426-t-02-h-54_zzzz/001_t01_h01.mp3",
      );
      expect(getThumunAudioUrl("husary_thumun", 480)).toBe(
        "https://archive.org/download/426-t-02-h-54_zzzz/480_t08_h60.mp3",
      );
    });

    it("generates correct URL for Abdul Basit Thumun", () => {
      expect(getThumunAudioUrl("abdulbasit_thumun", 1)).toBe(
        "https://archive.org/download/zzzzzzzzzzzzzzz28-1-8z/01%201-8.mp3",
      );
    });

    it("generates correct URL for Irawi Normal and Fast", () => {
      expect(getThumunAudioUrl("irawi_normal", 1)).toBe(
        "https://archive.org/download/h-137nnnnnnn/H_011.mp3",
      );
      expect(getThumunAudioUrl("irawi_fast", 1)).toBe(
        "https://archive.org/download/xxxxxxxxxxxxxh-011z/H_011.mp3",
      );
    });

    it("generates correct URL for Hamdan", () => {
      expect(getThumunAudioUrl("hamdan_thumun", 1)).toBe(
        "https://archive.org/download/x0220516xxxxxxxxxxxxx/001.mp3",
      );
    });

    it("generates correct URL for Naboulsi Normal and Fast with encoding", () => {
      const normalUrl = getThumunAudioUrl("naboulsi_normal", 1);
      expect(normalUrl).toContain("https://archive.org/download/z426-542z/");
      expect(normalUrl).toContain("001");
      expect(normalUrl).toContain(".mp3");

      const fastUrl = getThumunAudioUrl("naboulsi_fast", 1);
      expect(fastUrl).toContain("https://archive.org/download/dd426-542zzz/");
      expect(fastUrl).toContain("001");
      expect(fastUrl).toContain(".mp3");
    });

    it("generates correct URL for Al-Qazabri Fast and Normal", () => {
      expect(getThumunAudioUrl("qazabri_normal", 1)).toBe(
        "https://archive.org/download/omar-alqazabri-480--thomn-part-athmaan--quran-warsh-128kb/H01_T01.mp3",
      );
      expect(getThumunAudioUrl("qazabri_fast", 1)).toBe(
        "https://archive.org/download/nhna-01-t-01nnna/H01_T01.mp3",
      );
    });

    it("generates correct URL for Yassine Djazaïri Normal and Fast", () => {
      expect(getThumunAudioUrl("yassine_normal", 1)).toBe(
        "https://archive.org/download/way2sona_20160210_1428/H01-T01.mp3",
      );
      expect(getThumunAudioUrl("yassine_fast", 1)).toBe(
        "https://archive.org/download/vvvvvvh-55-t-07v/H01-T01.mp3",
      );
    });

    it("generates correct URL for Kouchi Thumun", () => {
      expect(getThumunAudioUrl("kouchi_thumun", 1)).toBe(
        "https://archive.org/download/way2sona_20160210_1431/001_t01_h01.mp3",
      );
    });

    it("generates correct URL for Hassaine Fast", () => {
      expect(getThumunAudioUrl("hassaine_fast", 1)).toBe(
        "https://archive.org/download/vv51-t-01vvvvv/H01_T01.mp3",
      );
    });
  });

  describe("Reciter Pace & Grouping (Clear distinction)", () => {
    it("distinguishes fast and normal thumun reciters correctly", () => {
      expect(isFastThumunReciter("sayed")).toBe(false);
      expect(isFastThumunReciter("hassaine")).toBe(false);
      expect(isFastThumunReciter("husary_thumun")).toBe(false);
      expect(isFastThumunReciter("abdulbasit_thumun")).toBe(false);
      expect(isFastThumunReciter("irawi_normal")).toBe(false);
      expect(isFastThumunReciter("hamdan_thumun")).toBe(false);
      expect(isFastThumunReciter("naboulsi_normal")).toBe(false);
      expect(isFastThumunReciter("qazabri_normal")).toBe(false);
      expect(isFastThumunReciter("yassine_normal")).toBe(false);
      expect(isFastThumunReciter("kouchi_thumun")).toBe(false);

      expect(isFastThumunReciter("sayed_fast")).toBe(true);
      expect(isFastThumunReciter("qazabri_fast")).toBe(true);
      expect(isFastThumunReciter("benkiran_fast")).toBe(true);
      expect(isFastThumunReciter("irawi_fast")).toBe(true);
      expect(isFastThumunReciter("naboulsi_fast")).toBe(true);
      expect(isFastThumunReciter("yassine_fast")).toBe(true);
      expect(isFastThumunReciter("hassaine_fast")).toBe(true);

      expect(NORMAL_THUMUN_RECITERS).toHaveLength(10);
      expect(FAST_THUMUN_RECITERS).toHaveLength(7);
      expect(THUMUN_RECITERS).toHaveLength(17);

      for (const r of THUMUN_RECITERS) {
        expect(r.paceLabel).toBeDefined();
        expect(r.badgeLabel).toBeDefined();
        expect(r.description).toBeDefined();
      }
    });
  });
});
