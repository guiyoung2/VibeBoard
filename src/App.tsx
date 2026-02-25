import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

const Home = lazy(() => import("./pages/Home"));
const Games = lazy(() => import("./pages/Games"));
const GameDetail = lazy(() => import("./pages/GameDetail"));
const Reviews = lazy(() => import("./pages/Reviews"));
const ReviewDetail = lazy(() => import("./pages/ReviewDetail"));
const ReviewCreate = lazy(() => import("./pages/ReviewCreate"));
const Cafes = lazy(() => import("./pages/Cafes"));
const Login = lazy(() => import("./pages/Login"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const NicknameSetup = lazy(() => import("./pages/NicknameSetup"));
const Profile = lazy(() => import("./pages/Profile"));

function App() {
  return (
    <div>
      <Layout>
        <div className="font-noonnu">
          <Suspense
            fallback={
              <div className="max-w-7xl mx-auto px-4 py-12 text-text-sub">
                페이지를 불러오는 중...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/games" element={<Games />} />
              <Route path="/games/:id" element={<GameDetail />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/reviews/create" element={<ReviewCreate />} />
              <Route path="/reviews/:id" element={<ReviewDetail />} />
              <Route path="/cafes" element={<Cafes />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/setup-nickname" element={<NicknameSetup />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Suspense>
        </div>
      </Layout>
    </div>
  );
}

export default App;
