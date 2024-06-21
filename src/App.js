import "./App.css";
import Headear from "./Headear";
import Menu from "./Menu";
import Dashboard from "./Dashboard";
import Footer from "./Footer";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Logout from "./Logout";
import Login from "./Login";
import Signup from "./signup";

function AppContent() {
  return (
    <div className="wrapper">
      <Headear />
      <Dashboard />
      <Menu />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        {/* <Route path="/forgetPassword" element={<RequestPasswordReset />} />
        <Route path="/verifyOtp" element={<VerifyOtp />} />
        <Route path="/resetPassword" element={<ResetPassword />} /> */}
        <Route path="/" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;
