import React from 'react';
import { Badge } from '../../../../shared/ui/Badge';
import { useTheme } from '../../../../shared/ui/theme';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
} from '../../domain/Task';

export const PriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  const { colors } = useTheme();
  const color = { High: colors.high, Medium: colors.medium, Low: colors.low }[
    priority
  ];
  return (
    <Badge
      label={`Prioridad ${PRIORITY_LABELS[priority].toLowerCase()}`}
      color={color}
    />
  );
};

export const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const { colors } = useTheme();
  const color = {
    Pending: colors.pending,
    InProgress: colors.inProgress,
    Completed: colors.completed,
  }[status];
  return <Badge label={STATUS_LABELS[status]} color={color} />;
};
