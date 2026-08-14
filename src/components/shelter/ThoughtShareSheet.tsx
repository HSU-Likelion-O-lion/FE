import type { CSSProperties } from "react";
import iconX from "../../assets/shelter/thoughts/share/icon-x.svg";
import iconInstagram from "../../assets/shelter/thoughts/share/icon-instagram.svg";
import iconKakao from "../../assets/shelter/thoughts/share/icon-kakao.svg";
import iconLink from "../../assets/shelter/thoughts/share/icon-link.svg";

export type ShareChannel = "x" | "instagram" | "kakao" | "link";

type ThoughtShareSheetProps = {
  open: boolean;
  shareText: string;
  shareUrl?: string;
  onClose: () => void;
};

type ChannelItem = {
  id: ShareChannel;
  label: string;
  icon: string;
  iconClass: string;
  bgClass: string;
  bgStyle?: CSSProperties;
};

const CHANNELS: ChannelItem[] = [
  {
    id: "x",
    label: "X",
    icon: iconX,
    iconClass: "size-6",
    bgClass: "bg-gray-900",
  },
  {
    id: "instagram",
    label: "인스타그램",
    icon: iconInstagram,
    iconClass: "size-6",
    bgClass: "",
    bgStyle: {
      backgroundImage:
        "linear-gradient(180deg, #fca759 3%, #e82d56 17%, #a22db4 77%, #643dce 105%)",
    },
  },
  {
    id: "kakao",
    label: "카카오톡",
    icon: iconKakao,
    iconClass: "size-7",
    bgClass: "bg-[#fee500]",
  },
  {
    id: "link",
    label: "링크복사",
    icon: iconLink,
    iconClass: "size-6",
    bgClass: "bg-gray-100",
  },
];

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

/** 사유록 공유 바텀시트 — Figma 395:10512 */
export default function ThoughtShareSheet({
  open,
  shareText,
  shareUrl = typeof window !== "undefined" ? window.location.href : "",
  onClose,
}: ThoughtShareSheetProps) {
  if (!open) return null;

  const handleChannel = async (id: ShareChannel) => {
    const encodedText = encodeURIComponent(shareText);

    try {
      if (id === "link") {
        await copyText(shareUrl || shareText);
        window.alert("링크가 복사되었어요.");
        onClose();
        return;
      }

      if (id === "x") {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedText}`,
          "_blank",
          "noopener,noreferrer",
        );
        onClose();
        return;
      }

      if (id === "kakao") {
        // 카카오 SDK 미연동 — Web Share 또는 클립보드 폴백
        if (navigator.share) {
          await navigator.share({ text: shareText, url: shareUrl || undefined });
        } else {
          await copyText(shareText);
          window.alert(
            "카카오톡 공유를 위해 내용이 복사되었어요. 카카오톡에 붙여넣어 주세요.",
          );
        }
        onClose();
        return;
      }

      if (id === "instagram") {
        // 인스타는 웹에서 텍스트 직접 공유 불가 — Web Share / 복사 폴백
        if (navigator.share) {
          await navigator.share({ text: shareText, url: shareUrl || undefined });
        } else {
          await copyText(shareText);
          window.alert(
            "인스타그램 공유를 위해 내용이 복사되었어요. 스토리/게시물에 붙여넣어 주세요.",
          );
          window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
        }
        onClose();
      }
    } catch {
      // 사용자 취소 등
    }
  };

  return (
    <div className="fixed inset-0 z-[80] mx-auto max-w-[430px] min-[431px]:max-w-none">
      <button
        type="button"
        aria-label="공유 닫기"
        className="absolute inset-0 bg-[rgba(58,61,77,0.78)]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="사유록 공유"
        className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[430px] rounded-t-[24px] bg-[#fdfdff] pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_16px_rgba(38,39,43,0.08)] min-[431px]:left-1/2 min-[431px]:max-w-[393px] min-[431px]:-translate-x-1/2"
      >
        <div className="mx-auto mb-5 h-2 w-[50px] rounded-full bg-gray-200" />

        <div className="flex items-start justify-center gap-[25px] px-5 pb-4">
          {CHANNELS.map((channel) => (
            <button
              key={channel.id}
              type="button"
              onClick={() => void handleChannel(channel.id)}
              className="flex w-[56px] flex-col items-center gap-2"
            >
              <span
                className={`relative flex size-14 shrink-0 items-center justify-center rounded-full ${channel.bgClass}`}
                style={channel.bgStyle}
              >
                <img
                  src={channel.icon}
                  alt=""
                  className={`${channel.iconClass} object-contain`}
                />
              </span>
              <span className="whitespace-nowrap text-body1 text-gray-500">
                {channel.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
