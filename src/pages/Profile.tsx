function Profile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">마이페이지</h1>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-gray-300 rounded-full mr-6"></div>
            <div>
              <h2 className="text-2xl font-semibold">사용자 이름</h2>
              <p className="text-gray-600">user@example.com</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-600">프로필 정보가 여기에 표시됩니다</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;

