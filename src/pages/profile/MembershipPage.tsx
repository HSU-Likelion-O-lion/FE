import { useState, type ReactNode } from "react";
import Button from "../../components/Button";
import ProfileSubLayout from "../../components/profile/ProfileSubLayout";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import membershipOwl from "../../assets/shelter/empty-owl.png";
import iconHeart from "../../assets/profile/icon-membership-heart.svg";
import iconPin from "../../assets/profile/icon-membership-pin.svg";
import iconChart from "../../assets/profile/icon-membership-chart.svg";
import iconPdf from "../../assets/profile/icon-membership-pdf.svg";
import iconCover from "../../assets/profile/icon-membership-cover.svg";

type PlanId = "standard" | "plus" | "premium";

type PlanBenefit = {
  icon: string;
  iconSize?: "sm" | "md";
  label: string;
};

type Plan = {
  id: PlanId;
  badge: string;
  title: string;
  priceNode: ReactNode;
  benefits: PlanBenefit[];
};

const PLANS: Plan[] = [
  {
    id: "standard",
    badge: "쓰담 Standard",
    title: "기본적인 기능 제공",
    priceNode: (
      <span className="text-[18px] font-semibold text-primary-500 min-[431px]:text-[23px]">
        무료
      </span>
    ),
    benefits: [
      { icon: iconHeart, label: "하루 최대 1회 진단" },
      { icon: iconPin, iconSize: "sm", label: "메이트 핀 고정 갯수 제한 3개" },
      { icon: iconChart, label: "일주일 독서 통계 시간 조회" },
    ],
  },
  {
    id: "plus",
    badge: "쓰담 plus",
    title: "확장 기능 제공",
    priceNode: (
      <>
        <span className="text-body2 font-normal text-gray-400 min-[431px]:text-[18px]">
          월{" "}
        </span>
        <span className="text-[18px] font-semibold text-primary-500 min-[431px]:text-[23px]">
          2900
        </span>
        <span className="text-[18px] font-normal text-primary-500 min-[431px]:text-[23px] min-[431px]:font-medium">
          원
        </span>
      </>
    ),
    benefits: [
      { icon: iconHeart, label: "하루 최대 5회 진단" },
      { icon: iconPin, iconSize: "sm", label: "메이트 핀 고정 갯수 제한 5개" },
      { icon: iconChart, label: "독서 통계 시간 조회 1개월 확대" },
    ],
  },
  {
    id: "premium",
    badge: "쓰담 Premium",
    title: "무제한 플러스 기능 제공",
    priceNode: (
      <>
        <span className="text-body2 font-normal text-gray-400 min-[431px]:text-[18px]">
          월{" "}
        </span>
        <span className="text-[18px] font-semibold text-primary-500 min-[431px]:text-[23px]">
          4900
        </span>
        <span className="text-[18px] font-normal text-primary-500 min-[431px]:text-[23px] min-[431px]:font-medium">
          원
        </span>
      </>
    ),
    benefits: [
      { icon: iconHeart, label: "하루 무제한 진단" },
      { icon: iconPin, iconSize: "sm", label: "메이트 핀 고정 갯수 제한 7개" },
      { icon: iconPdf, label: "PDF 내보내기시 워터마크 제거" },
      { icon: iconCover, label: "프리미엄 북커버" },
    ],
  },
];

/** 쓰담 멤버십 — 모바일 Figma 829:4569 / 웹 837:4357 */
export default function MembershipPage() {
  const isDesktop = useIsDesktop();
  const [selected, setSelected] = useState<PlanId>("standard");

  const handleSave = () => {
    // TODO: 결제/구독 API 연동
    window.alert(
      selected === "standard"
        ? "쓰담 Standard로 저장되었습니다."
        : selected === "plus"
          ? "쓰담 plus로 업그레이드 요청이 준비되었습니다."
          : "쓰담 Premium으로 업그레이드 요청이 준비되었습니다.",
    );
  };

  return (
    <ProfileSubLayout
      title="쓰담 멤버십"
      contentClassName={isDesktop ? "relative" : ""}
      footer={
        <div
          className={
            isDesktop
              ? "pointer-events-none sticky bottom-0 z-20 flex justify-center bg-gradient-to-t from-[#fdfdff] from-[75%] to-transparent px-6 pb-6 pt-10"
              : "z-20 bg-gradient-to-t from-[#fdfdff]/[81%] from-[75%] to-transparent px-5 pb-[calc(22px+env(safe-area-inset-bottom))] pt-8"
          }
        >
          <div className="pointer-events-auto w-full max-w-[465px]">
            <Button
              text={isDesktop ? "저장하기" : "업그레이드 하기"}
              variant="primary"
              size={
                isDesktop
                  ? "h-[71px] w-full rounded-[21px] px-6 py-4 text-[28px]"
                  : "h-[54px] w-full rounded-[16px] px-5 py-3 text-body1 font-semibold"
              }
              className="shadow-none"
              onClick={handleSave}
            />
          </div>
        </div>
      }
    >
      <div
        className={
          isDesktop
            ? "mx-auto w-full max-w-[655px] px-6 pb-8 pt-6"
            : "relative px-5 pb-2 pt-4"
        }
      >
        <div
          className={
            isDesktop
              ? "relative flex items-start justify-between gap-4 pr-[120px]"
              : "relative pr-[120px]"
          }
        >
          <div className="min-w-0">
            <h2
              className={
                isDesktop
                  ? "text-[29px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900"
                  : "text-[22px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900"
              }
            >
              쓰담 멤버십을 업그레이드 할까요?
            </h2>
            <p
              className={
                isDesktop
                  ? "mt-2 text-[18.5px] leading-[1.6] tracking-[-0.025em] text-gray-500"
                  : "mt-1.5 text-body2 text-gray-500"
              }
            >
              멤버십을 업그레이드하고 다양한 혜택을
              <br />
              누려보세요!
            </p>
          </div>
          <img
            src={membershipOwl}
            alt=""
            className={
              isDesktop
                ? "pointer-events-none absolute right-0 top-6 h-[160px] w-[148px] object-contain object-bottom"
                : "pointer-events-none absolute -right-1 top-[66px] z-10 h-[148px] w-[136px] object-contain object-bottom"
            }
          />
        </div>

        <div
          className={
            isDesktop
              ? "mt-10 flex flex-col gap-[35px]"
              : "mt-10 flex flex-col gap-7"
          }
        >
          {PLANS.map((plan) => {
            const active = selected === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelected(plan.id)}
                className={`w-full text-left transition ${
                  isDesktop
                    ? `rounded-[16px] bg-[#fdfdff] py-4 shadow-[0_0_2.64px_rgba(29,29,32,0.11)] ${
                        active ? "ring-2 ring-primary-500" : "ring-0"
                      }`
                    : `rounded-[12px] px-5 py-3 ${
                        active
                          ? "bg-primary-10 shadow-[0_0_3px_#5d6bc4]"
                          : "bg-[#fdfdff] shadow-[0_0_2px_rgba(29,29,32,0.11)]"
                      }`
                }`}
                aria-pressed={active}
              >
                <div
                  className={
                    isDesktop
                      ? "border-b border-gray-100 px-[26px] pb-5"
                      : "flex w-full flex-col gap-1.5 border-b border-gray-100 px-5 pb-4"
                  }
                >
                  <span
                    className={
                      isDesktop
                        ? "inline-flex items-center rounded-full bg-primary-10 px-3.5 py-1 text-[16px] leading-[24px] tracking-[-0.025em] text-primary-500"
                        : "inline-flex w-fit items-center rounded-[15px] bg-primary-10 px-2.5 py-1 text-caption leading-[18px] text-primary-500"
                    }
                  >
                    {plan.badge}
                  </span>
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={
                        isDesktop
                          ? "text-[24px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900"
                          : "text-h3 text-gray-900"
                      }
                    >
                      {plan.title}
                    </p>
                    <p className="shrink-0 whitespace-nowrap text-right leading-[1.5] tracking-[-0.025em]">
                      {plan.priceNode}
                    </p>
                  </div>
                </div>

                <ul
                  className={
                    isDesktop
                      ? "flex flex-col gap-3 px-[26px] pt-3"
                      : "flex flex-col gap-[9px] pt-[9px]"
                  }
                >
                  {plan.benefits.map((benefit) => (
                    <li
                      key={benefit.label}
                      className="flex items-center gap-2 min-[431px]:gap-3"
                    >
                      <span
                        className={`flex shrink-0 items-center justify-center ${
                          benefit.iconSize === "sm"
                            ? "size-[18px] min-[431px]:size-6"
                            : "size-6 min-[431px]:size-7"
                        }`}
                      >
                        <img
                          src={benefit.icon}
                          alt=""
                          className="size-full object-contain"
                        />
                      </span>
                      <span className="text-body2 leading-[1.6] tracking-[-0.025em] text-gray-700 min-[431px]:text-[18px]">
                        {benefit.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </div>
    </ProfileSubLayout>
  );
}
