import { render, screen, fireEvent } from '@testing-library/react';
import ScrollToTopButton, { shiftLandmarkFocus } from '../ScrollToTopButton';

vi.mock('../common/BackToTopButton', () => ({
  default: () => <div data-testid="back-to-top" />,
}));

vi.mock('../common/ScrollToBottomButton', () => ({
  default: () => <div data-testid="scroll-to-bottom" />,
}));

describe('ScrollToTopButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.MutationObserver = class {
      constructor() {}
      observe() {}
      disconnect() {}
    };
    window.scrollY = 0;
    document.body.innerHTML = '';
  });

  it('renders both navigation buttons', () => {
    render(<ScrollToTopButton />);
    expect(screen.getByTestId('back-to-top')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-to-bottom')).toBeInTheDocument();
  });

  it('adjusts position when chatbot is detected', () => {
    document.body.innerHTML = '<div data-chatbot-open="true"></div>';
    render(<ScrollToTopButton />);
    expect(screen.getByTestId('back-to-top')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-to-bottom')).toBeInTheDocument();
  });
});

describe('shiftLandmarkFocus', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="main-content">Content</div>';
  });

  it('focuses the target element and adds tabindex', () => {
    shiftLandmarkFocus('main-content');
    const target = document.getElementById('main-content');
    expect(target).toHaveAttribute('tabindex', '-1');
    expect(document.activeElement).toBe(target);
  });

  it('removes tabindex on blur', () => {
    shiftLandmarkFocus('main-content');
    const target = document.getElementById('main-content');
    expect(target).toHaveAttribute('tabindex', '-1');

    fireEvent.blur(target);
    expect(target).not.toHaveAttribute('tabindex');
  });

  it('does nothing when element does not exist', () => {
    expect(() => shiftLandmarkFocus('nonexistent')).not.toThrow();
  });

  it('does nothing when document is undefined', () => {
    const origDoc = global.document;
    delete global.document;
    expect(() => shiftLandmarkFocus('main-content')).not.toThrow();
    global.document = origDoc;
  });
});
