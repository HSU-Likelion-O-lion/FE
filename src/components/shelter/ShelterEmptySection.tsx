import emptyOwl from "../../assets/shelter/empty-owl.png";

type ShelterEmptySectionProps = {
  onGoDrawer?: () => void;
  variant?: "mobile" | "web";
};

/** 모바일 235:6613 / 웹 Figma 695:10532 — 참여 가능 쉼터 없음 */
export default function ShelterEmptySection({
  onGoDrawer,
  variant = "mobile",
}: ShelterEmptySectionProps) {
  const isWeb = variant === "web";

  if (isWeb) {
    return (
      <section className="flex w-full max-w-[310px] translate-y-5 flex-col items-center gap-7">
        <div className="flex w-full flex-col items-center">
          <div className="aspect-[1072/569] w-[65.8%] overflow-hidden">
            <img
              src={emptyOwl}
              alt=""
              className="size-full object-contain object-bottom opacity-[0.52]"
            />
          </div>
          <h2 className="mt-4 w-full text-center text-[26px] font-bold leading-[33.6px] tracking-[-0.025em] text-gray-800">
            참여할 수 있는 쉼터가 없어요.
          </h2>
          <p className="mt-2 w-full text-center text-[17px] leading-[1.6] tracking-[-0.025em] text-gray-400">
            쉼터는 서재에 담긴 책을 기준으로 열립니다.
            <br />
            서랍에서 내 마음을 위로할 책을 찾아볼까요?
          </p>
        </div>
        <button
          type="button"
          onClick={onGoDrawer}
          className="flex h-[60px] shrink-0 items-center justify-center rounded-[30px] bg-[#fdfdff] px-6 text-[19.2px] font-medium leading-[1.6] tracking-[-0.025em] text-gray-800 drop-shadow-[0_0_2.4px_rgba(169,173,190,0.57)]"
        >
          서랍 탭으로 이동하기
        </button>
      </section>
    );
  }

  return (
    <section className="mt-[172px] flex flex-col items-center px-5">
      <div className="h-[83px] w-[155px] overflow-hidden">
        <img
          src={emptyOwl}
          alt=""
          className="size-full object-contain object-bottom opacity-[0.52]"
        />
      </div>
      <h2 className="mt-[22px] text-center text-[20px] font-bold leading-7 tracking-[-0.025em] text-gray-800">
        참여할 수 있는 쉼터가 없어요.
      </h2>
      <p className="mt-2 text-center text-body2 text-gray-400">
        쉼터는 서재에 담긴 책을 기준으로 열립니다.
        <br />
        서랍에서 내 마음을 위로할 책을 찾아볼까요?
      </p>
      <button
        type="button"
        onClick={onGoDrawer}
        className="mt-9 rounded-[25px] bg-[#fdfdff] px-5 py-3 text-button1 text-gray-800 drop-shadow-[0_0_2.4px_rgba(169,173,190,0.57)]"
      >
        서랍 탭으로 이동하기
      </button>
    </section>
  );
}
