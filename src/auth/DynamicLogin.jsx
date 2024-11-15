import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react"; // Import the back icon from lucide-react
import logo from "../assets/logo-small.png";
import background from "../assets/hero-background.jpg";
import LanguageToggle from "../components/LanguageToggle";

const DynamicLogin = ({ title, path }) => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { t } = useTranslation();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);

      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));

      if (userDoc.exists()) {
        const userRoles = userDoc.data().roles;
        const roleclean = role.charAt(0).toUpperCase() + role.slice(1);

        console.log(userRoles, roleclean);

        if (userRoles && userRoles.includes(roleclean)) {
          setSuccess(true);
          setTimeout(() => {
            switch (roleclean) {
              case "Respondent":
                navigate("/home");
                break;
              case "Volunteer":
                navigate("/home/volunteer");
                break;
              case "Red cross manager":
                navigate("/home/red-cross-manager");
                break;
              case "Dmc system admin":
                navigate("/dmchome");
                break;
              default:
                break;
            }
          }, 1500);
        } else {
          setError("User does not have the required role");
        }
      } else {
        setError("User document not found in Firestore");
      }
    } catch (error) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const roleclean = role.charAt(0).toUpperCase() + role.slice(1);
  const showRegistration = !["Red cross manager", "Dmc system admin"].includes(roleclean);

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${background})`, opacity: 0.9 }}
    >
      <div className="relative bg-white shadow-lg rounded-lg p-8 max-w-md mx-auto z-10">
        {/* Back Button with Icon */}
        <button
          onClick={() => navigate("/role-selection")}
          className="absolute top-4 left-4 flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5 " /> {/* Back icon */}
          
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt={t("logo.alt")} className="h-16 w-16" />
        </div>
        {/* Title */}
        <h3 className="text-2xl font-semibold mb-4 text-center">
          {t("nav.login")} {t("as")} {roleclean}
        </h3>
        {/* Input Fields */}
        <div className="mb-4">
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
          disabled={loading}
        >
          {loading ? t("Please Wait") : t("nav.login")}
        </button>

        {/* Loading Spinner */}
        {loading && (
          <div className="mt-4 text-center">
            <p className="text-blue-500">{t("Verifying Identity")}...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-4 text-center">
            <p className="text-green-500">{t("Login Success")}</p>
          </div>
        )}

        {/* Register Link */}
        {showRegistration && (
          <div className="mt-4 text-center">
            <p className="text-sm">
              {t("dontHaveAccount")}{" "}
              <a
                href={`/register/${role}`}
                className="text-blue-500 hover:underline"
              >
                {t("register")}
              </a>
            </p>
          </div>
        )}

        {/* Language Toggle Component */}
        <div className="mt-4 flex justify-center">
          <LanguageToggle />
        </div>

      </div>
    </div>
  );
};

export default DynamicLogin;
