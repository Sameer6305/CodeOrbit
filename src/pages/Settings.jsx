import { useState, useEffect } from "react";
import { User, Code2, Bell, Shield, Save, CheckCircle, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/auth";
import { useProfileStore } from "../store/profile";
import { 
  parseCodeforcesUrl, 
  parseLeetCodeUrl, 
  parseCodeChefUrl,
  validatePlatformUsername,
  getProfileUrl 
} from "../utils/platformHelpers";

export default function Settings() {
  const { user } = useAuthStore();
  const { profile, fetchProfile, updatePlatformHandles, loading } = useProfileStore();
  
  const [username, setUsername] = useState("");
  const [cfInput, setCfInput] = useState("");
  const [leetcodeInput, setLeetcodeInput] = useState("");
  const [codechefInput, setCodechefInput] = useState("");
  
  const [cfHandle, setCfHandle] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [codechefHandle, setCodechefHandle] = useState("");
  
  const [validationState, setValidationState] = useState({
    codeforces: { status: 'idle', message: '' },
    leetcode: { status: 'idle', message: '' },
    codechef: { status: 'idle', message: '' },
  });
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id).then((data) => {
        if (data) {
          setUsername(data.username || "");
          const cf = data.codeforces_handle || "";
          const lc = data.leetcode_username || "";
          const cc = data.codechef_handle || "";
          
          setCfHandle(cf);
          setLeetcodeUsername(lc);
          setCodechefHandle(cc);
          
          setCfInput(cf);
          setLeetcodeInput(lc);
          setCodechefInput(cc);
        }
      });
    }
  }, [user]);

  // Validate and parse Codeforces input
  const handleCodeforcesChange = async (value) => {
    setCfInput(value);
    const parsed = parseCodeforcesUrl(value);
    setCfHandle(parsed);
    
    if (parsed && parsed.length > 0) {
      setValidationState(prev => ({ 
        ...prev, 
        codeforces: { status: 'validating', message: 'Checking...' } 
      }));
      
      const result = await validatePlatformUsername('codeforces', parsed);
      setValidationState(prev => ({ 
        ...prev, 
        codeforces: { 
          status: result.valid ? 'valid' : 'invalid', 
          message: result.message 
        } 
      }));
    } else {
      setValidationState(prev => ({ 
        ...prev, 
        codeforces: { status: 'idle', message: '' } 
      }));
    }
  };

  // Validate and parse LeetCode input
  const handleLeetCodeChange = async (value) => {
    setLeetcodeInput(value);
    const parsed = parseLeetCodeUrl(value);
    setLeetcodeUsername(parsed);
    
    if (parsed && parsed.length > 0) {
      setValidationState(prev => ({ 
        ...prev, 
        leetcode: { status: 'validating', message: 'Checking...' } 
      }));
      
      const result = await validatePlatformUsername('leetcode', parsed);
      setValidationState(prev => ({ 
        ...prev, 
        leetcode: { 
          status: result.valid ? 'valid' : 'invalid', 
          message: result.message 
        } 
      }));
    } else {
      setValidationState(prev => ({ 
        ...prev, 
        leetcode: { status: 'idle', message: '' } 
      }));
    }
  };

  // Validate and parse CodeChef input
  const handleCodeChefChange = async (value) => {
    setCodechefInput(value);
    const parsed = parseCodeChefUrl(value);
    setCodechefHandle(parsed);
    
    if (parsed && parsed.length > 0) {
      setValidationState(prev => ({ 
        ...prev, 
        codechef: { status: 'validating', message: 'Checking...' } 
      }));
      
      const result = await validatePlatformUsername('codechef', parsed);
      setValidationState(prev => ({ 
        ...prev, 
        codechef: { 
          status: result.valid ? 'valid' : 'invalid', 
          message: result.message 
        } 
      }));
    } else {
      setValidationState(prev => ({ 
        ...prev, 
        codechef: { status: 'idle', message: '' } 
      }));
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    const result = await updatePlatformHandles(user.id, {
      codeforces: cfHandle,
      leetcode: leetcodeUsername,
      codechef: codechefHandle,
    });

    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert(`Error saving settings: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account and platform integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-left bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-medium">
              <User className="w-5 h-5" />
              Profile
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium">
              <Code2 className="w-5 h-5" />
              Platforms
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium">
              <Bell className="w-5 h-5" />
              Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium">
              <Shield className="w-5 h-5" />
              Privacy
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Profile Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Your username"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Platform Integrations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Platform Integrations
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter your profile URL or username. We'll automatically extract and validate it.
            </p>
            <div className="space-y-6">
              {/* Codeforces */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Codeforces Profile
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cfInput}
                    onChange={(e) => handleCodeforcesChange(e.target.value)}
                    placeholder="tourist or https://codeforces.com/profile/tourist"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  {validationState.codeforces.status === 'validating' && (
                    <Loader2 className="absolute right-3 top-3 w-5 h-5 text-gray-400 animate-spin" />
                  )}
                  {validationState.codeforces.status === 'valid' && (
                    <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                  )}
                  {validationState.codeforces.status === 'invalid' && (
                    <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
                  )}
                </div>
                {validationState.codeforces.message && (
                  <p className={`text-sm mt-1 ${
                    validationState.codeforces.status === 'valid' ? 'text-green-600 dark:text-green-400' : 
                    validationState.codeforces.status === 'invalid' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {validationState.codeforces.message}
                  </p>
                )}
                {cfHandle && (
                  <a 
                    href={getProfileUrl('codeforces', cfHandle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    View Profile <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* LeetCode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  LeetCode Profile
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={leetcodeInput}
                    onChange={(e) => handleLeetCodeChange(e.target.value)}
                    placeholder="username or https://leetcode.com/username"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  {validationState.leetcode.status === 'validating' && (
                    <Loader2 className="absolute right-3 top-3 w-5 h-5 text-gray-400 animate-spin" />
                  )}
                  {validationState.leetcode.status === 'valid' && (
                    <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                  )}
                  {validationState.leetcode.status === 'invalid' && (
                    <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
                  )}
                </div>
                {validationState.leetcode.message && (
                  <p className={`text-sm mt-1 ${
                    validationState.leetcode.status === 'valid' ? 'text-green-600 dark:text-green-400' : 
                    validationState.leetcode.status === 'invalid' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {validationState.leetcode.message}
                  </p>
                )}
                {leetcodeUsername && (
                  <a 
                    href={getProfileUrl('leetcode', leetcodeUsername)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    View Profile <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* CodeChef */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CodeChef Profile
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={codechefInput}
                    onChange={(e) => handleCodeChefChange(e.target.value)}
                    placeholder="handle or https://www.codechef.com/users/handle"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  {validationState.codechef.status === 'validating' && (
                    <Loader2 className="absolute right-3 top-3 w-5 h-5 text-gray-400 animate-spin" />
                  )}
                  {validationState.codechef.status === 'valid' && (
                    <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                  )}
                  {validationState.codechef.status === 'invalid' && (
                    <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
                  )}
                </div>
                {validationState.codechef.message && (
                  <p className={`text-sm mt-1 ${
                    validationState.codechef.status === 'valid' ? 'text-green-600 dark:text-green-400' : 
                    validationState.codechef.status === 'invalid' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {validationState.codechef.message}
                  </p>
                )}
                {codechefHandle && (
                  <a 
                    href={getProfileUrl('codechef', codechefHandle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mt-1"
                  >
                    View Profile <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Saved Successfully!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
