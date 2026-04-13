import { useState, useEffect } from "react";

/**
 * Renders a fixed bottom banner when the browser reports no network connection.
 * Disappears automatically once the connection is restored.
 */
export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#f59e0b",
        color: "#1c1917",
        textAlign: "center",
        padding: "8px 16px",
        fontSize: "14px",
        fontWeight: 500,
        zIndex: 9999,
        boxShadow: "0 -2px 6px rgba(0,0,0,0.15)",
      }}
    >
      You're offline — showing cached data
    </div>
  );
}
