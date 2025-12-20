import { useSearchParams } from "react-router-dom";

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          검색 결과 {query && `: "${query}"`}
        </h1>
        
        <div className="space-y-6">
          <p className="text-gray-600">
            검색 결과가 여기에 표시됩니다
          </p>
        </div>
      </div>
    </div>
  );
}

export default Search;

