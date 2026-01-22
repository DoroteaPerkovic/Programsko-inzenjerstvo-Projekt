import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./stranice/Login";
import Admin from "./stranice/Admin";
import Predstavnik from "./stranice/Predstavnik";
import Suvlasnici from "./stranice/Suvlasnici";
import SastanakAdd from "./stranice/sastanakAdd";
import Profil from "./stranice/Profil";
import Zakljucak from "./stranice/Zakljucak";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/predstavnik"
          element={
            <ProtectedRoute>
              <Navigate to="/predstavnik/objavljeni" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/predstavnik/:category"
          element={
            <ProtectedRoute>
              <Predstavnik />
            </ProtectedRoute>
          }
        />

        <Route
          path="/suvlasnici"
          element={
            <ProtectedRoute>
              <Navigate to="/suvlasnici/objavljeni" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suvlasnici/:category"
          element={
            <ProtectedRoute>
              <Suvlasnici />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sastanakAdd"
          element={
            <ProtectedRoute>
              <SastanakAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <Profil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/zakljucak"
          element={
            <ProtectedRoute>
              <Zakljucak />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

