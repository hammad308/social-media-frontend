import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Notification from "./pages/Notifications";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/protectedRoute";
import PublicProfile from "./pages/PublicProfile";
import Search from "./pages/Search";
import OAuthSuccess from "./pages/OAuthSuccess";
import PostDetail from "./pages/PostDetails";
import FollowersDetails from "./pages/FollowersDetails";
import FollowingDetails from "./pages/FollowingDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } >
        </Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/oauth-success" element={<OAuthSuccess />}></Route>
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>}>
        </Route>
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notification />
          </ProtectedRoute>}>
        </Route>
        <Route path="/chat" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>}>
        </Route>
        <Route path="/search" element={
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>}>
        </Route>
        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <PublicProfile />
          </ProtectedRoute>}>
        </Route>
        <Route path="/followers/:id" element={
          <ProtectedRoute>
            <FollowersDetails />
          </ProtectedRoute>}>
        </Route>
        <Route path="/posts/:id" element={
          <ProtectedRoute>
            <PostDetail />
          </ProtectedRoute>}>
        </Route>
        <Route path="/following/:id" element={
          <ProtectedRoute>
            <FollowingDetails />
          </ProtectedRoute>}>
        </Route>
      </Routes>
    </BrowserRouter>

  );
}

export default App;
