import type { PostItVariant } from "../components/shelter/PostIt";
import type { CommunityPost } from "../api/types";

/** 보드에 올라가는 포스트잇 (empty는 빈 화면 전용) */
export type BoardPostItVariant = Exclude<PostItVariant, "empty">;

export type ThoughtNote = {
  id: string;
  /** 보드 미리보기 텍스트 */
  content: string;
  /** 상세 본문 */
  body: string;
  authorName: string;
  date: string;
  /** API에서 오면 비워두고 레이아웃 단계에서 시드로 부여 */
  variant?: Exclude<PostItVariant, "featured" | "empty">;
  isMine?: boolean;
  isHearted?: boolean;
  heartCount?: number | null;
};

export type PlacedThoughtNote = Omit<ThoughtNote, "variant"> & {
  variant: BoardPostItVariant;
  x: number;
  y: number;
  width: number;
  rotate: number;
  flip: boolean;
  zIndex: number;
};

const BOARD_VARIANTS: Array<Exclude<PostItVariant, "featured" | "empty">> = [
  "clip",
  "curl",
  "tape",
];

type HomeSlot = {
  x: number;
  y: number;
  width: number;
  rotate: number;
  variant?: BoardPostItVariant;
  flip?: boolean;
};

/**
 * 기본 화면(초기 뷰포트) 고정 배치 — Figma 사유 보드 7개
 * index 3 = featured
 */
const HOME_LAYOUT: ReadonlyArray<HomeSlot> = [
  { x: 19, y: 192, width: 123, rotate: -5 },
  { x: 150, y: 234, width: 130, rotate: 0 },
  { x: 264, y: 201, width: 121, rotate: 3.5 },
  { x: 14, y: 358, width: 365, rotate: 4, variant: "featured", flip: false },
  { x: 21, y: 577, width: 143, rotate: -3 },
  { x: 106, y: 660, width: 127, rotate: 0.4 },
  { x: 236, y: 576, width: 147, rotate: -3 },
];

/** 웹 초기 뷰 — Figma 726:4462 (1440×1024) */
const WEB_HOME_LAYOUT: ReadonlyArray<HomeSlot> = [
  { x: 176, y: 255, width: 229, rotate: -3.19 },
  { x: 259, y: 484, width: 236, rotate: -4.9, variant: "curl" },
  {
    x: 504,
    y: 243,
    width: 451,
    rotate: 3.95,
    variant: "featured",
    flip: false,
  },
  {
    x: 1063,
    y: 243,
    width: 203,
    rotate: 4.95,
    variant: "tape",
    flip: true,
  },
  { x: 1078, y: 506, width: 207, rotate: -0.74, variant: "curl" },
  { x: 1081, y: 734, width: 199, rotate: 0.37 },
  { x: 194, y: 727, width: 220, rotate: -5.21 },
];

const HOME_VIEW = { width: 393, height: 792 } as const;
const WEB_HOME_VIEW = { width: 1440, height: 1024 } as const;

/** 뷰포트 고정 오버레이 — 팬 끝에서도 가려지므로 추가 노트 배치 금지 */
const OVERLAY = {
  top: 280,
  bottom: 86,
} as const;

const WEB_OVERLAY = {
  top: 160,
  bottom: 120,
} as const;

/** 홈 뷰포트 주변 — 축소·팬 시 보이는 영역 */
const WORLD = {
  minX: -520,
  minY: -40,
  maxX: 920,
  maxY: 1320,
} as const;

const WEB_WORLD = {
  minX: -480,
  minY: -280,
  maxX: 2200,
  maxY: 1800,
} as const;

type Box = { x: number; y: number; width: number; height: number };

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickBoardVariant(rand: () => number) {
  return BOARD_VARIANTS[Math.floor(rand() * BOARD_VARIANTS.length)]!;
}

function estimateHeight(variant: BoardPostItVariant, width: number) {
  if (variant === "featured") return Math.round(width * 0.61);
  return Math.round(width * 1.08);
}

/** 회전을 감안한 AABB 패딩 */
function paddedBox(
  x: number,
  y: number,
  width: number,
  height: number,
  rotateDeg: number,
): Box {
  const rad = (Math.abs(rotateDeg) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const bw = width * cos + height * sin;
  const bh = width * sin + height * cos;
  const cx = x + width / 2;
  const cy = y + height / 2;
  return {
    x: cx - bw / 2,
    y: cy - bh / 2,
    width: bw,
    height: bh,
  };
}

function overlaps(a: Box, b: Box, gap: number) {
  return !(
    a.x + a.width + gap <= b.x ||
    b.x + b.width + gap <= a.x ||
    a.y + a.height + gap <= b.y ||
    b.y + b.height + gap <= a.y
  );
}

function intersectsHomeViewport(
  box: Box,
  homeView: { width: number; height: number },
  margin = 16,
) {
  const home: Box = {
    x: -margin,
    y: -margin,
    width: homeView.width + margin * 2,
    height: homeView.height + margin * 2,
  };
  return overlaps(box, home, 0);
}

/**
 * 상·하단 그라데이션에 가려지는 월드 구간
 * (팬을 끝으로 밀었을 때 해당 노트가 오버레이 아래로 들어감)
 */
function intersectsOverlayDeadZone(
  box: Box,
  world: { minX: number; minY: number; maxX: number; maxY: number },
  overlay: { top: number; bottom: number },
) {
  const topDead: Box = {
    x: world.minX,
    y: world.minY,
    width: world.maxX - world.minX,
    height: overlay.top,
  };
  const bottomDead: Box = {
    x: world.minX,
    y: world.maxY - overlay.bottom,
    width: world.maxX - world.minX,
    height: overlay.bottom,
  };
  return overlaps(box, topDead, 0) || overlaps(box, bottomDead, 0);
}

type BoardLayoutConfig = {
  homeLayout: ReadonlyArray<HomeSlot>;
  homeView: { width: number; height: number };
  world: { minX: number; minY: number; maxX: number; maxY: number };
  overlay: { top: number; bottom: number };
};

function isInvalidOuterPlacement(box: Box, config: BoardLayoutConfig) {
  return (
    intersectsHomeViewport(box, config.homeView) ||
    intersectsOverlayDeadZone(box, config.world, config.overlay)
  );
}

/** 좌·우·하 스트립에 충분한 후보 슬롯 생성 */
function buildOuterSlots(
  rand: () => number,
  config: BoardLayoutConfig,
): Array<{ x: number; y: number }> {
  const { world, overlay, homeView } = config;
  const slots: Array<{ x: number; y: number }> = [];
  const cellW = 148;
  const cellH = 156;
  const gap = 16;
  const top = world.minY + overlay.top + gap;
  const bottom = world.maxY - overlay.bottom - 130 - gap;

  for (let col = 0; col < 4; col += 1) {
    const x = world.minX + gap + col * cellW;
    if (x + 130 >= -gap) break;
    for (let y = top; y <= bottom; y += cellH) {
      slots.push({ x, y });
    }
  }
  for (let col = 0; col < 6; col += 1) {
    const x = homeView.width + gap + col * cellW;
    if (x + 130 > world.maxX - gap) break;
    for (let y = top; y <= bottom; y += cellH) {
      slots.push({ x, y });
    }
  }
  const belowHome = homeView.height + gap;
  if (belowHome <= bottom) {
    for (let y = belowHome; y <= bottom; y += cellH) {
      for (let x = gap; x + 130 < homeView.width - gap; x += cellW) {
        slots.push({ x, y });
      }
    }
  }

  for (let i = slots.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = slots[i]!;
    slots[i] = slots[j]!;
    slots[j] = tmp;
  }

  return slots.filter((slot) => {
    const probe: Box = { x: slot.x, y: slot.y, width: 130, height: 140 };
    return !isInvalidOuterPlacement(probe, config);
  });
}

export type ThoughtBoardMode = "mobile" | "web";

const MOBILE_LAYOUT_CONFIG: BoardLayoutConfig = {
  homeLayout: HOME_LAYOUT,
  homeView: HOME_VIEW,
  world: WORLD,
  overlay: OVERLAY,
};

const WEB_LAYOUT_CONFIG: BoardLayoutConfig = {
  homeLayout: WEB_HOME_LAYOUT,
  homeView: WEB_HOME_VIEW,
  world: WEB_WORLD,
  overlay: WEB_OVERLAY,
};

/** 보드 미리보기용 짧은 텍스트 */
export function toBoardPreview(content: string): string {
  const lines = content
    .trim()
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length >= 2) {
    return lines
      .slice(0, 3)
      .map((line) => (line.length > 18 ? `${line.slice(0, 18)}...` : line))
      .join("\n");
  }

  const text = content.trim().replace(/\s+/g, " ");
  if (text.length <= 40) return text;

  const chunk = 14;
  const parts: string[] = [];
  for (let i = 0; i < text.length && parts.length < 3; i += chunk) {
    const slice = text.slice(i, i + chunk);
    const isLast = parts.length === 2 || i + chunk >= text.length;
    parts.push(isLast && i + chunk < text.length ? `${slice}...` : slice);
  }
  return parts.join("\n");
}

export function communityPostToThoughtNote(post: CommunityPost): ThoughtNote {
  return {
    id: String(post.postId),
    content: toBoardPreview(post.content),
    body: post.content,
    authorName: post.anonymousNickname,
    date: "",
    isMine: post.isMine,
    isHearted: post.isHearted,
    heartCount: post.heartCount,
  };
}

/** API 응답처럼 content만 있는 목록 → 화면용 배치 */
export function layoutThoughtNotes(
  notes: ThoughtNote[],
  seedKey = "shelter-thoughts",
  mode: ThoughtBoardMode = "mobile",
): PlacedThoughtNote[] {
  const config = mode === "web" ? WEB_LAYOUT_CONFIG : MOBILE_LAYOUT_CONFIG;
  const { homeLayout } = config;
  const rand = mulberry32(hashSeed(`${seedKey}:${mode}`));
  const placed: PlacedThoughtNote[] = [];
  const boxes: Box[] = [];
  const gap = 20;

  const homeCount = Math.min(homeLayout.length, notes.length);
  for (let index = 0; index < homeCount; index += 1) {
    const note = notes[index]!;
    const home = homeLayout[index]!;
    const variant = home.variant ?? note.variant ?? pickBoardVariant(rand);
    const flip = home.flip ?? (variant !== "featured" && rand() > 0.6);
    const height = estimateHeight(variant, home.width);

    placed.push({
      ...note,
      variant,
      flip,
      zIndex: variant === "featured" ? 20 : 10 + index,
      x: home.x,
      y: home.y,
      width: home.width,
      rotate: home.rotate,
    });

    boxes.push(paddedBox(home.x, home.y, home.width, height, home.rotate));
  }

  const slots = buildOuterSlots(rand, config);
  let slotCursor = 0;

  for (let index = homeCount; index < notes.length; index += 1) {
    const note = notes[index]!;
    const variant = note.variant ?? pickBoardVariant(rand);
    const flip = rand() > 0.55;
    const width =
      mode === "web"
        ? 160 + Math.floor(rand() * 40)
        : 118 + Math.floor(rand() * 24);
    const height = estimateHeight(variant, width);
    const rotate = -5 + rand() * 10;

    let placedAt: { x: number; y: number } | null = null;

    while (slotCursor < slots.length) {
      const slot = slots[slotCursor]!;
      slotCursor += 1;
      const x = slot.x + (rand() - 0.5) * 8;
      const y = slot.y + (rand() - 0.5) * 8;
      const box = paddedBox(x, y, width, height, rotate);
      if (isInvalidOuterPlacement(box, config)) continue;
      if (boxes.some((b) => overlaps(box, b, gap))) continue;
      placedAt = { x, y };
      break;
    }

    if (!placedAt) {
      for (let i = 0; i < slots.length && !placedAt; i += 1) {
        const slot = slots[i]!;
        const box = paddedBox(slot.x, slot.y, width, height, rotate);
        if (isInvalidOuterPlacement(box, config)) continue;
        if (boxes.some((b) => overlaps(box, b, gap))) continue;
        placedAt = { x: slot.x, y: slot.y };
      }
    }

    if (!placedAt) continue;

    placed.push({
      ...note,
      variant,
      flip,
      zIndex: 10 + index,
      x: placedAt.x,
      y: placedAt.y,
      width,
      rotate,
    });

    boxes.push(paddedBox(placedAt.x, placedAt.y, width, height, rotate));
  }

  return placed;
}

export const BOARD = {
  home: HOME_VIEW,
  world: WORLD,
  overlay: OVERLAY,
  minScale: 0.72,
  maxScale: 1.35,
} as const;

/** 웹 팬/줌 보드 — Figma 726:4462 초기 프레임 */
export const WEB_BOARD = {
  home: WEB_HOME_VIEW,
  world: WEB_WORLD,
  overlay: WEB_OVERLAY,
  minScale: 0.55,
  maxScale: 1.45,
} as const;
