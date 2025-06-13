
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { styled } from '@mui/material/styles';
import { StepIconProps } from '@mui/material/StepIcon';

const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean; completed?: boolean; error?: boolean; isIncomplete?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
    display: 'flex',
    height: 45,
    width: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    position: 'relative',
    backgroundColor: 'currentColor',

    // Incomplete steps (gray background)
    ...(ownerState.isIncomplete && {
      backgroundColor: '#9CA3AF', // Gray background
      color: '#9CA3AF',
    }),
    // Active step (not completed, not error, not incomplete)
    ...(ownerState.active && !ownerState.completed && !ownerState.error && !ownerState.isIncomplete && {
      color: '#784af4',
      backgroundColor: '#784af4',
    }),
    // Completed steps
    ...(ownerState.completed && !ownerState.error && {
      backgroundColor: '#784af4',
      color: '#ffffff',
    }),
    // Error state (rejected)
    ...(ownerState.error && {
      backgroundColor: '#d32f2f', // Red background
      color: '#ffffff', // White icon
    }),
  }),
);

export function QontoStepIcon(props: StepIconProps & { isIncomplete?: boolean; isRejected?: boolean }) {
  const { active, completed, className, isIncomplete, isRejected } = props;
  const isError = isRejected && !completed;
  
  return (
    <QontoStepIconRoot ownerState={{ active, completed, error: isError, isIncomplete }} className={className}>
      {isError ? (
        <XCircle size={24} color="white" />
      ) : completed ? (
        <CheckCircle size={24} color="white" />
      ) : (
        // Inner circle for active (but not completed/error) or default non-active state
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: (active && !completed && !isError && !isIncomplete) ? 'white' : 'transparent',
        }} />
      )}
    </QontoStepIconRoot>
  );
}
