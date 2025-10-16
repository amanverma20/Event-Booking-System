import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000');
      
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated]);

  const lockSeat = (eventId, seatNumber) => {
    if (socket && connected) {
      socket.emit('lock-seat', { eventId, seatNumber });
    }
  };

  const unlockSeat = (eventId, seatNumber) => {
    if (socket && connected) {
      socket.emit('unlock-seat', { eventId, seatNumber });
    }
  };

  const onSeatLocked = (callback) => {
    if (socket) {
      socket.on('seat-locked', callback);
    }
  };

  const onSeatUnlocked = (callback) => {
    if (socket) {
      socket.on('seat-unlocked', callback);
    }
  };

  const offSeatLocked = (callback) => {
    if (socket) {
      socket.off('seat-locked', callback);
    }
  };

  const offSeatUnlocked = (callback) => {
    if (socket) {
      socket.off('seat-unlocked', callback);
    }
  };

  const value = {
    socket,
    connected,
    lockSeat,
    unlockSeat,
    onSeatLocked,
    onSeatUnlocked,
    offSeatLocked,
    offSeatUnlocked
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
