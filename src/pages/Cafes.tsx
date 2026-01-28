function Cafes() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-text-main mb-8">
          주변 보드게임 매장 찾기
        </h1>

        <div className="bg-bg-card p-8 rounded-lg shadow-card border border-border">
          <div className="w-full h-96 bg-bg-muted rounded mb-6">
            <p className="flex items-center justify-center h-full text-text-sub">
              지도가 여기에 표시됩니다 (Mapbox)
            </p>
          </div>
          <p className="text-text-sub">
            카페 검색 및 지도 기능이 여기에 들어갑니다
          </p>
        </div>
      </div>
    </div>
  );
}

export default Cafes;
