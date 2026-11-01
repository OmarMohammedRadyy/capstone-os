"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import { useTranslation } from "@/i18n/context";

interface NotificationItem {
  id: string;
  category: string;
  type: string;
  params: any;
  href?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export function NotificationMenu({ userId }: { userId: string }) {
  const { locale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/v1/notifications/mark-all-read", { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/v1/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative"
      >
        <Bell className="h-4 w-4 text-[var(--ink)]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 end-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--danger)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--danger)]"></span>
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute end-0 mt-2 w-80 sm:w-96 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-modal z-50 overflow-hidden">
            <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[var(--ink)]">الإشعارات والتنبيهات</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--danger-subtle)] text-[var(--danger)] font-semibold">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span>تحديد الكل كمقروء</span>
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-subtle)]">
              {loading && notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--ink-secondary)]">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2 text-[var(--ink-muted)]" />
                  جاري تحميل الإشعارات...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-[var(--ink-secondary)]">
                  لا توجد تنبيهات جديدة حاليًا.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-start hover:bg-[var(--surface-hover)] transition-colors ${
                      !n.readAt ? "bg-[var(--accent-subtle)]/30" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {n.href ? (
                          <Link
                            href={n.href}
                            onClick={() => {
                              handleMarkRead(n.id);
                              setIsOpen(false);
                            }}
                            className="text-xs font-semibold text-[var(--ink)] hover:text-[var(--accent)] line-clamp-2"
                          >
                            {n.params?.message || n.type}
                          </Link>
                        ) : (
                          <p className="text-xs font-semibold text-[var(--ink)] line-clamp-2">
                            {n.params?.message || n.type}
                          </p>
                        )}
                        <span className="text-[10px] text-[var(--ink-muted)] block mt-1">
                          {formatRelativeTime(n.createdAt, locale)}
                        </span>
                      </div>
                      {!n.readAt && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="h-2 w-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0"
                          title="Mark as read"
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

