// NotificationContext.js
import React, { createContext, useState, useEffect } from "react";
import io from "socket.io-client";
import { decryptData } from "../../cryptoUtils";

// Create the NotificationContext
export const NotificationContext = createContext();

// Provide the context to your app components
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userType = decryptData(sessionStorage.getItem("userType"));

    let socket;

    if (userType === "testing") {
      socket = io(import.meta.env.VITE_BACKEND_URL);

      // Listen for new notifications from the backend
      socket.on("new_notification", (data) => {
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
    }

    // Clean up the socket connection on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const markNotificationAsViewed = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, viewed: true } : notif
      )
    );
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const markAllAsViewed = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, viewed: true }))
    );
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markNotificationAsViewed,
        markAllAsViewed,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
