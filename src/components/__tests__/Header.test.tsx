import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Header from '../Header';

// Мокаем модуль i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Мокаем хук авторизации
jest.mock('../../store/authStore');

describe('Header Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockReturnValue({
      user: null,
      logout: jest.fn(),
    });
  });

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(screen.getByText('SpoFrame')).toBeInTheDocument();
  });

  it('shows login link when user is not authenticated', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(screen.getByText('header.login')).toBeInTheDocument();
    expect(screen.queryByText('header.logout')).not.toBeInTheDocument();
  });

  it('shows logout button when user is authenticated', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { id: '1', name: 'Test User' },
      logout: jest.fn(),
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    expect(screen.getByText('header.logout')).toBeInTheDocument();
    expect(screen.queryByText('header.login')).not.toBeInTheDocument();
  });

  it('calls logout function when logout button is clicked', () => {
    const mockLogout = jest.fn();
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { id: '1', name: 'Test User' },
      logout: mockLogout,
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('header.logout'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('changes language when language button is clicked', () => {
    const localStorageSpy = jest.spyOn(Storage.prototype, 'setItem');
    const reloadSpy = jest.spyOn(window.location, 'reload');

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('RU'));
    
    expect(localStorageSpy).toHaveBeenCalledWith('language', 'ru');
    expect(reloadSpy).toHaveBeenCalled();

    localStorageSpy.mockRestore();
    reloadSpy.mockRestore();
  });
}); 