import ProfileSubLayout from "../../components/profile/ProfileSubLayout";

const SECTIONS = [
  {
    title: "제1조 (목적)",
    body: `본 약관은 ReadMate가 제공하는 제반 서비스의 이용과 관련하여 회사와 회원과의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.`,
  },
  {
    title: "제2조 (정의)",
    body: `1. "서비스"라 함은 구현되는 단말기와 상관없이 "회원"이 이용할 수 있는 ReadMate 관련 제반 서비스를 의미합니다.
2. "회원"이라 함은 회사의 "서비스"에 접속하여 본 약관에 따라 "회사"와 이용계약을 체결하고 "회사"가 제공하는 "서비스"를 이용하는 고객을 말합니다.`,
  },
] as const;

export default function TermsPage() {
  return (
    <ProfileSubLayout title="서비스 이용약관" contentClassName="px-5 pt-5 pb-8">
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

        <p className="text-caption leading-[18px] text-gray-300">
          이용약관과 관련하여 궁금하신 사항은 고객센터로 문의하거나
          <br />
          1:1 문의하기를 이용해 주시기 바랍니다.
        </p>
      </div>
    </ProfileSubLayout>
  );
}
