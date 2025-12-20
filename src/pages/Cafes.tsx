function Cafes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          주변 보드게임 매장 찾기
        </h1>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="w-full h-96 bg-gray-200 rounded mb-6">
            <p className="flex items-center justify-center h-full text-gray-500">
              지도가 여기에 표시됩니다 (Mapbox)
            </p>
          </div>
          <p className="text-gray-600">카페 검색 및 지도 기능이 여기에 들어갑니다</p>
        </div>
      </div>
    </div>
  );
}

export default Cafes;

