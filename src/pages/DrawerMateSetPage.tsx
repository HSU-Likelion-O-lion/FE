import { useLocation, useNavigate } from "react-router-dom";
import owlGlasses from "../assets/drawer/owl-glasses.png";
import Button from "../components/Button";

type MateSetState = {
  bookId?: string;
  coverUrl?: string;
  title?: string;
};

/** 메이트 지정 완료 — Figma 479:3319 → 타이머 CTA로 메이트(시간 선택) 이동 */
export default function DrawerMateSetPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as MateSetState | null) ?? null;

  const goMateWithTimer = () => {
    navigate("/mate", {
      replace: true,
      state: {
        openFocusTime: true,
        mateBookId: state?.bookId,
      },
    });
  };

  return (
    <main className="relative mx-auto flex h-dvh min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff]">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-[120px]">
        <h1 className="text-center text-h2 text-gray-900">
          새로운 메이트 설정 완료!
        </h1>
        <p className="mt-1 text-center text-body1 text-gray-400">
          이 책과 함께 오롯이 몰입하는 시간을
          <br />
          가져볼까요?
        </p>

        <div className="relative mt-12 flex flex-col items-center">
          <img
            src={owlGlasses}
            alt=""
            className="h-[178px] w-[157px] -rotate-1 object-contain object-bottom"
          />
          <div
            aria-hidden
            className="mt-1 h-1.5 w-[213px] rounded-full bg-gray-100"
          />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[430px] px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3">
        <Button
          text="타이머 시작하러 가기"
          variant="primary"
          size="h-[54px] w-full rounded-2xl px-5 py-3"
          onClick={goMateWithTimer}
        />
      </div>
    </main>
  );
}
