import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { toast } from "react-toastify";
import {
  Search,
  Plus,
  Image as ImageIcon,
  Tag,
  Clock,
  CheckCircle,
  Camera,
  Loader2,
  X,
  Filter,
  Grid3X3,
  List
} from "lucide-react";
import LostItemCard from "./LostItemCard";
import lostAndFoundService from "services/lostAndFoundService";
import imageRecognitionService from "services/imageRecognitionService";

const LostAndFoundBoard = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  
  const [lostItems, setLostItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [uploading, setUploading] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Form state for adding new lost items
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    imagePreview: null,
    category: "",
    locationFound: "",
    contactEmail: user?.email || "",
    contactPhone: "",
    aiTags: []
  });

  const fileInputRef = useRef(null);

  // Common categories for lost items
  const categories = [
    { id: "all", name: "All Items", icon: Grid3X3 },
    { id: "Electronics", name: "Electronics", icon: Camera },
    { id: "Clothing", name: "Clothing", icon: ImageIcon },
    { id: "Accessories", name: "Accessories", icon: Tag },
    { id: "Documents", name: "Documents", icon: ImageIcon },
    { id: "Other", name: "Other", icon: X }
  ];

  // Popular tags
  const popularTags = [
    "Keys", "Wallet", "Phone", "Jacket", "Backpack", "Sunglasses",
    "Watch", "Laptop", "Tablet", "Camera", "Water bottle", "Umbrella"
  ];

  // Fetch lost items
  const fetchLostItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const items = await lostAndFoundService.getAllLostItems(eventId);
      setLostItems(items);
      setFilteredItems(items);
    } catch (error) {
      console.error("Error fetching lost items:", error);
      setError("Failed to load lost and found items. Please try again.");
      setLostItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchLostItems();
    }
  }, [eventId, fetchLostItems]);

  // Apply filters whenever they change
  useEffect(() => {
    let results = [...lostItems];

    // Apply category filter
    if (selectedCategory !== "all") {
      results = results.filter(item => item.category === selectedCategory);
    }

    // Apply tag filter
    if (selectedTag) {
      const tagLower = selectedTag.toLowerCase();
      results = results.filter(item => {
        const tags = item.aiGeneratedTags ? item.aiGeneratedTags.toLowerCase().split(',') : [];
        const itemTags = item.tags ? item.tags.map(t => t.toLowerCase()) : [];
        return [...tags, ...itemTags].some(t => t.includes(tagLower));
      });
    }

    // Apply search query
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      results = results.filter(item => 
        (item.title && item.title.toLowerCase().includes(queryLower)) ||
        (item.description && item.description.toLowerCase().includes(queryLower)) ||
        (item.aiGeneratedTags && item.aiGeneratedTags.toLowerCase().includes(queryLower)) ||
        (item.locationFound && item.locationFound.toLowerCase().includes(queryLower))
      );
    }

    setFilteredItems(results);
  }, [lostItems, searchQuery, selectedCategory, selectedTag]);

  // Handle image upload and recognition
  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      setIsProcessingImage(true);
      
      // First, create preview
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: file, imagePreview: previewUrl }));
      
      // Process image with TensorFlow.js for automatic tagging
      await imageRecognitionService.init();
      const { tags, predictions } = await imageRecognitionService.recognizeAndTagImage(file);
      const bestCategory = imageRecognitionService.getBestCategory(predictions);
      
      setFormData(prev => ({
        ...prev,
        aiTags: tags.length > 0 ? tags : prev.aiTags,
        category: bestCategory || prev.category
      }));
      
      toast.success("Image analyzed! Tags and category have been auto-filled.");
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image for tagging. Please try again.");
      // Still set the image but without AI tags
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: file, imagePreview: previewUrl }));
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a title for the lost item.");
      return;
    }

    try {
      setUploading(true);
      
      // Prepare data for submission
      const submissionData = {
        eventId: Number(eventId),
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category || "Other",
        locationFound: formData.locationFound.trim(),
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim(),
        aiGeneratedTags: formData.aiTags.length > 0 ? formData.aiTags.join(', ') : ''
      };
      
      // Handle image upload
      if (formData.image) {
        // For now, we'll create an object URL for the image
        // In production, you would upload to your file storage service
        submissionData.imageUrl = URL.createObjectURL(formData.image);
        submissionData.thumbnailUrl = URL.createObjectURL(formData.image);
      }
      
      // Submit to backend
      const newItem = await lostAndFoundService.createLostItem(eventId, submissionData);
      
      // Update local state
      setLostItems(prev => [newItem, ...prev]);
      
      // Reset form
      resetForm();
      setShowAddModal(false);
      
      toast.success("Lost item added successfully!");
    } catch (error) {
      console.error("Error creating lost item:", error);
      toast.error("Failed to add lost item. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image: null,
      imagePreview: null,
      category: "",
      locationFound: "",
      contactEmail: user?.email || "",
      contactPhone: "",
      aiTags: []
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle claim action
  const handleClaim = async (item) => {
    try {
      if (!user) {
        toast.error("Please log in to claim an item.");
        return;
      }
      
      if (window.confirm(`Are you sure you want to claim "${item.title}"?`)) {
        await lostAndFoundService.claimLostItem(eventId, item.id);
        
        // Update local state
        setLostItems(prev => prev.map(i => 
          i.id === item.id ? { ...i, isClaimed: true, status: 'CLAIMED' } : i
        ));
        
        toast.success("Item marked as claimed!");
      }
    } catch (error) {
      console.error("Error claiming item:", error);
      toast.error("Failed to claim item. Please try again.");
    }
  };

  // Handle delete action
  const handleDelete = async (item) => {
    try {
      if (!user) {
        toast.error("Please log in to delete an item.");
        return;
      }
      
      if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
        await lostAndFoundService.deleteLostItem(eventId, item.id);
        
        // Update local state
        setLostItems(prev => prev.filter(i => i.id !== item.id));
        
        toast.success("Item deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item. Please try again.");
    }
  };

  // Get count stats
  const getStats = () => {
    const total = lostItems.length;
    const unclaimed = lostItems.filter(item => !item.isClaimed).length;
    const byCategory = {};
    
    lostItems.forEach(item => {
      const category = item.category || 'Other';
      byCategory[category] = (byCategory[category] || 0) + 1;
    });
    
    return { total, unclaimed, byCategory };
  };

  const stats = getStats();

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any object URLs created for images
      lostItems.forEach(item => {
        if (item.imageUrl && item.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.imageUrl);
        }
        if (item.thumbnailUrl && item.thumbnailUrl.startsWith('blob:')) {
          URL.revokeObjectURL(item.thumbnailUrl);
        }
      });
      
      // Clean up form image preview if it exists
      if (formData.imagePreview && formData.imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(formData.imagePreview);
      }
      
      // Clean up image recognition service
      imageRecognitionService.cleanup();
    };
  }, [lostItems, formData.imagePreview]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading Lost & Found items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex items-center gap-3">
          <X className="h-6 w-6 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-200">Error</h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchLostItems}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-800/40"
        >
          <Loader2 className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lost & Found Board
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Help reunite lost items with their owners
          </p>
        </div>
        
        {/* Stats and Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-2 dark:bg-gray-800">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {stats.unclaimed} Available
              </span>
            </div>
            <span className="text-gray-400 dark:text-gray-500">/</span>
            <div className="flex items-center gap-1">
              <Grid3X3 className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {stats.total} Total
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <Plus size={18} />
            Add Found Item
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search lost items by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border-none bg-gray-100 pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={14} />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Advanced Filters (Collapsible) */}
        <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex w-full items-center justify-between text-xs font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="inline-flex items-center gap-2">
              <Filter size={14} />
              Additional Filters
            </span>
            {showFilters ? <X size={14} /> : <Plus size={14} />}
          </button>

          {showFilters && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Popular Tags
                </label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All Tags</option>
                  {popularTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  View Mode
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                      viewMode === "grid"
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Grid3X3 size={14} />
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                      viewMode === "list"
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                    }`}
                  >
                    <List size={14} />
                    List
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              No Lost & Found Items
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {searchQuery || selectedCategory !== "all" || selectedTag
                ? "No items match your search criteria."
                : "Be the first to add a found item to help others."}
            </p>
            
            {!searchQuery && selectedCategory === "all" && !selectedTag && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                <Plus size={16} />
                Add Found Item
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-4 ${
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          }`}>
            {filteredItems.map((item) => (
              <LostItemCard
                key={item.id}
                item={item}
                showContactInfo={true}
                showStatus={true}
                onClaim={handleClaim}
                onDelete={handleDelete}
                isCurrentUserOwner={user && user.id === item.foundById}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Lost Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            {/* Modal Header */}
            <div className="border-b border-gray-200 p-6 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Add Found Item
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Help someone find their lost item
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetForm();
                    setShowAddModal(false);
                  }}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload */}
              <div className="relative">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Item Photo <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Auto-tagging enabled
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Upload a clear photo of the found item for automatic tagging
                </p>
                
                <div className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-indigo-500 dark:border-gray-700 dark:bg-gray-800">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  
                  {formData.imagePreview ? (
                    <div className="relative h-full w-full">
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetForm();
                          }}
                          className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-800 backdrop-blur-sm hover:bg-white"
                        >
                          <X size={16} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                      {isProcessingImage ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Analyzing image...
                          </span>
                        </div>
                      ) : (
                        <>
                          <Camera className="h-8 w-8 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Click to upload or drag and drop
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            JPG, PNG, WebP (Max. 5MB)
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Generated Tags */}
              {formData.aiTags.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI-Generated Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.aiTags.slice(0, 5).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              aiTags: prev.aiTags.filter((_, i) => i !== index)
                            }));
                          }}
                          className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-200"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {formData.aiTags.length > 5 && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        +{formData.aiTags.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Black Leather Wallet"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select a category...</option>
                    {categories.slice(1).map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the item in detail (color, brand, special features, etc.)"
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Location Found */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Found At
                  </label>
                  <input
                    type="text"
                    name="locationFound"
                    value={formData.locationFound}
                    onChange={handleInputChange}
                    placeholder="e.g., Main Stage, Food Court"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Contact Email */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="How can people reach you?"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="e.g., +1 (555) 123-4567"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding Item...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add to Lost & Found
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostAndFoundBoard;