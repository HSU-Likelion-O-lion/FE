import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { BOARD } from "../data/shelterThoughtsMock";

export type BoardConfig = {
  home: { width: number; height: number };
  world: { minX: number; minY: number; maxX: number; maxY: number };
  minScale: number;
  maxScale: number;
};

type Transform = { x: number; y: number; scale: number };

type PinchState = {
  distance: number;
  x: number;
  y: number;
  scale: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function clampTransform(
  next: Transform,
  viewportW: number,
  viewportH: number,
  board: BoardConfig,
): Transform {
  const { world, minScale, maxScale } = board;
  const scale = clamp(next.scale, minScale, maxScale);
  const viewW = viewportW / scale;
  const viewH = viewportH / scale;
  const worldW = world.maxX - world.minX;
  const worldH = world.maxY - world.minY;

  let minX: number;
  let maxX: number;
  let minY: number;
  let maxY: number;

  if (viewW >= worldW) {
    minX = maxX = (viewportW - worldW * scale) / 2 - world.minX * scale;
  } else {
    minX = viewportW - world.maxX * scale;
    maxX = -world.minX * scale;
  }

  if (viewH >= worldH) {
    minY = maxY = (viewportH - worldH * scale) / 2 - world.minY * scale;
  } else {
    minY = viewportH - world.maxY * scale;
    maxY = -world.minY * scale;
  }

  return {
    scale,
    x: clamp(next.x, minX, maxX),
    y: clamp(next.y, minY, maxY),
  };
}

function zoomAt(
  current: Transform,
  scaleFactor: number,
  originX: number,
  originY: number,
  viewportW: number,
  viewportH: number,
  board: BoardConfig,
) {
  const nextScale = clamp(
    current.scale * scaleFactor,
    board.minScale,
    board.maxScale,
  );
  const ratio = nextScale / current.scale;
  return clampTransform(
    {
      scale: nextScale,
      x: originX - (originX - current.x) * ratio,
      y: originY - (originY - current.y) * ratio,
    },
    viewportW,
    viewportH,
    board,
  );
}

/** 홈 프레임(0,0)~(homeW,homeH)이 뷰포트에 맞게 보이도록 초기 transform */
function initialFitTransform(
  viewportW: number,
  viewportH: number,
  board: BoardConfig,
): Transform {
  const { home } = board;
  const scaleX = viewportW / home.width;
  const scaleY = viewportH / home.height;
  const scale = clamp(
    Math.min(scaleX, scaleY),
    board.minScale,
    board.maxScale,
  );
  const x = (viewportW - home.width * scale) / 2;
  const y = (viewportH - home.height * scale) / 2;
  return clampTransform({ x, y, scale }, viewportW, viewportH, board);
}

export function useBoardPanZoom(
  viewportRef: RefObject<HTMLElement | null>,
  board: BoardConfig = BOARD,
) {
  const boardRef = useRef(board);
  boardRef.current = board;

  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scale: 1,
  });
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const panRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const pinchRef = useRef<PinchState | null>(null);
  const suppressClickRef = useRef(false);

  const measure = useCallback(() => {
    const el = viewportRef.current;
    if (!el) {
      const b = boardRef.current;
      return { w: b.home.width, h: b.home.height };
    }
    const rect = el.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }, [viewportRef]);

  // 뷰포트/보드 변경 시 홈 프레임에 맞게 맞춤
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const fit = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      setTransform(initialFitTransform(rect.width, rect.height, board));
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [board, viewportRef]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      const { w, h } = measure();
      const ox = event.clientX - rect.left;
      const oy = event.clientY - rect.top;
      const factor = Math.exp(-event.deltaY * 0.0016);
      setTransform((prev) =>
        zoomAt(prev, factor, ox, oy, w, h, boardRef.current),
      );
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [measure, viewportRef]);

  const capturePointers = useCallback((el: HTMLElement) => {
    for (const id of pointersRef.current.keys()) {
      if (!el.hasPointerCapture(id)) {
        el.setPointerCapture(id);
      }
    }
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const el = viewportRef.current;
      if (!el) return;
      pointersRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });

      if (pointersRef.current.size === 1) {
        const t = transformRef.current;
        panRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          originX: t.x,
          originY: t.y,
          moved: false,
        };
        pinchRef.current = null;
        suppressClickRef.current = false;
      } else if (pointersRef.current.size === 2) {
        const pts = [...pointersRef.current.values()];
        const [a, b] = pts;
        if (!a || !b) return;
        const t = transformRef.current;
        pinchRef.current = {
          distance: Math.hypot(b.x - a.x, b.y - a.y),
          x: t.x,
          y: t.y,
          scale: t.scale,
        };
        panRef.current = null;
        suppressClickRef.current = true;
        capturePointers(el);
      }
    },
    [capturePointers, viewportRef],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!pointersRef.current.has(event.pointerId)) return;
      pointersRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });

      const { w, h } = measure();
      const el = viewportRef.current;
      if (!el) return;
      const boardCfg = boardRef.current;

      if (pointersRef.current.size >= 2 && pinchRef.current) {
        capturePointers(el);
        const pts = [...pointersRef.current.values()];
        const [a, b] = pts;
        if (!a || !b) return;
        const distance = Math.hypot(b.x - a.x, b.y - a.y);
        const rect = el.getBoundingClientRect();
        const midX = (a.x + b.x) / 2 - rect.left;
        const midY = (a.y + b.y) / 2 - rect.top;
        const factor = distance / Math.max(pinchRef.current.distance, 1);
        const base = pinchRef.current;
        setTransform(
          zoomAt(
            { x: base.x, y: base.y, scale: base.scale },
            factor,
            midX,
            midY,
            w,
            h,
            boardCfg,
          ),
        );
        suppressClickRef.current = true;
        return;
      }

      const pan = panRef.current;
      if (!pan || pan.pointerId !== event.pointerId) return;
      const dx = event.clientX - pan.startX;
      const dy = event.clientY - pan.startY;
      if (Math.hypot(dx, dy) <= 6) return;

      if (!pan.moved) {
        pan.moved = true;
        suppressClickRef.current = true;
        capturePointers(el);
      }
      setTransform((prev) =>
        clampTransform(
          { ...prev, x: pan.originX + dx, y: pan.originY + dy },
          w,
          h,
          boardCfg,
        ),
      );
    },
    [capturePointers, measure, viewportRef],
  );

  const endPointer = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (panRef.current?.pointerId === event.pointerId) {
      panRef.current = null;
    }
    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
    }
    if (pointersRef.current.size === 1) {
      const [id, pt] = [...pointersRef.current.entries()][0]!;
      const t = transformRef.current;
      panRef.current = {
        pointerId: id,
        startX: pt.x,
        startY: pt.y,
        originX: t.x,
        originY: t.y,
        moved: false,
      };
    }
  }, []);

  const shouldSuppressClick = useCallback(() => {
    if (!suppressClickRef.current) return false;
    suppressClickRef.current = false;
    return true;
  }, []);

  return {
    transform,
    onPointerDown,
    onPointerMove,
    onPointerUp: endPointer,
    onPointerCancel: endPointer,
    shouldSuppressClick,
  };
}
