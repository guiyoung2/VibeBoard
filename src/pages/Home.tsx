import { Link } from "react-router-dom";
import HeroSlider from "../components/HeroSlider";

function Home() {
  // 인기 보드게임 이름 목록 (Supabase의 name 값과 정확히 일치해야 함)
  const featuredGameNames = ["할리갈리", "루미큐브", "스컬킹"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 인기 보드게임 히어로 섹션 */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            인기 보드게임
          </h2>
          <HeroSlider gameNames={featuredGameNames} />
        </section>

        {/* 주변 매장 찾기 섹션 */}
        <section>
          <div
            className="rounded-lg shadow-lg px-8 py-12 md:px-12 md:py-16"
            style={{ backgroundColor: "oklch(0.93 0.04 223.27)" }}
          >
            <div className="flex flex-col justify-center md:flex-row items-center gap-8 md:gap-12">
              {/* 이미지 영역 */}
              <div className="flex-shrink-0">
                <img
                  src="/near_map.png"
                  alt="주변 매장 지도"
                  className="w-48 md:w-64 h-auto object-contain"
                />
              </div>

              {/* 텍스트 및 버튼 영역 */}
              <div className="flex flex-col justify-center text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  주변 매장을 찾아보세요!
                </h2>
                <p className="text-gray-700 mb-6 text-lg">
                  가까운 보드게임 카페를 지도에서 확인하고 방문해보세요
                </p>
                <Link
                  to="/cafes"
                  className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg border border-blue-300 font-semibold hover:bg-blue-600 hover:text-white transition-colors shadow-md w-fit mx-auto md:mx-0"
                >
                  매장 찾기
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
