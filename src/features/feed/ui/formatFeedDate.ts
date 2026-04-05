import { format } from 'date-fns';

export const formatFeedDate = (timestamp: null | number) => {
  if (!timestamp) {
    return '';
  }

  return format(new Date(timestamp), 'yyyy.MM.dd');
};
