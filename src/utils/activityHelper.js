/**
 * Utility functions for creating and formatting task activity logs
 */

export const createActivityLog = (text) => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  return {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text,
    createdAt: Date.now(),
    timestamp: `Hari ini, ${timeStr}`
  };
};

export const formatActivityTime = (act) => {
  if (!act) return '';

  // If created with createdAt timestamp, calculate human-readable relative time
  if (act.createdAt && typeof act.createdAt === 'number') {
    const diffMs = Math.max(0, Date.now() - act.createdAt);
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} mnt lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
  }

  // Fallback to pre-existing string timestamp (e.g. initialData "Hari ini, 10:15")
  return act.timestamp || 'Baru saja';
};
