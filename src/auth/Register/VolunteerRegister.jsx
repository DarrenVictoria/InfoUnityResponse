import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore";
import background from "../../assets/hero-background.jpg";
import logo from "../../assets/logo-small.png";
import LocationSelector from "../../components/LocationSelector";
import { useTranslation } from "react-i18next"; // Import useTranslation hook

// Helper functions
const validateNIC = (nic) => /^[A-Za-z0-9]{1,13}$/.test(nic);
const validateEmail = (email) =>
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
const validateMobileNumber = (mobileNumber) => /^\d{9}$/.test(mobileNumber);

const VolunteerRegister = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // Use the translation hook
  const [nicNumber, setNicNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [password, setPassword] = useState("");
  const [isRedCrossVolunteer, setIsRedCrossVolunteer] = useState(false);
  const [errors, setErrors] = useState({});

  const handleRegister = async () => {
    setErrors({});
    if (!validateNIC(nicNumber)) {
      setErrors((prev) => ({ ...prev, nic: t("nicValidationError") }));
      return;
    }
    if (!validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: t("emailValidationError") }));
      return;
    }
    if (password.length < 6) {
      setErrors((prev) => ({
        ...prev,
        password: t("passwordValidationError"),
      }));
      return;
    }
    if (!selectedDistrict || !selectedDivision) {
      setErrors((prev) => ({
        ...prev,
        location: t("locationValidationError"),
      }));
      return;
    }
    if (!validateMobileNumber(mobileNumber)) {
      setErrors((prev) => ({ ...prev, mobile: t("mobileValidationError") }));
      return;
    }

    try {
      const db = getFirestore();
      const auth = getAuth();
      const nicQuery = query(
        collection(db, "users"),
        where("nicNumber", "==", nicNumber)
      );
      const emailQuery = query(
        collection(db, "users"),
        where("email", "==", email)
      );

      const nicSnapshot = await getDocs(nicQuery);
      const emailSnapshot = await getDocs(emailQuery);

      if (!nicSnapshot.empty || !emailSnapshot.empty) {
        const existingUser = nicSnapshot.empty
          ? emailSnapshot.docs[0]
          : nicSnapshot.docs[0];
        const userRoles = existingUser.data().roles || [];

        if (!userRoles.includes("Volunteer")) {
          await setDoc(doc(db, "users", existingUser.id), {
            ...existingUser.data(),
            roles: [...userRoles, "Volunteer"],
          });
        }
        navigate("/login/volunteer");
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const userId = userCredential.user.uid;
        const fullMobileNumber = `+94${mobileNumber}`;

        await setDoc(doc(db, "users", userId), {
          nicNumber,
          fullName,
          mobileNumber: fullMobileNumber,
          email,
          district: selectedDistrict,
          division: selectedDivision,
          roles: ["Volunteer"],
          userId,
          isRedCrossVolunteer,
        });
        navigate("/login/volunteer");
      }
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };

  // Language toggle buttons
  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${background})`, opacity: 0.9 }}
    >
      <div className="max-w-md mx-auto p-6 bg-white bg-opacity-80 rounded-lg shadow-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-16 w-16" />
        </div>

        {/* Language Toggle */}
        <div className="flex justify-end space-x-2 mb-4">
          <button
            onClick={() => handleLanguageChange("en")}
            className="text-sm px-2 py-1 border border-gray-300 rounded"
          >
            English
          </button>
          <button
            onClick={() => handleLanguageChange("si")}
            className="text-sm px-2 py-1 border border-gray-300 rounded"
          >
            සිංහල
          </button>
          <button
            onClick={() => handleLanguageChange("ta")}
            className="text-sm px-2 py-1 border border-gray-300 rounded"
          >
            தமிழ்
          </button>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-semibold text-center mb-6">
          {t("registerAsVolunteer")}
        </h3>

        <div className="space-y-4">
          {/* NIC Number */}
          <input
            type="text"
            placeholder={t("nicNumber")}
            value={nicNumber}
            onChange={(e) => setNicNumber(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          {errors.nic && <p className="text-red-500 text-sm">{errors.nic}</p>}

          {/* Full Name */}
          <input
            type="text"
            placeholder={t("fullName")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />

          {/* Mobile Number */}
          <div className="flex">
            <span className="flex items-center bg-gray-200 text-gray-500 p-3">
              +94
            </span>
            <input
              type="text"
              placeholder={t("mobileNumber")}
              value={mobileNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 9);
                setMobileNumber(value);
              }}
              maxLength={9}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          {errors.mobile && (
            <p className="text-red-500 text-sm">{errors.mobile}</p>
          )}

          {/* Email */}
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}

          {/* Location Selector */}
          <LocationSelector
            onLocationChange={(district, division) => {
              setSelectedDistrict(district);
              setSelectedDivision(division);
            }}
          />
          {errors.location && (
            <p className="text-red-500 text-sm">{errors.location}</p>
          )}

          {/* Password */}
          <input
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}

          {/* Red Cross Volunteer Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isRedCrossVolunteer}
              onChange={(e) => setIsRedCrossVolunteer(e.target.checked)}
              className="mr-2"
            />
            <label className="text-sm">{t("redCrossVolunteer")}</label>
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            className="w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            {t("register")}
          </button>
        </div>

        {/* Login Link */}
        <div className="text-center mt-4">
          <p className="text-sm">
            {t("alreadyHaveAccount")}{" "}
            <a
              href="/login/volunteer"
              className="text-blue-600 hover:underline"
            >
              {t("login")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VolunteerRegister;
