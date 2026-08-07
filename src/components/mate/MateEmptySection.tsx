import emptyOwl from "../../assets/mate/empty-owl.png";

export default function MateEmptySection() {
  return (
    <section className="mt-[136px] flex flex-col items-center px-5">
      <div className="size-[120px] overflow-hidden">
        <img
          src={emptyOwl}
          alt=""
          className="size-full object-contain object-bottom opacity-[0.86]"
        />
      </div>
      <h2 className="mt-[28px] text-center text-[20px] font-bold leading-7 tracking-[-0.025em] text-gray-800">
        아직 고른 책이 없어요
      </h2>
      <p className="mt-2 text-center text-body2 text-gray-400">
        내 마음을 들여다보고
        <br />딱 맞는 위로의 문장을 선물 받아보세요.
      </p>
    </section>
  );
}
