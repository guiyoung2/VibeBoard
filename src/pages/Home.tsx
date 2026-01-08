import { Link } from "react-router-dom";
import HeroSlider from "../components/HeroSlider";

function Home() {
  // 인기 보드게임 이름 목록 (Supabase의 name 값과 정확히 일치해야 함)
  const featuredGameNames = ["할리갈리", "루미큐브", "스컬킹"];

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 인기 보드게임 히어로 섹션 */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-primary mb-6">
            🔥 지금 인기 있는 보드게임
          </h2>
          <HeroSlider gameNames={featuredGameNames} />
        </section>

        {/* 주변 매장 찾기 섹션 */}
        <section>
          <div className="relative rounded-xl shadow-card overflow-hidden bg-bg-muted">
            {/* 배경 장식 요소 */}

            <div className="relative px-8 py-12 md:px-12 md:py-16">
              <div className="flex flex-col justify-center md:flex-row items-center gap-8 md:gap-12">
                {/* 이미지 영역 */}
                <div className="flex-shrink-0 relative z-10">
                  <div className="p-4 rounded-lg shadow-md">
                    <img
                      src="/near_map.png"
                      alt="주변 매장 지도"
                      className="w-48 md:w-64 h-auto object-contain"
                    />
                  </div>
                </div>

                {/* 텍스트 및 버튼 영역 */}
                <div className="flex flex-col justify-center text-center md:text-left relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                    주변 매장을 찾아보세요!
                  </h2>
                  <p className="text-text-sub mb-8 text-lg leading-relaxed">
                    가까운 보드게임 카페를 지도에서 확인하고 방문해보세요
                  </p>
                  <Link
                    to="/cafes"
                    style={{ backgroundColor: "#EF4444" }}
                    className="inline-block text-white px-10 py-4 rounded-lg font-semibold hover:opacity-90 hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md w-fit mx-auto md:mx-0"
                  >
                    매장 찾기 →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
