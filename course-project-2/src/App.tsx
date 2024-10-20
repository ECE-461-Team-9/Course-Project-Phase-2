import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import { Shell } from "./components/ui/shell";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import Packages from "./pages/Packages";
import React from "react";
import Members from "./pages/Members";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const homeRef = React.createRef<HTMLDivElement>();
  const packagesRef = React.createRef<HTMLDivElement>();
  const membersRef = React.createRef<HTMLDivElement>();
  const analyticsRef = React.createRef<HTMLDivElement>();

  const getNodeRef = (pathname: string) => {
    switch (pathname) {
      case "/":
        return homeRef;
      case "/packages":
        return packagesRef;
      case "/members":
        return membersRef;
      case "/analytics":
        return analyticsRef;
      default:
        return homeRef;
    }
  };

  return (
    <Shell>
      <TransitionGroup>
        <CSSTransition
          key={location.pathname}
          nodeRef={getNodeRef(location.pathname)}
          classNames="page"
          timeout={500}
          unmountOnExit
        >
          <div ref={getNodeRef(location.pathname)}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/members" element={<Members />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </Shell>
  );
}

export default App;