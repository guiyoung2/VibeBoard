import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 인기 보드게임 섹션 */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            인기 보드게임
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 추후 보드게임 카드로 교체 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">보드게임 1</h3>
              <p className="text-sm text-gray-600">설명이 들어갑니다</p>
            </div>
          </div>
        </section>

        {/* 주변 매장 찾기 섹션 */}
        <section>
          <div
            className="rounded-lg shadow-lg px-12 py-16 text-center border border-gray-200"
            style={{ backgroundColor: "oklch(0.93 0.04 223.27)" }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              주변 매장을 찾아보세요!
            </h2>
            <p className="text-gray-700 mb-6 text-lg">
              가까운 보드게임 카페를 지도에서 확인하고 방문해보세요
            </p>
            <Link
              to="/cafes"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg border border-blue-300 font-semibold hover:bg-blue-600 hover:text-white transition-colors shadow-md"
            >
              매장 찾기
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
