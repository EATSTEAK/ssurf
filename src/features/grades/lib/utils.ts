export const rankToRating = (rank: string): null | number => {
  switch (rank) {
    case 'A0':
      return 4.3;
    case 'A+':
      return 4.5;
    case 'A-':
      return 4.0;
    case 'B0':
      return 3.3;
    case 'B+':
      return 3.5;
    case 'B-':
      return 3.0;
    case 'C0':
      return 2.3;
    case 'C+':
      return 2.5;
    case 'C-':
      return 2.0;
    case 'D0':
      return 1.3;
    case 'D+':
      return 1.5;
    case 'D-':
      return 1.0;
    case 'F':
      return 0.0;
    default:
      return null;
  }
};
