import emptyOwl from "../../assets/mate/empty-owl.png";

type MateEmptySectionProps = {
  /** 웹 empty CTA (책 고르러 가기) */
  onCta?: () => void;
  ctaLabel?: string;
  className?: string;
};

export default function MateEmptySection({
  onCta,
  ctaLabel = "책 고르러 가기",
  className = "",
}: MateEmptySectionProps) {
  return (
    <section
      className={`mt-[136px] flex flex-col items-center px-5 min-[431px]:mt-16 ${className}`}
    >
      <div className="size-[120px] overflow-hidden min-[431px]:size-[188px]">
        <img
          src={emptyOwl}
          alt=""
          className="size-full object-contain object-bottom opacity-[0.86] min-[431px]:opacity-[0.52]"
        />
      </div>
      <h2 className="mt-[28px] text-center text-[20px] font-bold leading-7 tracking-[-0.025em] text-gray-800 min-[431px]:mt-7 min-[431px]:text-[26px] min-[431px]:leading-[33.6px]">
        아직 고른 책이 없어요
      </h2>
      <p className="mt-2 text-center text-body2 text-gray-400 min-[431px]:text-[17px] min-[431px]:leading-6">
        내 마음을 들여다보고
        <br />딱 맞는 위로의 문장을 선물 받아보세요.
      </p>
      {onCta ? (
        <button
          type="button"
          onClick={onCta}
          className="mt-7 hidden h-[60px] items-center justify-center rounded-[30px] bg-white px-6 text-[19.2px] font-medium tracking-[-0.025em] text-gray-800 shadow-[0_0_2.4px_rgba(169,173,190,0.57)] min-[431px]:flex"
        >
          {ctaLabel}
        </button>
      ) : null}
    </section>
  );
}
