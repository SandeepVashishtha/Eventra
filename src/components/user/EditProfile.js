import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom"; // 🔥 FIX: Required for Modal Portal
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { safeJsonParse } from "../../utils/safeJsonParse";
import { syncSecureStorage } from "../../utils/secureStorage";

import {
  User as UserIcon,
  AtSign,
  Phone as PhoneIcon,
  FileText,
  Github,
  Linkedin,
  Link as LinkIcon,
  Image as ImageIcon,
  X as XIcon,
  Sparkles,
} from "lucide-react";

import AiProfileGeneratorModal from "./AiProfileGeneratorModal";

const initialFormState = {
  fullName: "",
  username: "",
  email: "",
  phone: "",
  bio: "",
  skills: [],
  github: "",
  linkedin: "",
  portfolio: "",
  avatarBase64: "",
};

const allSkillSuggestions = [
  "JavaScript",
  "TypeScript",
  "React",
  "Angular",
  "Vue.js",
  "Node.js",
  "Express.js",
  "Python",
  "Django",
  "Flask",
  "Java",
  "Spring Boot",
  "C#",
  ".NET",
  "HTML5",
  "CSS3",
  "Sass",
  "Tailwind CSS",
  "Bootstrap",
  "SQL",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Firebase",
  "Git",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "Google Cloud",
  "CI/CD",
  "Jenkins",
  "GitHub Actions",
  "UI/UX Design",
  "Figma",
  "Adobe XD",
  "Sketch",
  "Agile",
  "Scrum",
  "JIRA",
  "Machine Learning",
  "Data Science",
  "Pandas",
  "NumPy",
];

const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-._~:/?#[\]@!$&'()*+,;=]*)?$/i;

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  // Initialize with fallback progression to prevent undefined fields
  const [form, setForm] = useState(user ? { ...initialFormState, ...user } : initialFormState);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [currentSkillInput, setCurrentSkillInput] = useState("");
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleApplyAiProfile = (parsedData) => {
    setForm(prev => {
      const nextSkills = [...prev.skills];
      if (parsedData.skills && parsedData.skills.length > 0) {
        parsedData.skills.forEach(skill => {
          if (!nextSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
            nextSkills.push(skill);
          }
        });
      }

      return {
        ...prev,
        bio: parsedData.bio || prev.bio,
        github: parsedData.github || prev.github,
        portfolio: parsedData.portfolio || prev.portfolio,
        skills: nextSkills,
      };
    });
  };

  // 🔥 FIX 1: Track mount state to prevent ghost navigations
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Load saved profile or sync with context user
  useEffect(() => {
    let active = true;
    const loadProfileData = async () => {
      try {
        const saved = await syncSecureStorage.getItemAsync("user");
        if (active) {
          if (saved) {
            const parsed = safeJsonParse(saved, null);
            if (parsed) {
              setForm(parsed);
              return;
            }
          }
          if (user) {
            setForm((prev) => ({ ...prev, ...user }));
          }
        }
      } catch (error) {
        console.error("Error loading secure user profile:", error);
      }
    };
    loadProfileData();
    return () => {
      active = false;
    };
  }, [user]);

  const validate = (nextForm) => {
    const v = {};
    if (nextForm.phone && !/^[+]?\d{7,15}$/.test(nextForm.phone)) {
      v.phone = "Enter a valid phone number";
    }
    if (nextForm.github && !urlRegex.test(nextForm.github)) {
      v.github = "Enter a valid URL";
    }
    if (nextForm.linkedin && !urlRegex.test(nextForm.linkedin)) {
      v.linkedin = "Enter a valid URL";
    }
    if (nextForm.portfolio && !urlRegex.test(nextForm.portfolio)) {
      v.portfolio = "Enter a valid URL";
    }
    return v;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const calculateCompletion = () => {
    const fields = [
      "username",
      "email",
      "phone",
      "bio",
      "github",
      "linkedin",
      "portfolio",
      "avatarBase64",
    ];
    let filled = 0;

    fields.forEach((f) => {
      if (form[f] && typeof form[f] === "string" && form[f].trim() !== "") filled++;
    });

    const resolvedFullName =
      form.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    if (resolvedFullName !== "") filled++;

    if (form.skills && form.skills.length > 0) filled++;

    return Math.round((filled / 10) * 100);
  };

  const completionPercentage = useMemo(() => calculateCompletion(), [form, user]);

  const addSkill = (skill) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !form.skills.some((s) => s.toLowerCase() === trimmedSkill.toLowerCase())) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, trimmedSkill] }));
    }
    setCurrentSkillInput("");
  };

  const handleSkillsKeyDown = (e) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addSkill(currentSkillInput);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🔥 FIX 1: Prevent LocalStorage QuotaExceededError Crash
    // Enforce a strict 1MB limit. Base64 inflates sizes by ~33%, meaning
    // anything over 1MB risks exceeding the total ~5MB localStorage boundary.
    if (file.size > 1048576) {
      alert("Image is too large. Please select an image under 1MB to prevent browser storage errors.");
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setForm((prev) => ({ ...prev, avatarBase64: result }));
    };
    reader.readAsDataURL(file);
  };

  const performSave = () => {
    setSuccessMessage("");

    const resolvedForm = {
      ...form,
      fullName: form.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
      profilePicture: form.avatarBase64 || form.profilePicture || "",
    };

    const validation = validate(resolvedForm);
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      setConfirmOpen(false);
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      // 🔥 FIX 1: If user navigated away, stop executing!
      if (!isMounted.current) return;

      setLoading(false);
      setSuccessMessage("Profile updated successfully");
      setConfirmOpen(false);
      setUser(resolvedForm);
      
      // 🔥 FIX 2: Strip massive Base64 strings before saving to storage to prevent QuotaExceededError crashes
      const safeStorageUser = { ...resolvedForm };
      delete safeStorageUser.avatarBase64;
      
      try {
        await syncSecureStorage.setItem("user", JSON.stringify(safeStorageUser));
      } catch {
        console.warn("Could not save to secure storage, quota exceeded.");
      }

      setTimeout(() => {
        if (!isMounted.current) return;
        navigate("/dashboard/profile");
      }, 1000);
    }, 1500);
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, avatarBase64: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const filteredSuggestions = useMemo(
    () =>
      allSkillSuggestions
        .filter(
          (suggestion) =>
            currentSkillInput &&
            suggestion.toLowerCase().includes(currentSkillInput.toLowerCase()) &&
            !form.skills.some((s) => s.toLowerCase() === suggestion.toLowerCase())
        )
        .slice(0, 7),
    [currentSkillInput, form.skills]
  );

  return (
    <div className="min-h-screen bg-white px-4 py-10 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="flex items-center justify-between text-3xl font-bold text-gray-900 dark:text-gray-100">
            <span className="text-black dark:text-white">Edit Profile</span>
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98]"
            >
              <Sparkles size={16} />
              Auto-fill with AI
            </button>
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage your personal information and how others see you on Eventra.
          </p>
        </div>

        {/* Profile Completion Progress Bar */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Profile Completion
            </span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {completionPercentage}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2.5 rounded-full bg-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* Top Bar with Avatar */}
          <div className="flex items-center gap-4 border-b border-gray-200 px-6 py-5 dark:border-gray-700">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-100 ring-2 ring-indigo-200/60 dark:bg-gray-700 dark:ring-indigo-900/40">
                {form.avatarBase64 ? (
                  <img
                    loading="lazy"
                    src={form.avatarBase64}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>

              {form.avatarBase64 ? (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute right-0 bottom-0 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                  aria-label="Remove profile photo"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              ) : (
                <label className="absolute right-0 bottom-0 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-700">
                  <ImageIcon className="h-4 w-4" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {form.fullName || form.username || form.email}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Update your avatar and profile info below.
              </div>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-8 px-6 py-6">
            {/* Personal Info */}
            <section>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <UserIcon className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      name="fullName"
                      value={
                        form.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
                      }
                      readOnly
                      placeholder="Jane Doe"
                      className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-gray-500 dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <AtSign className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      name="username"
                      value={form.username || ""}
                      onChange={handleChange}
                      placeholder="janedoe"
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-9 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Contact
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <FileText className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={form.email || ""}
                      readOnly
                      className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-gray-500 dark:border-gray-700 dark:bg-gray-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <PhoneIcon className="h-4 w-4" />
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone || ""}
                      onChange={handleChange}
                      placeholder="+1234567890"
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-9 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
              </div>
            </section>

            {/* About */}
            <section>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">About</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio || ""}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Skills / Interests
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={currentSkillInput}
                    onChange={(e) => setCurrentSkillInput(e.target.value)}
                    onKeyDown={handleSkillsKeyDown}
                    placeholder="Type a skill and press Enter or comma"
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Press Enter or comma to add a skill. Click a suggestion to add it.
                  </p>

                  {filteredSuggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                      {filteredSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => addSkill(suggestion)}
                          className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800 hover:bg-indigo-100 hover:text-indigo-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {form.skills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {form.skills.map((skill, idx) => (
                        <span
                          key={`${skill}-${idx}`}
                          className="inline-flex items-center gap-1 rounded-full border border-indigo-200/60 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-900/40 dark:text-indigo-300"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                skills: prev.skills.filter((_, i) => i !== idx),
                              }))
                            }
                            className="hover:text-indigo-900/80 dark:hover:text-indigo-100/90"
                          >
                            <XIcon className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Socials */}
            <section>
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Social Links
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    GitHub
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <Github className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      name="github"
                      value={form.github || ""}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-9 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>
                  {errors.github && <p className="mt-1 text-sm text-red-600">{errors.github}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    LinkedIn
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <Linkedin className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      name="linkedin"
                      value={form.linkedin || ""}
                      onChange={handleChange}
                      placeholder="https://www.linkedin.com/in/username"
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-9 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>
                  {errors.linkedin && (
                    <p className="mt-1 text-sm text-red-600">{errors.linkedin}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Portfolio
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <LinkIcon className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      name="portfolio"
                      value={form.portfolio || ""}
                      onChange={handleChange}
                      placeholder="https://your-portfolio.com"
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-9 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    />
                  </div>
                  {errors.portfolio && (
                    <p className="mt-1 text-sm text-red-600">{errors.portfolio}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Feedback messages */}
            {successMessage && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-200">
                {successMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => setConfirmOpen(true)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ConfirmModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={performSave}
        loading={loading}
      />
      <AiProfileGeneratorModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onApplyProfile={handleApplyAiProfile}
      />
    </div>
  );
};

// 🔥 FIX 2: Wrapped the modal in a React Portal to prevent layout/z-index clipping
const ConfirmModal = ({ open, onCancel, onConfirm, loading }) => {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 mx-auto w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Save changes?</h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Do you want to save your profile updates?
        </p>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
           aria-label="button">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
           aria-label="button">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditProfile;