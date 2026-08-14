import React, { useState, useRef, useEffect } from 'react';

export const TagSelector = ({ tags = [], onTagsChange }) => {
  const [selectedTags, setSelectedTags] = useState(tags);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setSelectedTags(tags);
  }, [tags]);

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
      e.preventDefault();
      const updatedTags = selectedTags.slice(0, -1);
      setSelectedTags(updatedTags);
      if (onTagsChange) onTagsChange(updatedTags);

      // Retain focus on the input field after state update
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      });
    } else if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      if (!selectedTags.includes(inputValue.trim())) {
        const updatedTags = [...selectedTags, inputValue.trim()];
        setSelectedTags(updatedTags);
        if (onTagsChange) onTagsChange(updatedTags);
      }
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove) => {
    const updatedTags = selectedTags.filter((_, index) => index !== indexToRemove);
    setSelectedTags(updatedTags);
    if (onTagsChange) onTagsChange(updatedTags);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="tag-selector-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      {selectedTags.map((tag, index) => (
        <span key={index} className="tag-chip" style={{ background: '#e0e7ff', padding: '4px 8px', borderRadius: '4px' }}>
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            aria-label={`Remove tag ${tag}`}
            style={{ marginLeft: '6px', border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            &times;
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add tag..."
        aria-label="Tag input field"
      />
    </div>
  );
};

export default TagSelector;
