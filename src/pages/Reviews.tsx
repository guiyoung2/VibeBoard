function Reviews() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">게임 후기</h1>
        
        <div className="space-y-6">
          {/* 추후 리뷰 카드로 교체 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
              <div>
                <h3 className="font-semibold">사용자 이름</h3>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <p className="text-gray-700">리뷰 내용이 들어갑니다</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reviews;

