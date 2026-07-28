import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import SubmitProject from './SubmitProject';
import { projectService } from 'services/projectService';

const renderSubmitProject = () => render(<SubmitProject />, { wrapper: MemoryRouter });

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
import { toast } from 'react-toastify';

vi.mock('services/projectService', () => ({
  projectService: { submitProject: vi.fn() },
}));

vi.mock('context/AuthContext', async () => {
  const actual = await vi.importActual('context/AuthContext');
  return { ...actual, useAuth: vi.fn() };
});
import { useAuth as useAuthMock } from 'context/AuthContext';

const mockIsAuthenticated = vi.fn(() => true);

const PLACEHOLDERS = {
  projectName: 'Enter project name',
  teamName: 'Enter team name',
  email: 'your@email.com',
  githubLink: 'https://github.com/username/project',
  projectType: 'e.g., Web, Mobile, AI',
  techStack: 'e.g., React, Node.js, Python',
  description: 'Briefly describe your project, its purpose, and features.',
};

const fillValidForm = async (user) => {
  await user.type(screen.getByPlaceholderText(PLACEHOLDERS.projectName), 'My Project');
  await user.type(screen.getByPlaceholderText(PLACEHOLDERS.teamName), 'My Team');
  await user.type(screen.getByPlaceholderText(PLACEHOLDERS.email), 'me@example.com');
  await user.type(screen.getByPlaceholderText(PLACEHOLDERS.githubLink), 'https://github.com/me/repo');
  await user.type(screen.getByPlaceholderText(PLACEHOLDERS.projectType), 'Web');
  await user.type(screen.getByPlaceholderText(PLACEHOLDERS.techStack), 'React');
  await user.type(
    screen.getByPlaceholderText(PLACEHOLDERS.description),
    'A description that is long enough to pass validation.'
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  mockIsAuthenticated.mockReturnValue(true);
  useAuthMock.mockReturnValue({
    user: { id: 'user-1' },
    token: 'tok-123',
    isAuthenticated: mockIsAuthenticated,
  });
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn();
});

describe('SubmitProject - auth guard', () => {
  it('redirects to /login on mount when not authenticated', () => {
    mockIsAuthenticated.mockReturnValue(false);
    renderSubmitProject();
    expect(toast.error).toHaveBeenCalledWith('You must be logged in to submit a project.');
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('does not redirect when authenticated', () => {
    renderSubmitProject();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('blocks submission and redirects when not authenticated at submit time', async () => {
    const user = userEvent.setup();
    mockIsAuthenticated.mockReturnValue(false);
    renderSubmitProject();
    mockNavigate.mockClear();
    toast.error.mockClear();

    await user.click(screen.getByRole('button', { name: /submit project/i }));

    expect(toast.error).toHaveBeenCalledWith('You must be logged in to submit a project.');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(projectService.submitProject).not.toHaveBeenCalled();
  });
});

describe('SubmitProject - form validation wiring', () => {
  it('shows required field errors and focuses the first invalid field on empty submit', async () => {
    const user = userEvent.setup();
    renderSubmitProject();

    await user.click(screen.getByRole('button', { name: /submit project/i }));

    expect(toast.error).toHaveBeenCalledWith('Please fix the errors before submitting!');
    expect(await screen.findByText('Project Name is required.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(PLACEHOLDERS.projectName)).toHaveFocus();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(projectService.submitProject).not.toHaveBeenCalled();
  });
});

describe('SubmitProject - submission flow', () => {
  it('submits sanitized data and resets the form on success', async () => {
    const user = userEvent.setup();
    projectService.submitProject.mockResolvedValueOnce({ success: true });
    renderSubmitProject();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /submit project/i }));

    await waitFor(() => expect(projectService.submitProject).toHaveBeenCalledTimes(1));
    const [sentData, config] = projectService.submitProject.mock.calls[0];
    expect(sentData).toMatchObject({
      projectName: 'My Project',
      teamName: 'My Team',
      submittedBy: 'user-1',
    });
    expect(config).toEqual({ headers: { Authorization: 'tok-123' } });
    expect(toast.success).toHaveBeenCalledWith('Project submitted successfully!');
    expect(screen.getByPlaceholderText(PLACEHOLDERS.projectName)).toHaveValue('');
  });

  it('shows an error toast with a working Retry action on failure', async () => {
    const user = userEvent.setup();
    projectService.submitProject
      .mockRejectedValueOnce(new Error('Server exploded'))
      .mockResolvedValueOnce({ success: true });
    renderSubmitProject();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /submit project/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Server exploded',
        expect.objectContaining({ action: expect.objectContaining({ label: 'Retry' }) })
      )
    );

    const [, options] = toast.error.mock.calls.find((call) => call[0] === 'Server exploded');
    options.action.onClick();

    await waitFor(() => expect(projectService.submitProject).toHaveBeenCalledTimes(2));
  });
});

describe('SubmitProject - image upload', () => {
  const getFileInput = (container) => container.querySelector('input[type="file"]');

  it('rejects a non-image file', async () => {
    const { container } = renderSubmitProject();
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });

    // fireEvent bypasses userEvent's `accept` attribute filtering so we can
    // exercise the component's own file-type check.
    fireEvent.change(getFileInput(container), { target: { files: [file] } });

    expect(toast.error).toHaveBeenCalledWith('Please upload an image file!');
    expect(screen.queryByAltText('Project Preview')).not.toBeInTheDocument();
  });

  it('stores and previews a valid image, and clears it via the remove button', async () => {
    const user = userEvent.setup();
    const { container } = renderSubmitProject();
    const file = new File(['image-bytes'], 'logo.png', { type: 'image/png' });

    await user.upload(getFileInput(container), file);

    await waitFor(() => expect(screen.getByAltText('Project Preview')).toBeInTheDocument());
    expect(toast.success).toHaveBeenCalledWith('Image uploaded successfully!');

    await user.click(screen.getByRole('button', { name: /remove uploaded project image/i }));
    expect(screen.queryByAltText('Project Preview')).not.toBeInTheDocument();
  });

  it('accepts a valid image dropped onto the dropzone', async () => {
    const { container } = renderSubmitProject();
    const file = new File(['image-bytes'], 'logo.png', { type: 'image/png' });
    const dropzone = getFileInput(container).parentElement;

    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    await waitFor(() => expect(screen.getByAltText('Project Preview')).toBeInTheDocument());
    expect(toast.success).toHaveBeenCalledWith('Image uploaded successfully!');
  });
});
