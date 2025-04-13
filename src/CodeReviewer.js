import React, { useState, useEffect } from "react";
import axios from "axios";

const tabs = ["Original", "Corrected", "Suggestions", "Output"];
const languages = [
  { id: "auto", name: "Auto-detect" },
  { id: "javascript", name: "JavaScript" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "cpp", name: "C++" },
  { id: "csharp", name: "C#" },
  { id: "php", name: "PHP" },
  { id: "ruby", name: "Ruby" },
  { id: "go", name: "Go" },
  { id: "rust", name: "Rust" },
  { id: "swift", name: "Swift" },
];

function CodeReviewer() {
  const [code, setCode] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Original");
  const [darkMode, setDarkMode] = useState(false);
  const [copiedTab, setCopiedTab] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [detectedLanguage, setDetectedLanguage] = useState(null);

  useEffect(() => {
    if (code.trim() && selectedLanguage === "auto") {
      detectLanguage(code);
    } else if (selectedLanguage !== "auto") {
      setDetectedLanguage(null);
    }
  }, [code, selectedLanguage]);

  const detectLanguage = (codeString) => {
    // Simple language detection based on keywords and syntax patterns
    // This is a basic implementation - you might want to use a more robust solution
    const langPatterns = {
      python: /\bdef\s+\w+\s*\(.*\):|import\s+\w+|from\s+\w+\s+import|print\s*\(|if\s+.*:\s*$|\bindent|:\s*$/m,
      javascript: /\bfunction\b|\bconst\b|\blet\b|\bvar\b|\b=>\b|document\.|window\.|console\.log|import\s+.*\bfrom\b|export\s+|class\s+\w+\s+extends\s+\w+/,
      java: /\bpublic\s+class\b|\bprivate\b|\bprotected\b|\bpackage\b|\bimport\s+java\.|void\s+main\(|System\.out|throws\s+\w+Exception/,
      cpp: /#include\s+<\w+>|\bstd::\b|\bvoid\s+\w+\s*\(|\bint\s+main\(|::\s*\w+|namespace\s+\w+/,
      csharp: /\bnamespace\s+\w+|\busing\s+\w+;|\bpublic\s+\w+\s+class\b|\bConsole\.Write|string\[\]\s+args/,
      php: /\b<\?php\b|\becho\b|\$\w+|->|\bfunction\s+\w+\s*\(.*\)\s*{/,
      ruby: /\bdef\s+\w+\s*(\(.*\))?\s*\n|\bclass\s+\w+(\s+<\s+\w+)?|\bmodule\s+\w+|\battr_|\bputs\b|\brequire\b/,
      go: /\bvar\s+\w+\s+[*\w[\]]+/,
      rust: /\bfn\s+\w+\s*\(|\blet\s+mut\b|\buse\s+\w+::|::\w+|\bimpl\s+\w+\s+for\b|\bpub\s+\w+/,
      swift: /\bfunc\s+\w+\s*\(|\bvar\s+\w+\s*:\s*\w+|\blet\s+\w+\s*=|\bclass\s+\w+\s*{|\bimport\s+\w+/
    };

    // Test each pattern against the code
    for (const [lang, pattern] of Object.entries(langPatterns)) {
      if (pattern.test(codeString)) {
        setDetectedLanguage(lang);
        return;
      }
    }
    
    setDetectedLanguage(null);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleCopy = (content, tabName) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopiedTab(tabName);
        setTimeout(() => setCopiedTab(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleReview = async () => {
    setLoading(true);
    setReview("");
    setError("");
    setActiveTab("Original");
    
    const language = selectedLanguage === "auto" ? (detectedLanguage || "general") : selectedLanguage;
    
    try {
      const response = await axios.post("http://localhost:5000/api/review", { 
        code,
        language 
      });
      if (response.data.review) {
        setReview(response.data.review);
      } else {
        setError("No analysis returned.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error analyzing the code.");
    } finally {
      setLoading(false);
    }
  };

  const extractSection = (label) => {
    const pattern = new RegExp(`\\*\\*${label}:\\*\\*[\\s\\S]*?(?=\\*\\*|$)`, "i");
    const match = review.match(pattern);
    return match ? match[0].replace(new RegExp(`\\*\\*${label}:\\*\\*`, "i"), "").trim() : "Not available.";
  };

  const tabContent = {
    Original: code,
    Corrected: extractSection("Corrected Code").replace(/```(?:\w+)?/g, ""),
    Suggestions: `${extractSection("Suggestions")}\n\nExplanation:\n${extractSection("Explanations")}`,
    Output: extractSection("Expected Output"),
  };

  // Determines if the copy button should be shown for the current tab
  const shouldShowCopyButton = (tabName) => {
    return tabName === "Corrected" || tabName === "Output";
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="container mx-auto p-6">
        {/* Animated Title */}
        <h1 className="text-center text-4xl font-bold mb-2 relative overflow-hidden">
          <span className="inline-block animate-pulse text-blue-600 dark:text-blue-400">L</span>
          <span className="inline-block animate-pulse text-blue-600 dark:text-blue-400" style={{animationDelay: '0.1s'}}>L</span>
          <span className="inline-block animate-pulse text-blue-600 dark:text-blue-400" style={{animationDelay: '0.2s'}}>M</span>
          <span className="inline-block">-</span>
          <span className="inline-block animate-pulse text-purple-600 dark:text-purple-400" style={{animationDelay: '0.3s'}}>P</span>
          <span className="inline-block animate-pulse text-purple-600 dark:text-purple-400" style={{animationDelay: '0.4s'}}>o</span>
          <span className="inline-block animate-pulse text-purple-600 dark:text-purple-400" style={{animationDelay: '0.5s'}}>w</span>
          <span className="inline-block animate-pulse text-purple-600 dark:text-purple-400" style={{animationDelay: '0.6s'}}>e</span>
          <span className="inline-block animate-pulse text-purple-600 dark:text-purple-400" style={{animationDelay: '0.7s'}}>r</span>
          <span className="inline-block animate-pulse text-purple-600 dark:text-purple-400" style={{animationDelay: '0.8s'}}>e</span>
          <span className="inline-block animate-pulse text-purple-600 dark:text-purple-400" style={{animationDelay: '0.9s'}}>d</span>
          <span className="inline-block"> </span>
          <span className="inline-block animate-pulse text-green-600 dark:text-green-400" style={{animationDelay: '1.0s'}}>C</span>
          <span className="inline-block animate-pulse text-green-600 dark:text-green-400" style={{animationDelay: '1.1s'}}>o</span>
          <span className="inline-block animate-pulse text-green-600 dark:text-green-400" style={{animationDelay: '1.2s'}}>d</span>
          <span className="inline-block animate-pulse text-green-600 dark:text-green-400" style={{animationDelay: '1.3s'}}>e</span>
          <span className="inline-block"> </span>
          <span className="inline-block animate-pulse text-red-600 dark:text-red-400" style={{animationDelay: '1.4s'}}>R</span>
          <span className="inline-block animate-pulse text-red-600 dark:text-red-400" style={{animationDelay: '1.5s'}}>e</span>
          <span className="inline-block animate-pulse text-red-600 dark:text-red-400" style={{animationDelay: '1.6s'}}>v</span>
          <span className="inline-block animate-pulse text-red-600 dark:text-red-400" style={{animationDelay: '1.7s'}}>i</span>
          <span className="inline-block animate-pulse text-red-600 dark:text-red-400" style={{animationDelay: '1.8s'}}>e</span>
          <span className="inline-block animate-pulse text-red-600 dark:text-red-400" style={{animationDelay: '1.9s'}}>w</span>
          <span className="inline-block animate-pulse text-red-600 dark:text-red-400" style={{animationDelay: '2.0s'}}>e</span>
          <span className="inline-block animate-pulse text-red-600 dark:text-red-400" style={{animationDelay: '2.1s'}}>r</span>
        </h1>
        
        <p className={`text-center mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Review, correct, and suggest improvements for your code with ease.
        </p>
        
        {/* Theme Toggle Button */}
        <div className="absolute top-4 right-4">
          <button 
            onClick={toggleTheme} 
            className={`p-2 rounded-md transition-colors ${
              darkMode 
                ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300' 
                : 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
            }`}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
        
        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-6 font-sans">
          {/* Language Selector */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <label className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Language:</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={`p-2 rounded border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              >
                {languages.map(lang => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedLanguage === "auto" && detectedLanguage && (
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Detected: {languages.find(l => l.id === detectedLanguage)?.name || detectedLanguage}
              </div>
            )}
          </div>

          {/* Code Review UI */}
          <textarea
            rows="10"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            className={`w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-600'
            }`}
          />

          <button
            onClick={handleReview}
            disabled={loading || !code.trim()}
            className={`px-5 py-2 rounded transition-colors ${
              darkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
            }`}
          >
            {loading ? "Reviewing..." : "Review Code"}
          </button>

          {error && <div className="text-red-600 mt-4">{error}</div>}

          {/* Review Content */}
          {review && (
            <div className={`shadow-lg rounded-lg mt-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex border-b text-sm font-medium">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 p-3 text-center ${
                      activeTab === tab
                        ? darkMode 
                          ? 'bg-blue-900 text-blue-300 font-semibold' 
                          : 'bg-blue-100 text-blue-700 font-semibold'
                        : darkMode 
                          ? 'hover:bg-gray-700 text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="relative">
                {shouldShowCopyButton(activeTab) && (
                  <button
                    onClick={() => handleCopy(tabContent[activeTab], activeTab)}
                    className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${
                      darkMode
                        ? copiedTab === activeTab
                          ? 'bg-green-700 text-green-200'
                          : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                        : copiedTab === activeTab
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } transition-colors`}
                  >
                    {copiedTab === activeTab ? "Copied!" : "Copy"}
                  </button>
                )}
                <pre className={`p-4 whitespace-pre-wrap text-sm overflow-x-auto rounded-b-lg ${
                  darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-800'
                }`}>
                  {tabContent[activeTab]}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CodeReviewer;