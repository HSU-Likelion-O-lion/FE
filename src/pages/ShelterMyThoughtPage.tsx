import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import WebGnb from "../components/WebGnb";
import ThoughtShareSheet from "../components/shelter/ThoughtShareSheet";
import { SHELTER_BOARD_GRID_STYLE } from "../components/shelter/shelterBoardGrid";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { useMemo, useState } from "react";
import iconBackWeb from "../assets/shelter/thoughts/icon-back-web.svg";
import iconPencil from "../assets/shelter/thoughts/write-icon-pencil.svg";
import detailAvatar from "../assets/shelter/thoughts/detail-avatar.png";
import detailTape from "../assets/shelter/thoughts/detail-like.svg";
import detailTapeCenter from "../assets/shelter/thoughts/detail-tape-center.svg";
import detailPencil1 from "../assets/shelter/thoughts/detail-pencil-1.svg";
import detailPencil2 from "../assets/shelter/thoughts/detail-pencil-2.svg";
import ellipse2468 from "../assets/shelter/thoughts/ellipse-2468.svg";
import ShelterTopGlow from "../components/shelter/ShelterTopGlow";

const MAX_LENGTH = 200;

const CARD_GRADIENT =
  "linear-gradient(-23deg, rgba(225,231,255,0.96) 2%, rgba(223,229,255,0.96) 96%)";

const DEFAULT_BODY =
  "원래 저 같은 경우에는 모든 일을 완벽하게 해내야 한다는 생각이 강해서 작은 실수에도 스스로를 많이 몰아붙이곤 했어요. 하지만 이 책을 읽으며 내가 통제할 수 없는 일들은 흘려보내도 괜찮다는 사실을 깨달았어요. 모든 결과를 내 힘으로 바꾸려 하기보다, 지금 내가 할 수 있는 일에 집중하는 것이 더 중요하다는 생각이 들었어요.";

export type MyThoughtLocationState = {
  title?: string;
  bookId?: string;
  body?: string;
  date?: string;
  authorName?: string;
};

/** 내 사유록 보기 · 공유 — 웹 Figma 738:4479 */
export default function ShelterMyThoughtPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const state = (location.state as MyThoughtLocationState | null) ?? null;

  const bookTitle = state?.title ?? "불안을 이기는 철학";
  const bookId = state?.bookId ?? "default";
  const body = state?.body?.trim() ? state.body : DEFAULT_BODY;
  const date = state?.date ?? "2026.06.25";
  const authorName = state?.authorName ?? "지훈";
  const [sheetOpen, setSheetOpen] = useState(false);

  const shareText = useMemo(
    () => `[${bookTitle}]\n${authorName} · ${date}\n\n${body}`,
    [authorName, body, bookTitle, date],
  );

  const goEdit = () => {
    navigate("/shelter/thoughts/write", {
      state: { title: bookTitle, bookId, body },
    });
  };

  const handleShare = () => {
    if (!isDesktop) {
      navigate("/shelter/thoughts/mine/share", {
        state: {
          title: bookTitle,
          bookId,
          body,
          date,
          authorName,
        },
      });
      return;
    }
    setSheetOpen(true);
  };

  return (
    <>
      {/* —— Mobile —— */}
      <main className="relative mx-auto h-dvh w-full max-w-[430px] overflow-hidden bg-[#f7f8fc] min-[431px]:hidden">
        <div className="relative z-10 mx-auto h-full w-full">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={SHELTER_BOARD_GRID_STYLE}
          />
          <ShelterTopGlow />

          <img
            src={detailPencil2}
            alt=""
            className="pointer-events-none absolute left-[-156px] top-[103px] z-[1] h-[89px] w-[230px] object-contain opacity-80"
          />
          <img
            src={detailPencil1}
            alt=""
            className="pointer-events-none absolute left-[82px] top-[87px] z-[1] h-[86px] w-[177px] rotate-[4.83deg] object-contain opacity-80"
          />

          <header className="absolute inset-x-0 top-0 z-40 px-5 pt-5">
            <div className="relative flex h-11 w-full items-center justify-center">
              <button
                type="button"
                aria-label="뒤로가기"
                onClick={() => navigate(-1)}
                className="absolute left-0 flex size-6 items-center justify-center"
              >
                <img
                  src={iconBackWeb}
                  alt=""
                  className="size-6 object-contain"
                />
              </button>
              <h1 className="w-full text-center text-h3 text-white">
                {bookTitle}
              </h1>
              <button
                type="button"
                aria-label="사유 수정"
                onClick={goEdit}
                className="absolute right-0 flex size-6 items-center justify-center"
              >
                <img src={iconPencil} alt="" className="size-5 object-contain" />
              </button>
            </div>
          </header>

          <img
            src={detailTape}
            alt=""
            className="pointer-events-none absolute left-1/2 top-[195px] z-30 h-[45px] w-[81px] -translate-x-1/2 object-contain"
          />

          <div className="absolute left-1/2 top-[233px] z-20 w-[353px] -translate-x-1/2">
            <article
              className="flex max-h-[calc(100dvh-233px-120px)] w-full flex-col items-center gap-[23px] overflow-y-auto overscroll-contain px-8 py-[41px]"
              style={{ backgroundImage: CARD_GRADIENT }}
            >
              <div className="relative flex w-full shrink-0 flex-col items-center">
                <img
                  src={detailAvatar}
                  alt=""
                  className="size-[77px] rounded-full object-cover"
                />
                <p className="mt-3 text-center text-[22px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
                  {authorName}
                </p>
                <p className="mt-1 text-center text-[16.8px] leading-[27.6px] tracking-[-0.025em] text-gray-400">
                  {date}
                </p>
              </div>
              <p className="w-full whitespace-pre-wrap text-center text-body1 leading-[1.6] text-gray-800">
                {body}
              </p>
            </article>
            <p className="mt-2 text-right text-caption text-gray-600">
              ({body.length}/{MAX_LENGTH})
            </p>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[86px] bg-[linear-gradient(3deg,#fff_9%,transparent_91%)]"
          />
          <div className="absolute inset-x-0 bottom-[33px] z-40 flex justify-center px-5">
            <Button
              text="사유록 공유하기"
              variant="primary"
              size="h-[54px] w-[353px] rounded-[16px] px-5 py-3"
              className="shadow-none"
              onClick={handleShare}
            />
          </div>
        </div>
      </main>

      {/* —— Web (Figma 738:4479) —— */}
      <main className="relative hidden h-dvh w-full overflow-hidden bg-[#f7f8fc] min-[431px]:block">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={SHELTER_BOARD_GRID_STYLE}
        />

        <img
          src={ellipse2468}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-362px] z-10 h-[944px] max-w-none -translate-x-1/2"
          style={{ width: "calc(100vw + 100px)" }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-40">
          <WebGnb
            active="shelter"
            tone="dark"
            className="pointer-events-auto relative bg-transparent"
          />
          <header className="flex items-center gap-5 px-8 pt-1 min-[1024px]:px-40">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={() => navigate(-1)}
              className="pointer-events-auto flex size-[42px] shrink-0 items-center justify-center"
            >
              <img
                src={iconBackWeb}
                alt=""
                className="size-[42px] object-contain"
              />
            </button>
            <h1 className="min-w-0 flex-1 truncate text-[32px] font-semibold leading-10 tracking-[-0.025em] text-[#fdfdff] min-[1100px]:text-[40px]">
              {bookTitle}
            </h1>
            <button
              type="button"
              aria-label="사유 수정"
              onClick={goEdit}
              className="pointer-events-auto flex size-[42px] shrink-0 items-center justify-center"
            >
              <img
                src={iconPencil}
                alt=""
                className="size-[28px] object-contain"
              />
            </button>
          </header>
        </div>

        <div className="absolute inset-x-0 top-[219px] bottom-[120px] z-30 overflow-y-auto overflow-x-hidden">
          <div className="relative mx-auto w-full max-w-[660px] px-4 pt-[30px] pb-8">
            <img
              src={detailTapeCenter}
              alt=""
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 z-30 h-[58px] w-[98px] -translate-x-1/2 object-contain"
            />

            <article
              className="relative z-20 flex w-full flex-col items-center gap-[28px] px-[38px] py-[39px]"
              style={{ backgroundImage: CARD_GRADIENT }}
            >
              <div className="flex w-full flex-col items-center">
                <img
                  src={detailAvatar}
                  alt=""
                  className="size-[92px] rounded-full object-cover"
                />
                <p className="mt-3 text-center text-[28px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
                  {authorName}
                </p>
                <p className="mt-1 text-center text-[20px] leading-[33px] tracking-[-0.025em] text-gray-400">
                  {date}
                </p>
              </div>
              <p className="w-full whitespace-pre-wrap text-center text-[18px] leading-[1.6] tracking-[-0.025em] text-gray-800">
                {body}
              </p>
            </article>

            <p className="mt-3 text-right text-[16px] leading-[1.6] tracking-[-0.025em] text-gray-600">
              ({body.length}/{MAX_LENGTH})
            </p>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-8 z-40 flex justify-center px-8">
          <Button
            text="사유록 공유하기"
            variant="primary"
            size="h-[65px] w-full max-w-[424px] rounded-[16px] px-5 py-3 text-[19.2px]"
            className="shadow-none"
            onClick={handleShare}
          />
        </div>
      </main>

      <ThoughtShareSheet
        open={sheetOpen}
        shareText={shareText}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
