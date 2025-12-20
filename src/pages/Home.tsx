function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            VibeBoard
          </h1>
          <p className="text-xl text-gray-600">
            보드게임을 찾고, 리뷰를 읽고, 주변 매장을 발견하세요
          </p>
        </div>

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

        {/* 최신 리뷰 섹션 */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            최신 리뷰
          </h2>
          <div className="space-y-4">
            {/* 추후 리뷰 카드로 교체 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600">리뷰 내용이 들어갑니다</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;

