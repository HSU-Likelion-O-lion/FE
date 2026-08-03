import { useState } from "react";
import NavigationBar, { type NavTab } from "../components/NavigationBar";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal, {
  type ModalAction,
  type ModalStatus,
} from "../components/Modal";
import ModalOptionList, {
  PAUSE_REASON_OPTIONS,
} from "../components/ModalOptionList";

type AlertDemo = {
  id: string;
  label: string;
  status: ModalStatus;
  title: string;
  description: string;
  actions: Omit<ModalAction, "onClick">[];
};

const ALERT_DEMOS: AlertDemo[] = [
  {
    id: "unread-record",
    label: "읽다만 기록",
    status: "info",
    title: "읽다만 기록이 있어요.",
    description: "이전에 측정하던 집중 시간이 저장되어 있습니다",
    actions: [
      { label: "중단하기", variant: "outline" },
      { label: "이어서 읽기", variant: "primary" },
    ],
  },
  {
    id: "shelter-ask",
    label: "쉼터에도 남길까",
    status: "info",
    title: "이 문장을 쉼터에도 남길까요?",
    description:
      "익명의 생각 하나가 누군가에게는 큰 위로가 될 수 있습니다.",
    actions: [
      { label: "나만 보기", variant: "outline" },
      { label: "쉼터에 남기기", variant: "primary" },
    ],
  },
  {
    id: "library-saved",
    label: "문장 서재 보관",
    status: "success",
    title: "문장을 서재에 보관하였어요.",
    description: "당신의 마음이 한 페이지 남겨졌어요.",
    actions: [{ label: "계속하기", variant: "primary" }],
  },
  {
    id: "shelter-saved",
    label: "쉼터에 남기기",
    status: "success",
    title: "문장을 쉼터에 남겨놨어요.",
    description: "언젠가 이 문장이 누군가를 미소 짓게 할지도 몰라요.",
    actions: [{ label: "계속하기", variant: "primary" }],
  },
  {
    id: "thought-saved",
    label: "사유 띄움",
    status: "success",
    title: "사유가 쉼터에 조용히 띄워졌어요.",
    description: "언젠가 이 문장이 누군가를 미소 짓게 할지도 몰라요.",
    actions: [{ label: "확인", variant: "primary" }],
  },
  {
    id: "all-read",
    label: "사유 다 읽음",
    status: "info",
    title: "모든 사유를 다 읽었습니다.",
    description: "지훈님의 여운도 이곳에 남겨보는건 어떤가요?",
    actions: [
      { label: "닫기", variant: "outline" },
      { label: "사유 남기기", variant: "primary" },
    ],
  },
  {
    id: "bad-word",
    label: "부적절한 단어",
    status: "warning",
    title: "부적절한 단어가 사용되었어요.",
    description: "타인에게 상처가 될 수 있는 말은 삼가해주세요.",
    actions: [{ label: "확인", variant: "primary" }],
  },
  {
    id: "break-time",
    label: "쉬어가는 시간",
    status: "warning",
    title: "잠시 쉬어가는 시간이에요.",
    description: "단기간에 너무 많은 사유를 남기셨습니다.",
    actions: [{ label: "확인", variant: "primary" }],
  },
  {
    id: "mate-required",
    label: "메이트 확인",
    status: "warning",
    title: "잠깐, 메이트는 하고오셨나요?",
    description: "하루 독서를 완료한 분만 쉼터를 이용할 수 있습니다.",
    actions: [{ label: "메이트로 돌아가기", variant: "primary" }],
  },
];

export default function TestPage() {
  const [activeTab, setActiveTab] = useState<NavTab>("drawer");
  const [inputValue, setInputValue] = useState("");
  const [showError, setShowError] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);
  const [defaultModalOpen, setDefaultModalOpen] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string>();

  const activeAlert = ALERT_DEMOS.find((demo) => demo.id === activeAlertId);

  return (
    <main className="min-h-dvh bg-gray-0 px-6 pb-28 pt-10 text-gray-900 md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-16">
        <header className="flex flex-col gap-2">
          <p className="text-caption text-primary-500">Design System</p>
          <h1 className="text-display">O-lion Test Page</h1>
          <p className="text-body1 text-gray-500">
            Figma Typography · Main Colors · Gray Colors · Button · Modal 적용
            확인
          </p>
        </header>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-h2">Modal</h2>
            <p className="text-body2 text-gray-500">
              default(옵션 리스트) · alert(info / success / warning)
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-body2 font-semibold text-gray-800">
              variant=&quot;default&quot;
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                text="옵션 리스트 모달"
                size="px-5 py-3"
                onClick={() => setDefaultModalOpen(true)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-body2 font-semibold text-gray-800">
              variant=&quot;alert&quot; · Figma Modal
            </p>
            <div className="flex flex-wrap gap-3">
              {ALERT_DEMOS.map((demo) => (
                <Button
                  key={demo.id}
                  text={demo.label}
                  size="px-5 py-3"
                  onClick={() => setActiveAlertId(demo.id)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-h2">Input</h2>
            <p className="text-body2 text-gray-500">
              기본 → 포커스 → 입력완료 → 오류
            </p>
          </div>
          <div className="flex max-w-[313px] flex-col gap-3">
            <Input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (showError) setShowError(false);
              }}
              error={showError}
              placeholder="입력해주세요."
            />
            <Button
              text={showError ? "오류 해제" : "오류 상태로"}
              size="px-5 py-3"
              onClick={() => setShowError((prev) => !prev)}
            />
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-h2">Button</h2>
            <p className="text-body2 text-gray-500">
              1 선택형(default) · 2 채움 CTA(primary N/Y) · outline
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button text="버튼입니다" size="px-5 py-3" />
              <Button text="버튼입니다" size="px-5 py-3" active />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                text="버튼입니다"
                variant="primary"
                disabled
                size="h-[50px] px-5 py-3"
              />
              <Button
                text="버튼입니다"
                variant="primary"
                size="h-[50px] px-5 py-3"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                text="중단하기"
                variant="outline"
                size="h-[52px] px-5 py-3"
              />
              <Button
                text="이어서 읽기"
                variant="primary"
                size="h-[52px] px-5 py-3"
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-h2">Typography</h2>
            <p className="text-body2 text-gray-500">
              Pretendard · letter-spacing -2.5%
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <div className="grid items-center gap-3 border-b border-gray-100 px-4 py-4 md:grid-cols-[120px_1fr_auto]">
              <span className="text-body2 text-primary-500">DisPlay</span>
              <span className="text-caption text-gray-400">
                32 / 40 / -2.5%
              </span>
              <p className="text-display md:justify-self-end">Lorem ipsum</p>
            </div>
            <div className="grid items-center gap-3 border-b border-gray-100 px-4 py-4 md:grid-cols-[120px_1fr_auto]">
              <span className="text-body2 text-primary-500">H1</span>
              <span className="text-caption text-gray-400">
                28 / 36 / -2.5%
              </span>
              <p className="text-h1 md:justify-self-end">Lorem ipsum</p>
            </div>
            <div className="grid items-center gap-3 border-b border-gray-100 px-4 py-4 md:grid-cols-[120px_1fr_auto]">
              <span className="text-body2 text-primary-500">H2</span>
              <span className="text-caption text-gray-400">
                22 / 30 / -2.5%
              </span>
              <p className="text-h2 md:justify-self-end">Lorem ipsum</p>
            </div>
            <div className="grid items-center gap-3 border-b border-gray-100 px-4 py-4 md:grid-cols-[120px_1fr_auto]">
              <span className="text-body2 text-primary-500">H3</span>
              <span className="text-caption text-gray-400">
                18 / 26 / -2.5%
              </span>
              <p className="text-h3 md:justify-self-end">Lorem ipsum</p>
            </div>
            <div className="grid items-center gap-3 border-b border-gray-100 px-4 py-4 md:grid-cols-[120px_1fr_auto]">
              <span className="text-body2 text-primary-500">Body1</span>
              <span className="text-caption text-gray-400">
                16 / 24 / -2.5%
              </span>
              <p className="text-body1 md:justify-self-end">Lorem ipsum</p>
            </div>
            <div className="grid items-center gap-3 border-b border-gray-100 px-4 py-4 md:grid-cols-[120px_1fr_auto]">
              <span className="text-body2 text-primary-500">Button</span>
              <span className="text-caption text-gray-400">
                16 / 20 / -2.5%
              </span>
              <p className="text-button md:justify-self-end">Lorem ipsum</p>
            </div>
            <div className="grid items-center gap-3 border-b border-gray-100 px-4 py-4 md:grid-cols-[120px_1fr_auto]">
              <span className="text-body2 text-primary-500">Body2</span>
              <span className="text-caption text-gray-400">
                14 / 20 / -2.5%
              </span>
              <p className="text-body2 md:justify-self-end">Lorem ipsum</p>
            </div>
            <div className="grid items-center gap-3 px-4 py-4 md:grid-cols-[120px_1fr_auto]">
              <span className="text-body2 text-primary-500">Caption</span>
              <span className="text-caption text-gray-400">
                12 / 26 / -2.5%
              </span>
              <p className="text-caption md:justify-self-end">Lorem ipsum</p>
            </div>
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-h2">Main Colors</h2>
              <p className="text-body2 text-gray-500">
                primary-10 ~ primary-900
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <div className="flex h-12 items-center justify-between bg-primary-10 px-4 text-caption text-gray-900">
                <span>10</span>
                <span>#EFF0F9</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-primary-50 px-4 text-caption text-gray-900">
                <span>50</span>
                <span>#DFE1F3</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-primary-100 px-4 text-caption text-gray-900">
                <span>100</span>
                <span>#CED3ED</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-primary-200 px-4 text-caption text-gray-900">
                <span>200</span>
                <span>#BEC4E7</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-primary-300 px-4 text-caption text-gray-900">
                <span>300</span>
                <span>#9EA6DC</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-primary-400 px-4 text-caption text-gray-0">
                <span>400</span>
                <span>#7D89D0</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-primary-500 px-4 text-caption text-gray-0">
                <span>500</span>
                <span>#5D6BC4</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-primary-600 px-4 text-caption text-gray-0">
                <span>600</span>
                <span>#4A569D</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-primary-700 px-4 text-caption text-gray-0">
                <span>700</span>
                <span>#384076</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-primary-800 px-4 text-caption text-gray-0">
                <span>800</span>
                <span>#252B4E</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-primary-900 px-4 text-caption text-gray-0">
                <span>900</span>
                <span>#1C203B</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-h2">Gray Colors</h2>
              <p className="text-body2 text-gray-500">gray-0 ~ gray-900</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <div className="flex h-12 items-center justify-between bg-gray-0 px-4 text-caption text-gray-900">
                <span>0</span>
                <span>#FFFFFF</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-gray-50 px-4 text-caption text-gray-900">
                <span>50</span>
                <span>#F5F6FA</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-gray-100 px-4 text-caption text-gray-900">
                <span>100</span>
                <span>#E6E8F0</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-gray-200 px-4 text-caption text-gray-900">
                <span>200</span>
                <span>#CDD0DC</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-gray-300 px-4 text-caption text-gray-900">
                <span>300</span>
                <span>#A9ADBE</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-gray-400 px-4 text-caption text-gray-0">
                <span>400</span>
                <span>#868AA0</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-gray-500 px-4 text-caption text-gray-0">
                <span>500</span>
                <span>#666A80</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-gray-600 px-4 text-caption text-gray-0">
                <span>600</span>
                <span>#4E5266</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-gray-700 px-4 text-caption text-gray-0">
                <span>700</span>
                <span>#3A3D4D</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-gray-800 px-4 text-caption text-gray-0">
                <span>800</span>
                <span>#262838</span>
              </div>
              <div className="flex h-12 items-center justify-between bg-gray-900 px-4 text-caption text-gray-0">
                <span>900</span>
                <span>#16171F</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Modal
        open={defaultModalOpen}
        title="잠시 멈추셨네요!"
        description={
          <>
            독서를 멈춘 이유를 알려주시면 더 나은 집중 환경을
            <br />
            만들어드릴게요.
          </>
        }
        onClose={() => {
          setDefaultModalOpen(false);
          setSelectedOptionId(undefined);
        }}
      >
        <ModalOptionList
          options={PAUSE_REASON_OPTIONS}
          selectedId={selectedOptionId}
          onSelect={(id) => {
            setSelectedOptionId(id);
            window.setTimeout(() => {
              setDefaultModalOpen(false);
              setSelectedOptionId(undefined);
            }, 180);
          }}
        />
      </Modal>

      {activeAlert && (
        <Modal
          open
          variant="alert"
          status={activeAlert.status}
          title={activeAlert.title}
          description={activeAlert.description}
          onClose={() => setActiveAlertId(null)}
          actions={activeAlert.actions.map((action) => ({
            ...action,
            onClick: () => setActiveAlertId(null),
          }))}
        />
      )}

      <div className="fixed inset-x-0 bottom-0 z-50 bg-white pb-[env(safe-area-inset-bottom)] drop-shadow-[0_-4px_4.05px_rgba(38,39,43,0.04)]">
        <NavigationBar active={activeTab} onChange={setActiveTab} />
      </div>
    </main>
  );
}
