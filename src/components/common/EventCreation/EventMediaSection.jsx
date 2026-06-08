
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Upload, X, Plus } from "lucide-react";
import { logger } from "../../../utils/logger";

const MAX_BANNER_SIZE = 5 * 1024 * 1024; // 5MB

const TagInput = ({ tags, onAdd, onRemove, newTag, setNewTag, placeholder = "Add a tag" }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg p-2 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                   focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={!newTag.trim()}
          className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg 
                   bg-indigo-600 text-white font-medium text-sm disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
      
      <AnimatePresence mode="popLayout">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <motion.span
              key={`${tag}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/50 
                       text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm"
            >
              #{tag}
              <button type="button" onClick={() => onRemove(tag)} className="ml-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.span>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};

const EventMediaSection = ({ 
  formData, 
  setFormData, 
  newTag, 
  setNewTag, 
  addTag, 
  removeTag, 
  setIsUploading 
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_BANNER_SIZE) {
      alert("Image is too large (max 5MB)");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        banner: file,
        bannerPreview: reader.result,
      }));
      setIsUploading(false);
    };
    reader.onerror = () => {
      logger.error("Failed to read file");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <ImageIcon className="w-5 h-5 text-indigo-500 inline-block mr-2" />
          Event Banner
        </label>
        
        <div className="relative group cursor-pointer">
          {formData.bannerPreview ? (
            <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-indigo-500">
              <img src={formData.bannerPreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, banner: null, bannerPreview: null }))}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 transition-colors">
              <Upload className="w-10 h-10 text-gray-400 group-hover:text-indigo-500 mb-2" />
              <span className="text-sm text-gray-500">Click to upload banner (max 5MB)</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tags
        </label>
        <TagInput 
          tags={formData.tags} 
          onAdd={addTag} 
          onRemove={removeTag} 
          newTag={newTag} 
          setNewTag={setNewTag} 
        />
      </div>
    </div>
  );
};

export default EventMediaSection;
