// Accessible Event Card components grid layout
export function accessibleCardProps(onClickHandler) {
  return {
    tabIndex: 0,
    role: 'button',
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onClickHandler();
      }
    }
  };
}
