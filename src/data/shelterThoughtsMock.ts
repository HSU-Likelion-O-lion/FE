import type { PostItVariant } from "../components/shelter/PostIt";

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

const HOME_VIEW = { width: 393, height: 792 } as const;

/** 뷰포트 고정 오버레이 — 팬 끝에서도 가려지므로 추가 노트 배치 금지 */
const OVERLAY = {
  top: 280,
  bottom: 86,
} as const;

/** 홈 뷰포트 주변 — 축소·팬 시 보이는 영역 */
const WORLD = {
  minX: -520,
  minY: -40,
  maxX: 920,
  maxY: 1320,
} as const;

const TEXTS = [
  "완벽해야 한다는\n부담이 오히려\n불안을 키운다는...",
  "미래를 지나치게\n걱정하기보다 지금\n할 수 있는 일에 .....",
  "철학은 어렵고\n멀게만\n느껴졌는데...",
  "어제보다 더 나은 하루를 보냈다는 사실만으로도\n충분히 의미가 있어요. 앞으로도 이 책을 읽고\n난 후의 마음가짐으로....",
  "철학은 어렵고 멀게만\n느껴졌는데, 일상의\n고민을 해결하는....",
  "미래를 지나치게\n생각하는,,것? 지금\n할 수 있는 일에 .....",
  "작은 선택을\n반복하는 일이\n나를 바꾼다....",
  "불안은 신호가\n될 수 있어요.\n멈추라는 뜻이 아니라...",
  "남과 비교하기보다\n어제의 나와\n이야기해보기....",
  "책을 덮은 뒤에도\n한 문장이\n남아 있다면....",
  "완벽하지 않아도\n앞으로 가는 건\n충분해요.",
  "오늘의 한 줄이\n내일의 용기가\n되기도 해요.",
  "모르는 걸\n인정하는 순간\n공부가 시작돼요.",
  "천천히 읽어도\n괜찮아요.\n이해하는 속도로.",
  "마음이 복잡할 때\n문장 하나가\n길을 밝혀줘요.",
  "실패해도\n배움이 남으면\n그건 낭비 아니에요.",
  "조용한 저녁에\n적어 둔 생각이\n가장 솔직해요.",
  "질문이 생기면\n이미 한 걸음\n나아가 있는 거예요.",
  "같은 책도\n시기에 따라\n다르게 읽혀요.",
  "나를 위한 사유는\n누구에게도\n설명하지 않아도 돼요.",
];

const BODIES = [
  "모든 것을 잘 해내야 한다는 강박이 스스로를\n더 지치게 만들었던 것 같아요.\n책을 읽으며 내가 통제할 수 없는 일들은\n흘려보내도 괜찮다는 사실을 깨달았습니다.\n\n모든 결과를 내 힘으로 바꾸려 하기보다,\n지금 내가 할 수 있는 일에 집중하는 것이\n더 중요하다는 생각이 들었습니다.",
  "미래를 너무 멀리까지 그리려다 보면\n지금 할 수 있는 일이 흐려지더라고요.\n오늘은 오늘만의 속도로 가도 괜찮다는\n문장이 오래 남았습니다.",
  "철학이 어렵게만 느껴졌는데,\n일상 속 고민을 비추는 거울처럼\n다가오니 조금 덜 낯설어졌어요.",
  "어제보다 조금 더 나아진 하루라면\n그걸로도 충분히 의미가 있어요.\n책을 덮은 뒤의 마음가짐을\n오래 간직하고 싶습니다.",
  "멀게만 느껴지던 철학이\n일상의 작은 선택을 설명해주는\n언어가 되어 주었습니다.",
  "걱정은 줄이고, 할 수 있는 일에\n손을 올려보는 연습.\n이 책이 그 연습을 도와준 것 같아요.",
  "거창한 결심보다\n작은 선택을 반복하는 일이\n나를 더 많이 바꿨어요.",
  "불안은 나를 멈추라는 신호가 아니라\n돌봐달라는 신호일 수 있어요.\n그 생각을 하니 조금 덜 무서워졌습니다.",
  "남과 비교하는 습관 대신\n어제의 나와 이야기해 보기로 했어요.\n그게 훨씬 다정하더라고요.",
  "책을 덮은 뒤에도 남는 한 문장이\n오늘의 나를 붙들어 줍니다.",
  "완벽하지 않아도 앞으로 가는 길.\n그 길 위에 있어도 괜찮다는 걸\n배웠어요.",
  "오늘의 한 줄이 내일의 용기가 되기도 해요.\n그래서 기록을 남겨 둡니다.",
  "모르는 걸 인정하는 순간부터\n공부가 시작된다는 말이\n마음에 와닿았어요.",
  "이해하는 속도로 천천히 읽어도\n괜찮다는 허락을 스스로에게 줬습니다.",
  "마음이 복잡할 때\n문장 하나가 길을 밝혀줄 때가 있어요.",
  "실패해도 배움이 남으면\n그건 낭비가 아니에요.\n그 문장을 붙들고 갑니다.",
  "조용한 저녁에 적어 둔 생각이\n가장 솔직한 기록인 것 같아요.",
  "질문이 생긴다는 건\n이미 한 걸음 나아가 있다는 뜻이에요.",
  "같은 책도 시기에 따라 다르게 읽혀요.\n지금의 나에게 필요한 문장을 만났습니다.",
  "나를 위한 사유는\n누구에게도 설명하지 않아도 돼요.\n그래도 여기 남겨 봅니다.",
];

const AUTHORS = [
  "비내리는 숲속",
  "고요한 창가",
  "늦은 밤 서재",
  "천천히 걷는 사람",
  "별빛 메모",
  "따뜻한 찻잔",
  "구름 위 산책",
  "조용한 연필",
];

function buildMockNote(i: number): ThoughtNote {
  return {
    id: `thought-${i + 1}`,
    content: TEXTS[i % TEXTS.length]!,
    body: BODIES[i % BODIES.length]!,
    authorName: AUTHORS[i % AUTHORS.length]!,
    date: `2026.06.${String((i % 28) + 1).padStart(2, "0")}`,
  };
}

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

function intersectsHomeViewport(box: Box, margin = 16) {
  const home: Box = {
    x: -margin,
    y: -margin,
    width: HOME_VIEW.width + margin * 2,
    height: HOME_VIEW.height + margin * 2,
  };
  return overlaps(box, home, 0);
}

/**
 * 상·하단 그라데이션에 가려지는 월드 구간
 * (팬을 끝으로 밀었을 때 해당 노트가 오버레이 아래로 들어감)
 */
function intersectsOverlayDeadZone(box: Box) {
  const topDead: Box = {
    x: WORLD.minX,
    y: WORLD.minY,
    width: WORLD.maxX - WORLD.minX,
    height: OVERLAY.top,
  };
  const bottomDead: Box = {
    x: WORLD.minX,
    y: WORLD.maxY - OVERLAY.bottom,
    width: WORLD.maxX - WORLD.minX,
    height: OVERLAY.bottom,
  };
  return overlaps(box, topDead, 0) || overlaps(box, bottomDead, 0);
}

function isInvalidOuterPlacement(box: Box) {
  return intersectsHomeViewport(box) || intersectsOverlayDeadZone(box);
}

/** 좌·우·하 스트립에 충분한 후보 슬롯 생성 */
function buildOuterSlots(rand: () => number): Array<{ x: number; y: number }> {
  const slots: Array<{ x: number; y: number }> = [];
  const cellW = 148;
  const cellH = 156;
  const gap = 16;
  const top = WORLD.minY + OVERLAY.top + gap;
  const bottom = WORLD.maxY - OVERLAY.bottom - 130 - gap;

  // 좌측 여러 열
  for (let col = 0; col < 4; col += 1) {
    const x = WORLD.minX + gap + col * cellW;
    if (x + 130 >= -gap) break;
    for (let y = top; y <= bottom; y += cellH) {
      slots.push({ x, y });
    }
  }
  // 우측 여러 열
  for (let col = 0; col < 4; col += 1) {
    const x = HOME_VIEW.width + gap + col * cellW;
    if (x + 130 > WORLD.maxX - gap) break;
    for (let y = top; y <= bottom; y += cellH) {
      slots.push({ x, y });
    }
  }
  // 하단 (홈 아래)
  const belowHome = HOME_VIEW.height + gap;
  if (belowHome <= bottom) {
    for (let y = belowHome; y <= bottom; y += cellH) {
      for (let x = gap; x + 130 < HOME_VIEW.width - gap; x += cellW) {
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
    return !isInvalidOuterPlacement(probe);
  });
}

/** API 응답처럼 content만 있는 목록 → 화면용 배치 */
export function layoutThoughtNotes(
  notes: ThoughtNote[],
  seedKey = "shelter-thoughts",
): PlacedThoughtNote[] {
  const rand = mulberry32(hashSeed(seedKey));
  const placed: PlacedThoughtNote[] = [];
  const boxes: Box[] = [];
  const gap = 20;

  // 1) 기본 화면 고정 7개 (featured 포함)
  const homeCount = Math.min(HOME_LAYOUT.length, notes.length);
  for (let index = 0; index < homeCount; index += 1) {
    const note = notes[index]!;
    const home = HOME_LAYOUT[index]!;
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

  // 2) 나머지 — 홈/오버레이 바깥 슬롯에 순서대로 배치
  const slots = buildOuterSlots(rand);
  let slotCursor = 0;

  for (let index = homeCount; index < notes.length; index += 1) {
    const note = notes[index]!;
    const variant = note.variant ?? pickBoardVariant(rand);
    const flip = rand() > 0.55;
    const width = 118 + Math.floor(rand() * 24);
    const height = estimateHeight(variant, width);
    const rotate = -5 + rand() * 10;

    let placedAt: { x: number; y: number } | null = null;

    while (slotCursor < slots.length) {
      const slot = slots[slotCursor]!;
      slotCursor += 1;
      const x = slot.x + (rand() - 0.5) * 8;
      const y = slot.y + (rand() - 0.5) * 8;
      const box = paddedBox(x, y, width, height, rotate);
      if (isInvalidOuterPlacement(box)) continue;
      if (boxes.some((b) => overlaps(box, b, gap))) continue;
      placedAt = { x, y };
      break;
    }

    if (!placedAt) {
      // 지터 없이 남은 슬롯 재시도
      for (let i = 0; i < slots.length && !placedAt; i += 1) {
        const slot = slots[i]!;
        const box = paddedBox(slot.x, slot.y, width, height, rotate);
        if (isInvalidOuterPlacement(box)) continue;
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

    boxes.push(
      paddedBox(placedAt.x, placedAt.y, width, height, rotate),
    );
  }

  return placed;
}

export function createMockThoughtNotes(count = 20): ThoughtNote[] {
  return Array.from({ length: count }, (_, i) => buildMockNote(i));
}

export function getThoughtById(id: string): ThoughtNote | undefined {
  const match = /^thought-(\d+)$/.exec(id);
  if (!match) return undefined;
  const index = Number(match[1]) - 1;
  if (index < 0) return undefined;
  return buildMockNote(index);
}

export const BOARD = {
  home: HOME_VIEW,
  world: WORLD,
  overlay: OVERLAY,
  minScale: 0.72,
  maxScale: 1.35,
} as const;
