import ProfileSubLayout from "../../components/profile/ProfileSubLayout";

const SECTIONS = [
  {
    title: "1. 수집하는 개인정보 항목",
    body: `회사는 회원가입, 원활한 고객상담, 각종 서비스의 제공을 위해 최초 회원가입 당시 아래와 같은 개인정보를 수집하고 있습니다.
 - 필수항목: 이메일 주소, 비밀번호, 닉네임`,
  },
  {
    title: "2. 개인정보 수집 및 이용 목적",
    body: `회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.
 - 서비스 제공에 관한 계약 이행 및 콘텐츠 제공
 - 회원 관리 및 본인 확인`,
  },
] as const;

export default function PrivacyPage() {
  return (
    <ProfileSubLayout title="개인정보처리방침" contentClassName="px-5 pt-5 pb-8">
      <div className="flex flex-col gap-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-body1 font-medium text-gray-800">
              {section.title}
            </h2>
            <p className="mt-2 whitespace-pre-line text-body2 leading-[23px] text-gray-500">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </ProfileSubLayout>
  );
}
