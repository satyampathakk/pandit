import { useEffect, useRef, useState } from 'react';

export function useFlashMessage() {
  const [message, setMessage] = useState({ text: '', type: '' });
  const timeoutRef = useRef(null);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (type === 'success') {
      timeoutRef.current = setTimeout(() => {
        setMessage({ text: '', type: '' });
        timeoutRef.current = null;
      }, 3000);
    }
  };

  const clearMessage = () => {
    setMessage({ text: '', type: '' });
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { message, showMessage, clearMessage };
}