import React from "react";
import { MessageSquare, Smartphone, CheckCircle2, XCircle, Clock } from "lucide-react";

const STATUS_STYLE = {
  SENT: { icon: CheckCircle2, color: "text-risk-low" },
  SIMULATED_SENT: { icon: Clock, color: "text-sky-500" },
  FAILED: { icon: XCircle, color: "text-risk-extreme" },
  PENDING: { icon: Clock, color: "text-ink-400" },
};

export default function NotificationStatus({ notification }) {
  const style = STATUS_STYLE[notification.status] || STATUS_STYLE.PENDING;
  const Icon = style.icon;
  const ChannelIcon = notification.channel === "WHATSAPP" ? MessageSquare : Smartphone;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-ink-100 bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        <ChannelIcon size={18} className="text-ink-400" />
        <div>
          <p className="text-sm font-medium text-ink-900">{notification.channel} · {notification.location}</p>
          <p className="text-xs text-ink-400">{notification.message?.slice(0, 60)}...</p>
        </div>
      </div>
      <div className={`flex items-center gap-1.5 text-sm ${style.color}`}>
        <Icon size={16} />
        {notification.status === "SIMULATED_SENT" ? "Simulated" : notification.status.toLowerCase()}
      </div>
    </div>
  );
}
