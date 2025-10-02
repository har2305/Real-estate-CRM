import { render, screen, waitFor, act } from '../../test-utils';
import { AuthProvider } from '../AuthProvider';
import { useAuth } from '../useAuth';
import { mockUser, mockApiResponses, createMockApiResponse } from '../../test-utils';

// Mock the API module
jest.mock('../../lib/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

import api from '../../lib/api';

const mockApi = api as jest.Mocked<typeof api>;

// Test component that uses the auth context
const TestComponent = () => {
  const { user, token, initializing, login, register, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="token">{token ? 'Has token' : 'No token'}</div>
      <div data-testid="initializing">{initializing ? 'Loading' : 'Ready'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register('test@example.com', 'password')}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with no user when no token exists', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('token')).toHaveTextContent('No token');
      expect(screen.getByTestId('initializing')).toHaveTextContent('Ready');
    });
  });

  it('should fetch user data when token exists in localStorage', async () => {
    localStorage.setItem('access', 'mock-token');
    mockApi.get.mockResolvedValueOnce(createMockApiResponse(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledWith('/auth/me/');
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('token')).toHaveTextContent('Has token');
    });
  });

  it('should handle login successfully', async () => {
    mockApi.post.mockResolvedValueOnce(createMockApiResponse(mockApiResponses.login));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/auth/login/', {
        email: 'test@example.com',
        password: 'password',
      });
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(localStorage.getItem('access')).toBe('mock-access-token');
      expect(localStorage.getItem('refresh')).toBe('mock-refresh-token');
    });
  });

  it('should handle registration successfully', async () => {
    mockApi.post.mockResolvedValueOnce(createMockApiResponse(mockApiResponses.register));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const registerButton = screen.getByText('Register');
    
    await act(async () => {
      registerButton.click();
    });

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/auth/register/', {
        email: 'test@example.com',
        password: 'password',
        first_name: '',
        last_name: '',
      });
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(localStorage.getItem('access')).toBe('mock-access-token');
    });
  });

  it('should handle logout correctly', async () => {
    localStorage.setItem('access', 'mock-token');
    localStorage.setItem('refresh', 'mock-refresh-token');
    
    mockApi.get.mockResolvedValueOnce(createMockApiResponse(mockUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    const logoutButton = screen.getByText('Logout');
    
    await act(async () => {
      logoutButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('token')).toHaveTextContent('No token');
      expect(localStorage.getItem('access')).toBeNull();
      expect(localStorage.getItem('refresh')).toBeNull();
    });
  });

  it('should handle API errors during user fetch', async () => {
    localStorage.setItem('access', 'mock-token');
    mockApi.get.mockRejectedValueOnce(new Error('API Error'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('token')).toHaveTextContent('No token');
    });
  });

  it('should handle login errors', async () => {
    mockApi.post.mockRejectedValueOnce(new Error('Login failed'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
  });

  it('should register with first and last names', async () => {
    mockApi.post.mockResolvedValueOnce(createMockApiResponse(mockApiResponses.register));

    // Create a component that registers with names
    const RegisterWithNamesComponent = () => {
      const { register } = useAuth();
      
      return (
        <button onClick={() => register('test@example.com', 'password', 'John', 'Doe')}>
          Register with Names
        </button>
      );
    };

    render(
      <AuthProvider>
        <RegisterWithNamesComponent />
      </AuthProvider>
    );

    const registerButton = screen.getByText('Register with Names');
    
    await act(async () => {
      registerButton.click();
    });

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/auth/register/', {
        email: 'test@example.com',
        password: 'password',
        first_name: 'John',
        last_name: 'Doe',
      });
    });
  });
});
