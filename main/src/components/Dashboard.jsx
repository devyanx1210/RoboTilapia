// BUG 2 scrollbars fix
import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";

// Assets
import logo from "../assets/temp_logo.png";
import { Monitor, Settings, LogOut, Droplet, X } from "lucide-react";

// Firebase & utils
import { auth } from "../firebase.js";
import { useAnimatedToggle, useReadDatabase } from "./utils.jsx";

function Dashboard() {
<<<<<<< HEAD
=======
  const navigate = useNavigate();

  // Track user state to avoid "uid of null"
  const [user, setUser] = useState(() => auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return unsubscribe;
  }, []);

  // Read sensors data
>>>>>>> Settings
  const { readings, loading } = useReadDatabase("/sensors");

  // Read user data only if user exists
  const { readings: userReadings, loading: userLoading } = useReadDatabase(
    user ? `/users/${user.uid}` : null
  );

  const sidebar = useAnimatedToggle(300);
  const signout = useAnimatedToggle(300);
  const closeSignoutSideBar = () => {
    sidebar.close();
    signout.close();
  };

  const [sections, setSections] = useState([
    {
      title: "Monitoring",
      path: "/dashboard/water-parameter-monitoring",
      icon: Monitor,
      clicked: true,
    },
    {
      title: "Operations",
      path: "/dashboard/feeding-aeration-management",
      icon: Droplet,
      clicked: false,
    },
    {
      title: "Settings",
      path: "/dashboard/settings",
      icon: Settings,
      clicked: false,
    },
    { title: "Sign Out", path: null, icon: LogOut, clicked: false },
  ]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ESC key closes sidebar or signout modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (signout.shouldRender) signout.close();
        else if (sidebar.shouldRender) sidebar.close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [signout.shouldRender, sidebar.shouldRender]);

  const handleNavClick = (index, sec) => {
    setSections((prev) => prev.map((s, i) => ({ ...s, clicked: i === index })));
    if (sec.title === "Sign Out") signout.open();
  };

  const handleSignOut = () => {
    auth.signOut();
    signout.close();
    navigate("/");
  };

  // Wait until user is loaded
  if (user === undefined || user === null) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#002033] text-white">
        <p>Loading user...</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen w-screen flex flex-col font-sans overflow-x-hidden bg-gradient-to-b from-gray-200 to-[#002033] relative">
        {/* TOP BAR */}
        <div className="fixed top-0 left-0 w-full z-10 bg-[#153147]/0 backdrop-blur-sm px-4 pt-4 sm:pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 sm:gap-6">
            {/* PROFILE */}
            <section className="flex flex-row items-center gap-3 w-full">
              <img
                src={logo}
                alt="logo"
                className="h-[clamp(80px,7vw,100px)] rounded-full"
              />
              <div className="flex flex-col">
                {userLoading ? (
                  <p>Loading user info...</p>
                ) : userReadings ? (
                  <>
                    <h3 className="text-[clamp(18px,2vw,30px)] font-bold bg-gradient-to-r from-[#002033] via-blue-500 to-sky-500 bg-clip-text text-transparent">
                      Welcome, {userReadings.displayName || "Tilapia Farmer"}
                    </h3>
                    <h4 className="text-[clamp(13px,2vw,25px)] sm:text-base font-light text-[#002033] break-words">
                      {userReadings.email || user.email}
                    </h4>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#002033] via-blue-500 to-sky-500 bg-clip-text text-transparent">
                      Welcome, Tilapia Farmer
                    </h3>
                    <h4 className="text-sm sm:text-base font-light text-[#002033] break-words">
                      tilapiaFarmer@gmail.com
                    </h4>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <div className="flex flex-col flex-1 mt-[110px] overflow-y-auto text-[#232a2f]">
          <Outlet
            context={{
              readings,
              closeSignoutSideBar,
              signout,
              sidebar,
              currentUser: user,
            }}
          />
        </div>
      </div>

      {/* NAVIGATION */}
      <nav
        className={`flex items-center justify-between p-2 sm:p-0 gap-0  
        ${
          isMobile
            ? "fixed bottom-0 left-0 w-full justify-center gap-1 z-20 bg-white/80 backdrop-blur-md shadow-md h-[clamp(40px,8vh,60px)]"
            : "absolute top-5 right-5 z-30 pl-3.5 bg-white/80 backdrop-blur-md rounded-2xl shadow-md w-[clamp(400px,40%,500px)] h-[clamp(50px,10vh,100px)]"
        } transition-all duration-300`}
      >
        {sections.map((sec, index) => (
          <Link
            key={index}
            to={sec.path || "#"}
            onClick={() => handleNavClick(index, sec)}
            className={`flex items-center gap-2 m-2 transition text-[clamp(10px,2vw,15px)] font-semibold ${
              sec.clicked
                ? "text-cyan-500"
                : "text-[#0b2132] hover:text-cyan-400"
            }`}
          >
            <sec.icon
              className={`inline-block align-middle h-[clamp(14px,2vw,16px)] w-auto ${
                sec.clicked ? "text-cyan-500" : ""
              }`}
            />
            <span className="align-middle text-[clamp(10px,2vw,15px)] sm:text-base">
              {sec.title}
            </span>
          </Link>
        ))}
      </nav>

      {/* SIGN OUT MODAL */}
      {signout.shouldRender && (
        <>
          <div
            className={`fixed inset-0 bg-black-500/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
              signout.animating ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeSignoutSideBar}
          ></div>

          <div
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg z-50 p-6 w-[clamp(280px,80%,400px)] h-[clamp(150px,30vh,200px)] flex flex-col justify-center items-center transition-transform duration-300 ${
              signout.animating ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 transition"
              onClick={closeSignoutSideBar}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold text-center mb-4">
              Do you want to sign out?
            </h2>

            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded-md bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition"
                onClick={handleSignOut}
              >
                Yes
              </button>
              <button
                className="px-4 py-2 rounded-md bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition"
                onClick={closeSignoutSideBar}
              >
                No
              </button>
            </div>
          </div>
        </>
      )}

      {/* Loading layout */}
      {loading && (
        <div className="fixed inset-0 w-screen backdrop-blur-2xl bg-black/30 z-[1000] flex justify-center items-center">
          <section className="flex items-center justify-center h-screen w-screen">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-5 w-5 mr-[10px] last:mr-0 rounded-full bg-[#b3d4fc] animate-pulseDot"
                style={{ animationDelay: `${i * 0.2 - 0.3}s` }}
              />
            ))}
          </section>
        </div>
      )}
    </>
  );
}

export default Dashboard;
