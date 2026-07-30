import { useState } from "react";
import NavigationBar, { type NavTab } from "../components/NavigationBar";
import Button from "../components/Button";

export default function TestPage() {
  const [activeTab, setActiveTab] = useState<NavTab>("mate");

  return (
    <main className="min-h-dvh bg-gray-0 px-6 pb-28 pt-10 text-gray-900 md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-16">
        <header className="flex flex-col gap-2">
          <p className="text-caption text-primary-500">Design System</p>
          <h1 className="text-display">O-lion Test Page</h1>
          <p className="text-body1 text-gray-500">
            Figma Typography · Main Colors · Gray Colors · Button 적용 확인
          </p>
        </header>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-h2">Button</h2>
            <p className="text-body2 text-gray-500">
              text/color/effect 고정 - size 변경 가능
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              text="버튼입니다"
              size="px-5 py-3"
              onClick={() => console.log("clicked")}
            />
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

      <div className="fixed inset-x-0 bottom-0 z-50 bg-[#fdfdff] pb-[env(safe-area-inset-bottom)] drop-shadow-[0_-4px_4.05px_rgba(38,39,43,0.04)]">
        <NavigationBar active={activeTab} onChange={setActiveTab} />
      </div>
    </main>
  );
}
