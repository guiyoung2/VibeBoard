function Games() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">게임 추천</h1>
        
        {/* 필터 섹션 */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <p className="text-gray-600">필터 기능이 여기에 들어갑니다</p>
        </div>

        {/* 게임 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 추후 보드게임 카드로 교체 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">보드게임 제목</h3>
            <p className="text-gray-600">보드게임 설명</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Games;

