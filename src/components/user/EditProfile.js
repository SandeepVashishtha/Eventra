import { useEffect, useRef, useState } from "react";
import { useContext } from "react";
import { apiUtils, API_ENDPOINTS } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

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
} from "lucide-react";

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

  const urlRegex =
  /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-._~:/?#[\]@!$&'()*+,;=]*)?$/i;

const EditProfile = () => {

   const { user, setUser } = useAuth();
  const [form, setForm] = useState(user || initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [currentSkillInput, setCurrentSkillInput] = useState("");
  const fileInputRef = useRef(null);
  // Load user from localStorage (fallback) once on mount
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setForm(JSON.parse(saved));
    } else if (user) {
      setForm(user);
    }
  }, [user]);

  const validate = (nextForm) => {
    const v = {};
    if (!nextForm.fullName?.trim()) v.fullName = "Full name is required";
    // if (!nextForm.username?.trim()) v.username = 'Username is required';
    if (nextForm.phone && !/^[+]?\d{7,15}$/.test(nextForm.phone))
      v.phone = "Enter a valid phone number";
    if (nextForm.github && !urlRegex.test(nextForm.github))
      v.github = "Enter a valid URL";
    if (nextForm.linkedin && !urlRegex.test(nextForm.linkedin))
      v.linkedin = "Enter a valid URL";
    if (nextForm.portfolio && !urlRegex.test(nextForm.portfolio))
      v.portfolio = "Enter a valid URL";
    return v;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const addSkill = (skill) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !form.skills.includes(trimmedSkill)) {
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
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setForm((prev) => ({ ...prev, avatarBase64: result }));
    };
    reader.readAsDataURL(file);
  };


const performSave = () => {
  setSuccessMessage("");
  const validation = validate(form);
  setErrors(validation);

  if (Object.keys(validation).length > 0) {
    return;
  }

  setLoading(true);

  setTimeout(() => {
    setLoading(false);
    setSuccessMessage("Profile updated successfully");
    setConfirmOpen(false);

    // ✅ Persist updates to both context and localStorage
    setUser(form);
    localStorage.setItem("user", JSON.stringify(form));

  }, 1500);
};




  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, avatarBase64: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };
  const filteredSuggestions = allSkillSuggestions
    .filter(
      (suggestion) =>
        currentSkillInput &&
        suggestion.toLowerCase().includes(currentSkillInput.toLowerCase()) &&
        !form.skills.some((s) => s.toLowerCase() === suggestion.toLowerCase())
    )
    .slice(0, 7);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            <span className="text-black dark:text-white">
              Edit Profile
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your personal information and how others see you on Eventra.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          {/* Top Bar with Avatar */}
          {/* Top Bar with Avatar */}
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center ring-2 ring-indigo-200/60 dark:ring-indigo-900/40">
                {form.avatarBase64 ? (
                  <img
                    src={form.avatarBase64}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>

              {/* 👇 This is the new, combined button logic */}
              {form.avatarBase64 ? (
                // If image exists, show the RED REMOVE button
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute bottom-0 right-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 text-white shadow cursor-pointer"
                  aria-label="Remove profile photo"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              ) : (
                // Otherwise, show the BLUE UPLOAD button
                <label className="absolute bottom-0 right-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow cursor-pointer">
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
              <div className="text-gray-900 dark:text-gray-100 font-semibold">
                {form.fullName || form.username || form.email}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Update your avatar and profile info below.
              </div>
            </div>
          </div>

          {loadingInitial ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => e.preventDefault()}
              className="px-6 py-6 space-y-8"
            >
              {/* Personal Info */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <div className="mt-1 relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                        <UserIcon className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Jane Doe"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 pl-9 pr-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </label>
                    <div className="mt-1 relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                        <AtSign className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="janedoe"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 pl-9 pr-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.username}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <div className="mt-1 relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                        <FileText className="h-4 w-4" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        readOnly
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-9 pr-3 py-2 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone
                    </label>
                    <div className="mt-1 relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                        <PhoneIcon className="h-4 w-4" />
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+1234567890"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 pl-9 pr-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* About */}
              <section>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  About
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us about yourself..."
                      className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Press Enter or comma to add a skill. Click a suggestion to
                      add it.
                    </p>

                    {filteredSuggestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                        {filteredSuggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => addSkill(suggestion)}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-indigo-100 hover:text-indigo-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300"
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
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  skills: prev.skills.filter(
                                    (_, i) => i !== idx
                                  ),
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
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Social Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      GitHub
                    </label>
                    <div className="mt-1 relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                        <Github className="h-4 w-4" />
                      </span>
                      <input
                        type="url"
                        name="github"
                        value={form.github}
                        onChange={handleChange}
                        placeholder="https://github.com/username"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 pl-9 pr-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {errors.github && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.github}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      LinkedIn
                    </label>
                    <div className="mt-1 relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                        <Linkedin className="h-4 w-4" />
                      </span>
                      <input
                        type="url"
                        name="linkedin"
                        value={form.linkedin}
                        onChange={handleChange}
                        placeholder="https://www.linkedin.com/in/username"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 pl-9 pr-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {errors.linkedin && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.linkedin}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Portfolio
                    </label>
                    <div className="mt-1 relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                        <LinkIcon className="h-4 w-4" />
                      </span>
                      <input
                        type="url"
                        name="portfolio"
                        value={form.portfolio}
                        onChange={handleChange}
                        placeholder="https://your-portfolio.com"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 pl-9 pr-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {errors.portfolio && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.portfolio}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Feedback messages */}
              {successMessage && (
                <div className="rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-4 py-3 text-green-800 dark:text-green-200">
                  {successMessage}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setConfirmOpen(true)}
                  className={`px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60`}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <ConfirmModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={performSave}
        loading={loading}
      />
    </div>
  );
};

// Inline confirmation modal
const ConfirmModal = ({ open, onCancel, onConfirm, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Save changes?
        </h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Do you want to save your profile updates?
        </p>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
