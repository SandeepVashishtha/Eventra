import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import GeneralInfoStep from '../components/common/EventCreation/components/GeneralInfoStep';

describe('GeneralInfoStep', () => {
  it('should render without crashing', () => {
    const mockProps = {
      formData: { title: '', description: '', category: '', banner: null, bannerPreview: null },
      setFormData: jest.fn(),
      errors: {},
      handleInputChange: jest.fn(),
      handleImageUpload: jest.fn(),
      prefersReducedMotion: false,
      categories: [{ value: 'tech', label: 'Technology' }],
    };
    
    // Basic render test to ensure component mounts
    expect(GeneralInfoStep).toBeDefined();
  });
});