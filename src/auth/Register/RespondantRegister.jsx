import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import LocationSelector from "../../components/LocationSelector";
import background from "../../assets/hero-background.jpg";
import logo from "../../assets/logo-small.png";
import { useTranslation } from "react-i18next";

const RespondentRegister = () => {
  const navigate = useNavigate();
  const [nicNumber, setNicNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [district, setDistrict] = useState("");
  const [division, setDivision] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { t, i18n } = useTranslation();

  const handleLocationChange = (selectedDistrict, selectedDivision) => {
    setDistrict(selectedDistrict);
    setDivision(selectedDivision);
  };

  // Validate NIC number (alphanumeric, 1 to 13 characters)
  const validateNIC = (nic) => /^[A-Za-z0-9]{11,13}$/.test(nic);

  // Validate mobile number (9 digits only)
  const validateMobileNumber = (number) => /^[0-9]{9}$/.test(number);

  const handleRegister = async () => {
    setErrorMessage(""); // Reset error message

    // Validate NIC
    if (!validateNIC(nicNumber)) {
      setErrorMessage(t("nicValidationError"));
      return;
    }

    // Validate mobile number
    if (!validateMobileNumber(mobileNumber)) {
      setErrorMessage(t("mobileValidationError"));
      return;
    }

    try {
      const db = getFirestore();
      const auth = getAuth();

      const usersRef = collection(db, "users");
      const nicQuery = query(usersRef, where("nicNumber", "==", nicNumber));
      const emailQuery = query(usersRef, where("email", "==", email));

      const nicSnapshot = await getDocs(nicQuery);
      const emailSnapshot = await getDocs(emailQuery);

      if (!nicSnapshot.empty || !emailSnapshot.empty) {
        console.error("NIC number or Email already exists");
        const existingUser = nicSnapshot.empty
          ? emailSnapshot.docs[0]
          : nicSnapshot.docs[0];
        const userRoles = existingUser.data().roles || [];

        if (!userRoles.includes("Respondent")) {
          await setDoc(doc(db, "users", existingUser.id), {
            ...existingUser.data(),
            roles: [...userRoles, "Respondent"],
          });
          console.log("Respondent role added to the user");
        }

        navigate("/login/respondent");
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const userId = userCredential.user.uid;

        await setDoc(doc(db, "users", userId), {
          nicNumber,
          fullName,
          mobileNumber: `+94${mobileNumber}`, // Store with +94 prefix
          email,
          district,
          division,
          roles: ["Respondent"],
          userId,
        });

        navigate("/login/respondent");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      setErrorMessage(t("registrationFailed"));
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${background})`, opacity: 0.9 }}
    >
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative z-10 bg-white bg-opacity-90 p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-16 w-16" />
        </div>

        <h3 className="text-2xl font-semibold text-center mb-6">
          {t("registerAsRespondent")}
        </h3>
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}
        <div className="space-y-4">
          <input
            type="text"
            placeholder={t("nicNumber")}
            value={nicNumber}
            onChange={(e) => setNicNumber(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder={t("fullName")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Mobile Number Input with +94 Prefix */}
          <div className="flex">
            <span className="flex items-center justify-center bg-gray-200 px-4 border border-r-0 rounded-l-lg">
              +94
            </span>
            <input
              type="text"
              placeholder={t("mobileNumber")}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={9}
            />
          </div>
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Location Selector Component */}
          <LocationSelector onLocationChange={handleLocationChange} />

          <input
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleRegister}
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg"
        >
          {t("register")}
        </button>
        <div className="mt-4 text-center">
          <p className="text-sm">
            {t("alreadyHaveAccount")}{" "}
            <a
              href="/login/respondent"
              className="text-blue-500 hover:underline"
            >
              {t("login")}
            </a>
          </p>
        </div>

        {/* Language Toggle - Placed below the Register Button */}
        <div className="language-toggle mt-6 flex justify-center gap-4">
          <button
            onClick={() => i18n.changeLanguage("en")}
            className="lang-btn"
          >
            English
          </button>
          <button
            onClick={() => i18n.changeLanguage("si")}
            className="lang-btn"
          >
            සිංහල
          </button>
          <button
            onClick={() => i18n.changeLanguage("ta")}
            className="lang-btn"
          >
            தமிழ்
          </button>
        </div>
      </div>
    </div>
  );
};

export default RespondentRegister;
