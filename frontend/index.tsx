
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import { ClubProvider } from './context/ClubContext';
import { QueryProvider } from './providers/QueryProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryProvider>
      <AuthProvider>
        <DataProvider>
          <ClubProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </ClubProvider>
        </DataProvider>
      </AuthProvider>
    </QueryProvider>
  </React.StrictMode>
);
