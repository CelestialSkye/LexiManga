import TopBar from "@components/TopBar";
import { useMediaQuery } from "@mantine/hooks";
import LanguageSelect from "@components/LanguageSelect";
import { authService } from "src/services";
import { useAuth } from "src/context/AuthContext";
import { useState } from "react";

const LanguageTab = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isDesktop = useMediaQuery("(min-width: 769px)");
  const { user } = useAuth();
  const [language, setLanguage] = useState("");

  const handleLanguageChange = (value) => {
    setLanguage(value);
  };

  const handleSaveLanguage = async () => {
  if (!language) {
    alert("Please select a language first");
    return;
  }
  try {
    await authService.changeLanguageAndResetWords(user.uid, language);
    alert(`Language changed to ${language}, and your words have been reset.`);
  } catch (error) {
    console.error("Error changing language:", error);
    alert("Failed to update language and reset words");
  }
};


  return (
    <div className="space-y-6 rounded-[16px] p-4">
      <div className={`${isMobile ? "absolute top-0 right-0 left-0 z-10" : ""}`}>
        <TopBar />
      </div>

      <div className="rounded-[12px] bg-white p-6 shadow-lg dark:bg-gray-800 dark:text-white">
        <h2 className="text-lg font-semibold mb-4">Change Target Language</h2>

        <label htmlFor="languageSelect">Choose Target Language:</label>
        <LanguageSelect
          value={language}
          onChange={handleLanguageChange}
          required
        />

        <button
          id="saveLanguageBtn"
          onClick={handleSaveLanguage}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Language
        </button>
      </div>
    </div>
  );
};

export default LanguageTab;
