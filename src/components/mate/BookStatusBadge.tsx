import iconBadgeFinished from "../../assets/mate/icon-badge-finished.svg";
import iconBadgeReading from "../../assets/mate/icon-badge-reading.svg";
import iconBadgeUnread from "../../assets/mate/icon-badge-unread.svg";
import type { BookStatus } from "./types";

const STATUS_CONFIG: Record<
  BookStatus,
  {
    label: string;
    bg: string;
    text: string;
    icon: string;
  }
> = {
  unread: {
    label: "읽지 않은 책",
    bg: "bg-[#fbedea]",
    text: "text-[#94827d]",
    icon: iconBadgeUnread,
  },
  reading: {
    label: "읽고 있는 책",
    bg: "bg-[#fff4e2]",
    text: "text-[#94827d]",
    icon: iconBadgeReading,
  },
  finished: {
    label: "다 읽은 책",
    bg: "bg-[#e2f5e5]",
    text: "text-[#7e9583]",
    icon: iconBadgeFinished,
  },
};

type BookStatusBadgeProps = {
  status: BookStatus;
};

export default function BookStatusBadge({ status }: BookStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded-[6px] px-2 py-1 ${config.bg}`}
    >
      <img
        src={config.icon}
        alt=""
        className="h-[13px] w-[14px] shrink-0 object-contain"
      />
      <span className={`text-caption ${config.text}`}>{config.label}</span>
    </span>
  );
}
