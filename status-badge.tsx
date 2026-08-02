import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LessonStatus } from '@workspace/api-client-react';

interface StatusBadgeProps {
  status: LessonStatus;
  className?: string;
}

const statusConfig: Record<
  LessonStatus,
  { label: string; className: string }
> = {
  upcoming: {
    label: '未実施',
    className: 'bg-muted text-muted-foreground border-muted-foreground/20',
  },
  in_progress: {
    label: '授業中',
    className: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  },
  completed: {
    label: '完了',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border',
        config.className,
        className
      )}
      data-testid={`status-badge-${status}`}
    >
      {config.label}
    </motion.span>
  );
}
