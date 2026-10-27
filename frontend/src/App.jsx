
import { useState } from "react";
import "./App.css";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import TeamList from "./pages/TeamList";
import TeamForm from "./pages/TeamForm";
import MemberList from "./pages/MemberList";
import AddMemberForm from "./pages/AddMemberForm";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

export default function App() {
  const [page, setPage] = useState("Home");

  function renderPage() {
    switch (page) {
      case "Home":
        return <Home setPage={setPage} />;

      case "SignIn":
        return <SignIn setPage={setPage} />;

      case "SignUp":
        return <SignUp setPage={setPage} />;

      case "TeamList":
        return <TeamList setPage={setPage} />;

      case "TeamForm":
        return <TeamForm setPage={setPage} />;

      case "MemberList":
        return <MemberList setPage={setPage} />;

      case "AddMemberForm":
        return <AddMemberForm setPage={setPage} />;

      case "Profile":
        return <Profile setPage={setPage} />;

      case "Settings":
        return <Settings setPage={setPage} />;

      default:
        return <Home setPage={setPage} />;
    }
  }

  return <>{renderPage()}</>;
}
