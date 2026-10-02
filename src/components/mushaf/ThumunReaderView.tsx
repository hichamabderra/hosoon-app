"use client";

import { useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Expand,
  Headphones,
  Maximize2,
  Minimize2,
  Moon,
  Shrink,
  Sun,
  Volume2,
  X,
  Palette,
} from "lucide-react";
import { useMushafStore, type MushafTheme } from "@/store/useMushafStore";
import {
  getMushafPageInfo,
  TOTAL_MUSHAF_PAGES,
  TOTAL_ATHMAN,
} from "@/lib/mushaf-mapping";
import { useHifzStore } from "@/store/useHifzStore";
import { formatNum } from "@/lib/format";
import { thumunTitle } from "@/lib/quran-labels";
import { vibrateLight } from "@/lib/haptic";
import QuranAudioPlayer from "../audio/QuranAudioPlayer";
import { Button } from "../ui/button";

export default function ThumunReaderView() {
  const isOpen = useMushafStore((s) => s.isOpen);
  const closeReader = useMushafStore((s) => s.closeReader);

  // Close on Escape key, lock background body scroll, and handle browser/mobile Back button
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Push history state so Android/mobile back button closes reader instead of exiting app
    window.history.pushState({ modal: "mushaf-reader" }, "");

    let poppedByBrowser = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeReader();
      }
    };

    const handlePopState = () => {
      poppedByBrowser = true;
      closeReader();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
      if (!poppedByBrowser && typeof window !== "undefined" && window.history.state?.modal === "mushaf-reader") {
        window.history.back();
      }
    };
  }, [isOpen, closeReader]);

  return (
    <AnimatePresence>
      {isOpen && <ThumunReaderContent key="mushaf-reader-modal" />}
    </AnimatePresence>
  );
}

function ThumunReaderContent() {
  const thumunId = useMushafStore((s) => s.thumunId);
  const currentPage = useMushafStore((s) => s.currentPage);
  const thumunPages = useMushafStore((s) => s.thumunPages);
  const theme = useMushafStore((s) => s.theme);
  const isZoomed = useMushafStore((s) => s.isZoomed);
  const showAudio = useMushafStore((s) => s.showAudio);

  const closeReader = useMushafStore((s) => s.closeReader);
  const nextPage = useMushafStore((s) => s.nextPage);
  const prevPage = useMushafStore((s) => s.prevPage);
  const nextThumun = useMushafStore((s) => s.nextThumun);
  const prevThumun = useMushafStore((s) => s.prevThumun);
  const setTheme = useMushafStore((s) => s.setTheme);
  const toggleZoom = useMushafStore((s) => s.toggleZoom);
  const toggleAudio = useMushafStore((s) => s.toggleAudio);

  const arabic = useHifzStore((s) => s.settings.arabicNumerals);

  const [showControls, setShowControls] = useState(true);
  const [loadedPage, setLoadedPage] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageLoaded = loadedPage === currentPage;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const pageInfo = getMushafPageInfo(currentPage);
  const thumun = pageInfo.thumun;

  // Listen for fullscreen change
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    vibrateLight();
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // Ignored
    }
  };

  // Touch swipe support (RTL: swipe left = next page, swipe right = prev page)
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      vibrateLight();
      nextPage();
    },
    onSwipedRight: () => {
      vibrateLight();
      prevPage();
    },
    preventScrollOnSwipe: false,
    trackMouse: false,
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        vibrateLight();
        nextPage();
      } else if (e.key === "ArrowRight") {
        vibrateLight();
        prevPage();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextPage, prevPage]);

  // Toggle controls visibility on single tap on reader background/image
  const handlePageTap = (e: React.MouseEvent) => {
    // If clicking a button or audio control, do not toggle
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest(".audio-player-zone")) {
      return;
    }
    setShowControls((prev) => !prev);
  };

  // Next theme cycle
  const cycleTheme = () => {
    vibrateLight();
    const themes: MushafTheme[] = ["sepia", "dark", "light"];
    const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIdx]);
  };

  // Theme container styles
  const themeStyles = {
    sepia: {
      bg: "bg-[#fbf7ee] dark:bg-[#1a1713]",
      text: "text-[#2e261d] dark:text-[#f2ece1]",
      header: "bg-[#fbf7ee]/90 dark:bg-[#1a1713]/90 border-[#e9dfcc] dark:border-[#332b21]",
      hud: "bg-[#f4ebd9]/95 dark:bg-[#25201a]/95 border-[#e4d6bf] dark:border-[#3d3326] text-[#2e261d] dark:text-[#f2ece1]",
      imgFilter: "sepia-[0.06] contrast-[1.02]",
    },
    dark: {
      bg: "bg-[#0b0e14]",
      text: "text-[#e6edf3]",
      header: "bg-[#0b0e14]/90 border-[#1f2633]",
      hud: "bg-[#151b23]/95 border-[#283243] text-[#e6edf3]",
      imgFilter: "brightness-[0.95] contrast-[1.05]",
    },
    light: {
      bg: "bg-[#f8fafc]",
      text: "text-[#0f172a]",
      header: "bg-white/90 border-slate-200",
      hud: "bg-white/95 border-slate-200 text-slate-800 shadow-lg",
      imgFilter: "",
    },
  }[theme];

  const pageIndexInThumun = thumunPages.indexOf(currentPage);
  const totalPagesInThumun = thumunPages.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`fixed inset-0 z-[100] ${themeStyles.bg} ${themeStyles.text} select-none flex flex-col overflow-hidden overscroll-none`}
      dir="rtl"
    >
      {/* ─── Top Floating Header HUD ─── */}
      <AnimatePresence>
        {showControls && (
          <motion.header
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.18 }}
            className={`shrink-0 z-20 px-3 sm:px-6 py-2.5 sm:py-3.5 border-b backdrop-blur-md flex items-center justify-between gap-2 shadow-sm ${themeStyles.header}`}
          >
            {/* Close / Return Button */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  vibrateLight();
                  closeReader();
                }}
                className="h-9 px-2.5 rounded-full font-bold flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="إغلاق القارئ"
              >
                <ArrowRight className="w-4 h-4 ml-0.5" />
                <span className="text-xs sm:text-sm">رجوع</span>
              </Button>
            </div>

            {/* Central Meta Title */}
            <div className="flex flex-col items-center text-center min-w-0 max-w-[65%]">
              <h2 className="font-bold text-sm sm:text-base leading-tight truncate">
                {pageInfo.title}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs opacity-80 mt-0.5">
                {thumun && (
                  <span>
                    {thumunTitle(thumun, arabic)} · الجزء {formatNum(thumun.juz, arabic)} · الحزب{" "}
                    {formatNum(thumun.hizb, arabic)}
                  </span>
                )}
                {totalPagesInThumun > 1 && (
                  <span className="inline-block px-1.5 py-0.2 bg-primary/10 text-primary font-bold rounded-full text-[10px]">
                    صفحة {formatNum(pageIndexInThumun + 1, arabic)} من{" "}
                    {formatNum(totalPagesInThumun, arabic)}
                  </span>
                )}
              </div>
            </div>

            {/* Top Action Icons */}
            <div className="flex items-center gap-1">
              {/* Theme Cycle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={cycleTheme}
                className="w-9 h-9 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                title="تغيير لون المظهر"
                aria-label="تغيير لون المظهر"
              >
                {theme === "sepia" ? (
                  <Palette className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                ) : theme === "dark" ? (
                  <Moon className="w-4 h-4 text-sky-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
              </Button>

              {/* Fullscreen Browser Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="w-9 h-9 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                title={isFullscreen ? "إلغاء ملء الشاشة" : "ملء الشاشة"}
                aria-label={isFullscreen ? "إلغاء ملء الشاشة" : "ملء الشاشة"}
              >
                {isFullscreen ? (
                  <Shrink className="w-4 h-4" />
                ) : (
                  <Expand className="w-4 h-4" />
                )}
              </Button>

              {/* Zoom Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  vibrateLight();
                  toggleZoom();
                }}
                className="w-9 h-9 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                title={isZoomed ? "ملاءمة كامل الصفحة" : "تكبير النص مع التمرير"}
                aria-label={isZoomed ? "ملاءمة كامل الصفحة" : "تكبير النص مع التمرير"}
              >
                {isZoomed ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>

              {/* Audio Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  vibrateLight();
                  toggleAudio();
                }}
                className={`w-9 h-9 rounded-full transition-colors ${
                  showAudio
                    ? "bg-primary/20 text-primary"
                    : "hover:bg-black/5 dark:hover:bg-white/10"
                }`}
                title="الاستماع الصوتي للثمن"
                aria-label="الاستماع الصوتي للثمن"
              >
                <Headphones className="w-4 h-4" />
              </Button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ─── Main Mushaf Page Display Viewport ─── */}
      <main
        {...swipeHandlers}
        ref={containerRef}
        onClick={handlePageTap}
        className={
          isZoomed
            ? "flex-1 w-full min-h-0 overflow-y-auto overscroll-contain flex flex-col items-center p-1 sm:p-2 touch-pan-y"
            : "flex-1 w-full min-h-0 flex items-center justify-center relative overflow-hidden p-0 sm:p-1 touch-pan-y"
        }
      >
        {/* Subtle Next / Prev Clickable Side Areas on Desktop/Tablets */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            vibrateLight();
            prevPage();
          }}
          disabled={currentPage <= 1}
          className="hidden md:flex absolute right-4 z-10 w-12 h-12 rounded-full items-center justify-center bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm transition-all disabled:opacity-0"
          aria-label="الصفحة السابقة"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            vibrateLight();
            nextPage();
          }}
          disabled={currentPage >= TOTAL_MUSHAF_PAGES}
          className="hidden md:flex absolute left-4 z-10 w-12 h-12 rounded-full items-center justify-center bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm transition-all disabled:opacity-0"
          aria-label="الصفحة التالية"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Page Image */}
        <div
          className={
            isZoomed
              ? "w-full max-w-3xl min-h-full flex flex-col items-center justify-center py-2"
              : "relative w-full h-full flex items-center justify-center"
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={currentPage}
            src={pageInfo.imageUrl}
            alt={pageInfo.title}
            onLoad={() => setLoadedPage(currentPage)}
            className={
              isZoomed
                ? `w-full h-auto max-w-full object-contain rounded-sm shadow-sm transition-opacity duration-200 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  } ${themeStyles.imgFilter}`
                : `max-w-full max-h-full w-auto h-auto object-contain rounded-sm shadow-sm transition-opacity duration-200 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  } ${themeStyles.imgFilter}`
            }
            style={{
              filter:
                theme === "dark"
                  ? "invert(0.92) hue-rotate(180deg) brightness(0.9) contrast(1.08)"
                  : undefined,
            }}
          />

          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}
        </div>
      </main>

      {/* ─── Persistent Audio Player Layer (Plays continuously even in full display) ─── */}
      {showAudio && (
        <>
          {/* Main Audio Card (docked above bottom navigation when controls are visible) */}
          <div
            className={`fixed bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-1.5rem)] max-w-md pointer-events-auto transition-all duration-200 ${
              showControls
                ? "opacity-100 translate-y-0"
                : "opacity-0 pointer-events-none translate-y-4"
            }`}
          >
            <div className={`p-3 rounded-2xl border backdrop-blur-md shadow-2xl ${themeStyles.hud} audio-player-zone`}>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-primary" />
                  <span className="font-bold text-xs truncate max-w-[240px]">
                    سماع {thumun ? thumunTitle(thumun, arabic) : `الثمن ${formatNum(thumunId, arabic)}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                  aria-label="إغلاق مشغل الصوت"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <QuranAudioPlayer
                mode="thumun"
                targetId={thumunId}
                compact={true}
                autoPlay={false}
              />
            </div>
          </div>

          {/* Floating Mini Pill when controls are hidden during fullscreen reading */}
          {!showControls && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowControls(true);
              }}
              className="fixed bottom-3 right-3 z-30 cursor-pointer pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 dark:bg-zinc-800/90 text-white backdrop-blur-md shadow-xl border border-white/20 text-xs hover:scale-105 active:scale-95 transition-transform"
              title="اضغط لإظهار أدوات التحكم بالصوت والقراءة"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium max-w-[140px] truncate">
                {thumun ? thumunTitle(thumun, arabic) : `الثمن ${formatNum(thumunId, arabic)}`}
              </span>
              <span className="text-[10px] opacity-75 bg-white/15 px-1.5 py-0.5 rounded-full font-bold">
                تحكم
              </span>
            </motion.div>
          )}
        </>
      )}

      {/* ─── Bottom Floating Controls HUD ─── */}
      <AnimatePresence>
        {showControls && (
          <motion.footer
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.18 }}
            className="shrink-0 z-20 pb-3 pt-1 px-3 flex flex-col items-center gap-2"
          >
            {/* Navigation Floating Pill Bar */}
            <div
              className={`pointer-events-auto flex items-center justify-between gap-1.5 sm:gap-3 px-3 sm:px-4 py-2 rounded-full border backdrop-blur-md shadow-lg ${themeStyles.hud}`}
            >
              {/* Previous Thumun Button */}
              <button
                type="button"
                onClick={() => {
                  vibrateLight();
                  prevThumun();
                }}
                disabled={thumunId <= 1}
                className="px-2 py-1 text-xs font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="الثمن السابق"
              >
                الثمن السابق
              </button>

              <div className="h-4 w-px bg-border/60" />

              {/* Prev Page Button (RTL: right chevron = back to lower page) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  vibrateLight();
                  prevPage();
                }}
                disabled={currentPage <= 1}
                className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
                aria-label="الصفحة السابقة"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>

              {/* Current Page Pill Indicator */}
              <div className="px-2 text-center min-w-[76px]">
                <span className="font-bold text-xs sm:text-sm">
                  {formatNum(currentPage, arabic)}
                </span>
                <span className="text-[10px] opacity-70">
                  {" / "}
                  {formatNum(TOTAL_MUSHAF_PAGES, arabic)}
                </span>
              </div>

              {/* Next Page Button (RTL: left chevron = forward to next page) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  vibrateLight();
                  nextPage();
                }}
                disabled={currentPage >= TOTAL_MUSHAF_PAGES}
                className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30"
                aria-label="الصفحة التالية"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="h-4 w-px bg-border/60" />

              {/* Next Thumun Button */}
              <button
                type="button"
                onClick={() => {
                  vibrateLight();
                  nextThumun();
                }}
                disabled={thumunId >= TOTAL_ATHMAN}
                className="px-2 py-1 text-xs font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="الثمن التالي"
              >
                الثمن التالي
              </button>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
