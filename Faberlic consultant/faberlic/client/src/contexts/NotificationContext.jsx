import React, { createContext, useContext } from 'react';
import Swal from 'sweetalert2';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const showSuccess = (message, title = "Uğurlu!") => {
    Swal.fire({
      title,
      text: message,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        confirmButton: '!rounded-xl'
      }
    });
  };

  const showError = (message, title = "Xəta!") => {
    Swal.fire({
      title,
      text: message,
      icon: "error",
      customClass: {
        confirmButton: '!rounded-xl'
      }
    });
  };

  const showWarning = (message, title = "Diqqət!") => {
    Swal.fire({
      title,
      text: message,
      icon: "warning",
      customClass: {
        confirmButton: '!rounded-xl'
      }
    });
  };

  const showInfo = (message, title = "Məlumat") => {
    Swal.fire({
      title,
      text: message,
      icon: "info",
      customClass: {
        confirmButton: '!rounded-xl'
      }
    });
  };

  const showConfirm = async (options = {}) => {
    const result = await Swal.fire({
      title: options.title || "Əminsiniz?",
      text: options.text || "Bu məlumatı silmək istədiyinizə əminsiniz?",
      icon: options.icon || "warning",
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText || "Bəli, sil",
      cancelButtonText: options.cancelButtonText || "Ləğv et",
      confirmButtonColor: options.confirmButtonColor || "#d33",
      customClass: {
        confirmButton: '!rounded-xl',
        cancelButton: '!rounded-xl'
      }
    });
    return result.isConfirmed;
  };

  return (
    <NotificationContext.Provider
      value={{ showSuccess, showError, showWarning, showInfo, showConfirm }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
