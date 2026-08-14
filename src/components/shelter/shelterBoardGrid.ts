import type { CSSProperties } from "react";

/**
 * 쉼터 보드 격자 배경.
 * PNG 타일은 가장자리가 안 맞아 이음새(선)가 생기므로 CSS gradient로 그린다.
 */
export const SHELTER_BOARD_GRID_STYLE: CSSProperties = {
  backgroundColor: "#f7f8fc",
  backgroundImage: `
    linear-gradient(rgba(148, 155, 196, 0.28) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 155, 196, 0.28) 1px, transparent 1px)
  `,
  backgroundSize: "24px 24px",
};
