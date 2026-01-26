import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import Reviews from "./pages/Reviews";
import ReviewDetail from "./pages/ReviewDetail";
import ReviewCreate from "./pages/ReviewCreate";
import Cafes from "./pages/Cafes";
import Search from "./pages/Search";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import NicknameSetup from "./pages/NicknameSetup";
import Profile from "./pages/Profile";

function App() {
  return (
    <div>
      <Layout>
        <div className="font-noonnu">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:id" element={<GameDetail />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/reviews/create" element={<ReviewCreate />} />
            <Route path="/reviews/:id" element={<ReviewDetail />} />
            <Route path="/cafes" element={<Cafes />} />
            <Route path="/search" element={<Search />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/setup-nickname" element={<NicknameSetup />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </Layout>
    </div>
  );
}

export default App;
