import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import NotificationStatus from "../components/NotificationStatus.jsx";
import { getNotifications } from "../services/notificationApi.js";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotifications().then(setNotifications).catch(() => {});
  }, []);

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Notification history</h1>
        <p className="text-sm text-ink-500">SMS and WhatsApp heat alerts sent to subscribed users.</p>
        <div className="mt-8 flex flex-col gap-2">
          {notifications.length === 0 && <p className="text-sm text-ink-400">No notifications yet.</p>}
          {notifications.map((n) => <NotificationStatus key={n._id} notification={n} />)}
        </div>
      </div>
    </div>
  );
}
