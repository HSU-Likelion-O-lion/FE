import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { BOARD } from "../data/shelterThoughtsMock";

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
): Transform {
  const { world, minScale, maxScale } = BOARD;
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
) {
  const nextScale = clamp(
    current.scale * scaleFactor,
    BOARD.minScale,
    BOARD.maxScale,
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
  );
}

export function useBoardPanZoom(viewportRef: RefObject<HTMLElement | null>) {
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
    if (!el) return { w: BOARD.home.width, h: BOARD.home.height };
    const rect = el.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }, [viewportRef]);

  // React onWheel은 passive라 preventDefault 불가 → native non-passive로 처리
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
      setTransform((prev) => zoomAt(prev, factor, ox, oy, w, h));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [measure, viewportRef]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const el = viewportRef.current;
      if (!el) return;
      el.setPointerCapture(event.pointerId);
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
      }
    },
    [viewportRef],
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

      if (pointersRef.current.size >= 2 && pinchRef.current) {
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
          ),
        );
        suppressClickRef.current = true;
        return;
      }

      const pan = panRef.current;
      if (!pan || pan.pointerId !== event.pointerId) return;
      const dx = event.clientX - pan.startX;
      const dy = event.clientY - pan.startY;
      if (Math.hypot(dx, dy) > 6) {
        pan.moved = true;
        suppressClickRef.current = true;
      }
      setTransform((prev) =>
        clampTransform(
          { ...prev, x: pan.originX + dx, y: pan.originY + dy },
          w,
          h,
        ),
      );
    },
    [measure, viewportRef],
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
