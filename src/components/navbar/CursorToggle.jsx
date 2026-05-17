import { MousePointer } from 'lucide-react';

import Button from '../common/Button';

const CursorToggle = ({ cursorEnabled, toggleCursor }) => (
  <Button
    variant="primary"
    onClick={toggleCursor}
    aria-label={cursorEnabled ? 'Turn fluid cursor off' : 'Turn fluid cursor on'}
    aria-pressed={cursorEnabled}
    title={cursorEnabled ? 'Turn fluid cursor off' : 'Turn fluid cursor on'}
  >
    <MousePointer aria-hidden="true" />
  </Button>
);

export default CursorToggle;
