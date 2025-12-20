import { useParams } from "react-router-dom";

function GameDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          보드게임 상세 {id && `(ID: ${id})`}
        </h1>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="w-full h-96 bg-gray-200 rounded mb-6"></div>
          <p className="text-gray-600">보드게임 상세 정보가 여기에 들어갑니다</p>
        </div>
      </div>
    </div>
  );
}

export default GameDetail;

