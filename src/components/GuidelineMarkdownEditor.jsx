import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';

export const GuidelineMarkdownEditor = ({ initialValue = '', onChange }) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (val) => {
    setValue(val || '');
    if (onChange) {
      onChange(val || '');
    }
  };

  return (
    <div className="guideline-markdown-editor w-full border rounded-lg p-4 bg-white dark:bg-gray-900 shadow-sm" data-color-mode="auto">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Hackathon Guidelines & Rules Editor
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Split Preview Enabled
        </span>
      </div>
      
      <MDEditor
        value={value}
        onChange={handleChange}
        preview="live"
        height={400}
        visibleDragbar={false}
        className="w-full border rounded"
      />
    </div>
  );
};

export default GuidelineMarkdownEditor;
