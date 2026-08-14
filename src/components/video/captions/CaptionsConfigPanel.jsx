/**
 * CaptionsConfigPanel Component
 * Configuration panel for live caption settings
 * 
 * Allows users to customize:
 * - Transcription language
 * - Subtitle appearance (font size, colors, position)
 * - Display options (confidence scores, animations)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Globe, 
  Type, 
  Palette, 
  AlignLeft, 
  LayoutTemplate,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  ClosedCaptioning,
  Settings
} from 'lucide-react';

/**
 * Font size options
 */
const FONT_SIZE_OPTIONS = [
  { value: 'small', label: 'Small', class: 'text-sm' },
  { value: 'medium', label: 'Medium', class: 'text-base' },
  { value: 'large', label: 'Large', class: 'text-lg' },
  { value: 'xlarge', label: 'Extra Large', class: 'text-xl' },
];

/**
 * Position options
 */
const POSITION_OPTIONS = [
  { value: 'bottom', label: 'Bottom Center', icon: AlignLeft },
  { value: 'top', label: 'Top Center', icon: AlignLeft },
  { value: 'bottomLeft', label: 'Bottom Left', icon: AlignLeft },
  { value: 'bottomRight', label: 'Bottom Right', icon: AlignLeft },
];

/**
 * Animation options
 */
const ANIMATION_OPTIONS = [
  { value: 'fade', label: 'Fade', description: 'Smooth fade in/out' },
  { value: 'slide', label: 'Slide', description: 'Slide from left' },
  { value: 'scale', label: 'Scale', description: 'Scale animation' },
];

/**
 * Predefined color themes for subtitles
 */
const COLOR_THEMES = [
  {
    name: 'Light on Dark',
    fontColor: '#FFFFFF',
    bgColor: 'rgba(0, 0, 0, 0.7)',
  },
  {
    name: 'Dark on Light',
    fontColor: '#000000',
    bgColor: 'rgba(255, 255, 255, 0.7)',
  },
  {
    name: 'Indigo Theme',
    fontColor: '#FFFFFF',
    bgColor: 'rgba(79, 70, 229, 0.7)',
  },
  {
    name: 'Green Theme',
    fontColor: '#000000',
    bgColor: 'rgba(16, 185, 129, 0.7)',
  },
  {
    name: 'Red Theme',
    fontColor: '#FFFFFF',
    bgColor: 'rgba(239, 68, 68, 0.7)',
  },
  {
    name: 'Yellow Theme',
    fontColor: '#000000',
    bgColor: 'rgba(251, 191, 36, 0.7)',
  },
];

/**
 * CaptionsConfigPanel Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.config - Current configuration
 * @param {function} props.onConfigChange - Callback when configuration changes
 * @param {function} props.onClose - Callback to close the panel
 * @param {boolean} props.enabled - Whether subtitles are enabled
 * @param {function} props.onToggle - Callback to toggle subtitles
 * @param {Array<Object>} props.languages - List of supported languages
 */
const CaptionsConfigPanel = ({
  config = {},
  onConfigChange = () => {},
  onClose = () => {},
  enabled = true,
  onToggle = () => {},
  languages = [],
}) => {
  // State for active sections
  const [activeSection, setActiveSection] = useState('general');
  
  // State for custom color picker
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  
  // Get default language
  const defaultLanguage = languages.find(lang => lang.code === config.language) || languages[0];

  /**
   * Handle configuration changes
   */
  const handleConfigChange = useCallback((key, value) => {
    onConfigChange({ [key]: value });
  }, [onConfigChange]);

  /**
   * Handle language change
   */
  const handleLanguageChange = useCallback((languageCode) => {
    onConfigChange({ language: languageCode });
  }, [onConfigChange]);

  /**
   * Apply a color theme
   */
  const applyTheme = useCallback((theme) => {
    onConfigChange({
      fontColor: theme.fontColor,
      bgColor: theme.bgColor,
    });
  }, [onConfigChange]);

  /**
   * Handle max lines change
   */
  const handleMaxLinesChange = useCallback((value) => {
    onConfigChange({ maxLines: Math.max(1, Math.min(10, Number(value) || 3)) });
  }, [onConfigChange]);

  /**
   * Handle line height change
   */
  const handleLineHeightChange = useCallback((value) => {
    onConfigChange({ lineHeight: Math.max(1, Math.min(3, Number(value) || 1.5)) });
  }, [onConfigChange]);

  /**
   * Handle padding change
   */
  const handlePaddingChange = useCallback((value) => {
    onConfigChange({ padding: value });
  }, [onConfigChange]);

  /**
   * Toggle subtitles
   */
  const toggleEnabled = useCallback(() => {
    onToggle(!enabled);
  }, [enabled, onToggle]);

  // Effect: Update active section based on config changes
  useEffect(() => {
    // Could add logic here to auto-switch sections
  }, [config]);

  // Memoized section components
  const renderGeneralSection = () => (
    <div className="space-y-4">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Live Captions</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enable real-time transcription
            </p>
          </div>
        </div>
        <button
          onClick={toggleEnabled}
          className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
            enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
          aria-label={enabled ? 'Disable live captions' : 'Enable live captions'}
        >
          <span
            className={`absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 top-0.5 left-0.5 ${
              enabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Language Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Globe className="w-4 h-4" />
          Transcription Language
        </label>
        <div className="grid grid-cols-2 gap-2">
          {languages.slice(0, 6).map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`p-3 text-left rounded-lg transition-all duration-200 ${
                config.language === lang.code
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800'
                  : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
              }`}
              aria-selected={config.language === lang.code}
              aria-label={`Select ${lang.label}`}
            >
              <p className="font-medium text-gray-900 dark:text-white">{lang.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{lang.code}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="space-y-4">
      {/* Font Size */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Type className="w-4 h-4" />
          Font Size
        </label>
        <div className="grid grid-cols-4 gap-2">
          {FONT_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleConfigChange('fontSize', option.value)}
              className={`p-3 flex flex-col items-center gap-1 rounded-lg transition-all duration-200 ${
                config.fontSize === option.value
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-500'
                  : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-selected={config.fontSize === option.value}
            >
              <span className={`font-semibold ${option.class}`}>Aa</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Position */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <LayoutTemplate className="w-4 h-4" />
          Position
        </label>
        <div className="grid grid-cols-4 gap-2">
          {POSITION_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => handleConfigChange('position', option.value)}
                className={`p-3 flex flex-col items-center gap-1 rounded-lg transition-all duration-200 ${
                  config.position === option.value
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-500'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-selected={config.position === option.value}
              >
                <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Themes */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Palette className="w-4 h-4" />
          Color Theme
        </label>
        <div className="grid grid-cols-3 gap-2">
          {COLOR_THEMES.map((theme) => (
            <button
              key={theme.name}
              onClick={() => applyTheme(theme)}
              className={`p-3 rounded-lg transition-all duration-200 ${
                config.fontColor === theme.fontColor && config.bgColor === theme.bgColor
                  ? 'ring-2 ring-indigo-500 shadow-lg'
                  : 'hover:scale-105'
              }`}
              style={{
                backgroundColor: theme.bgColor,
                color: theme.fontColor,
              }}
              aria-label={`Apply ${theme.name} theme`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="font-semibold text-sm">Aa</span>
                <span className="text-xs opacity-70">{theme.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Palette className="w-4 h-4" />
            Custom Text Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.fontColor || '#FFFFFF'}
              onChange={(e) => handleConfigChange('fontColor', e.target.value)}
              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer"
              aria-label="Choose text color"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {config.fontColor || '#FFFFFF'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Palette className="w-4 h-4" />
            Custom Background
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.bgColor || 'rgba(0, 0, 0, 0.7)'}
              onChange={(e) => handleConfigChange('bgColor', e.target.value)}
              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer"
              aria-label="Choose background color"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {config.bgColor || 'rgba(0, 0, 0, 0.7)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDisplaySection = () => (
    <div className="space-y-4">
      {/* Max Lines */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <AlignLeft className="w-4 h-4" />
          Maximum Lines
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleMaxLinesChange(config.maxLines - 1)}
            disabled={config.maxLines <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease max lines"
          >
            <span className="text-lg">-</span>
          </button>
          <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
            {config.maxLines || 3}
          </span>
          <button
            onClick={() => handleMaxLinesChange(config.maxLines + 1)}
            disabled={config.maxLines >= 10}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase max lines"
          >
            <span className="text-lg">+</span>
          </button>
        </div>
      </div>

      {/* Line Height */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <AlignLeft className="w-4 h-4" />
          Line Height
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleLineHeightChange(config.lineHeight - 0.1)}
            disabled={config.lineHeight <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease line height"
          >
            <span className="text-lg">-</span>
          </button>
          <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">
            {config.lineHeight || 1.5}
          </span>
          <button
            onClick={() => handleLineHeightChange(config.lineHeight + 0.1)}
            disabled={config.lineHeight >= 3}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase line height"
          >
            <span className="text-lg">+</span>
          </button>
        </div>
      </div>

      {/* Animation */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Sparkles className="w-4 h-4" />
          Animation
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ANIMATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleConfigChange('animation', option.value)}
              className={`p-3 text-left rounded-lg transition-all duration-200 ${
                config.animation === option.value
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-500'
                  : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-selected={config.animation === option.value}
            >
              <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Display Options */}
      <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Display Options
        </p>

        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Show Confidence Scores
            </span>
            <button
              onClick={() => handleConfigChange('showConfidence', !config.showConfidence)}
              className={`relative w-10 h-5 rounded-full transition-all duration-200 ${
                config.showConfidence ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label={config.showConfidence ? 'Hide confidence scores' : 'Show confidence scores'}
            >
              <span
                className={`absolute w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 top-0.5 left-0.5 ${
                  config.showConfidence ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Show Speaker Labels
            </span>
            <button
              onClick={() => handleConfigChange('showSpeaker', !config.showSpeaker)}
              className={`relative w-10 h-5 rounded-full transition-all duration-200 ${
                config.showSpeaker ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label={config.showSpeaker ? 'Hide speaker labels' : 'Show speaker labels'}
            >
              <span
                className={`absolute w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 top-0.5 left-0.5 ${
                  config.showSpeaker ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </label>
        </div>
      </div>
    </div>
  );

  // Navigation sections
  const navSections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'display', label: 'Display', icon: Eye },
  ];

  // Render navigation
  const renderNavigation = () => (
    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {navSections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-md transition-all duration-200 ${
              isActive
                ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
            aria-selected={isActive}
            aria-label={section.label}
          >
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium">{section.label}</span>
          </button>
        );
      })}
    </div>
  );

  // Render active section content
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'appearance':
        return renderAppearanceSection();
      case 'display':
        return renderDisplaySection();
      case 'general':
      default:
        return renderGeneralSection();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <ClosedCaptioning className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Caption Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure live transcription
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close caption settings"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Navigation */}
      <div className="p-4">
        {renderNavigation()}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        {renderActiveSection()}
      </div>

      {/* Footer with status */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              enabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {enabled ? 'Captions enabled' : 'Captions disabled'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </motion.div>
  );
};

CaptionsConfigPanel.displayName = 'CaptionsConfigPanel';

export default CaptionsConfigPanel;
