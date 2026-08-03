import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import ProfileSubLayout from "../../components/profile/ProfileSubLayout";

const BACKUP_ROWS = [
  { label: "마지막 동기화", value: "2026. 07. 31 오전 3: 58" },
  { label: "백업 기기 OS", value: "iOS" },
  { label: "백업 동기화", value: "자동 동기화" },
] as const;

export default function BackupSyncPage() {
  const navigate = useNavigate();

  return (
    <ProfileSubLayout
      title="데이터 백업 및 동기화"
      footer={
        <div className="px-5 pb-[calc(32px+env(safe-area-inset-bottom))] pt-4">
          <Button
            text="지금 동기화하기"
            variant="primary"
            className="h-[54px] w-full"
            onClick={() => navigate(-1)}
          />
        </div>
      }
    >
      <section className="px-5 pt-5">
        <div className="flex flex-col rounded-2xl bg-gray-50 py-1.5">
          {BACKUP_ROWS.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 px-5 py-[8.5px]"
            >
              <span className="shrink-0 text-body2 leading-[23px] text-gray-900">
                {row.label}
              </span>
              <span className="text-right text-body2 leading-[23px] text-gray-900">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-caption leading-[18px] text-[#6b7280]">
          • 대화 백업 후 14일 이내에 재설치 시 동일한 계정으로 로그인해야
          <br />
          &nbsp;&nbsp;&nbsp;복원할 수 있습니다.
        </p>
      </section>
    </ProfileSubLayout>
  );
}
