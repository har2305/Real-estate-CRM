import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';

// Mock API
export const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

// Mock user data
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  full_name: 'Test User',
};

// Mock lead data
export const mockLead = {
  id: 1,
  user_id: 1,
  first_name: 'John',
  last_name: 'Doe',
  full_name: 'John Doe',
  email: 'john@example.com',
  phone: '555-1234',
  status: 'new',
  source: 'website',
  budget_min: 200000,
  budget_max: 400000,
  property_interest: '3 bedroom house',
  is_active: true,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

// Mock activity data
export const mockActivity = {
  id: 1,
  lead_id: 1,
  lead: {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    full_name: 'John Doe',
  },
  user_id: 1,
  user: {
    id: 1,
    username: 'test@example.com',
  },
  activity_type: 'call',
  title: 'Initial contact call',
  notes: 'Discussed property requirements',
  duration: 30,
  activity_date: '2024-01-15T14:00:00Z',
  created_at: '2024-01-15T14:00:00Z',
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialAuthState?: {
    user: typeof mockUser | null;
    token: string | null;
  };
}

const AllTheProviders = ({ 
  children, 
  initialAuthState = { user: null, token: null } 
}: { 
  children: React.ReactNode;
  initialAuthState?: { user: typeof mockUser | null; token: string | null };
}) => {
  // Mock localStorage for auth state
  if (initialAuthState.token) {
    localStorage.setItem('access', initialAuthState.token);
  }
  if (initialAuthState.user) {
    localStorage.setItem('user', JSON.stringify(initialAuthState.user));
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialAuthState, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialAuthState={initialAuthState}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Mock API responses
export const mockApiResponses = {
  login: {
    access: 'mock-access-token',
    refresh: 'mock-refresh-token',
    user: mockUser,
  },
  register: {
    access: 'mock-access-token',
    refresh: 'mock-refresh-token',
    user: mockUser,
  },
  me: mockUser,
  leads: {
    count: 1,
    next: null,
    previous: null,
    results: [mockLead],
  },
  lead: mockLead,
  activities: {
    count: 1,
    next: null,
    previous: null,
    results: [mockActivity],
  },
  activity: mockActivity,
  recentActivities: [mockActivity],
};

// Helper functions for tests
export const createMockApiResponse = (data: any, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
});

export const createMockApiError = (status = 400, message = 'Bad Request') => ({
  response: {
    data: { detail: message },
    status,
    statusText: 'Bad Request',
    headers: {},
    config: {},
  },
});

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render };
