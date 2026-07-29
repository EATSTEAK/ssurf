const SEAT_PATTERN = /^([A-J])\s*-\s*(\d+)\s*-\s*(\d+)$/;

const parseChapelSeat = (seat: null | string | undefined) => {
  const match = seat?.trim().toUpperCase().match(SEAT_PATTERN);
  if (!match) {
    return null;
  }

  const row = Number(match[2]);
  const number = Number(match[3]);
  if (!Number.isSafeInteger(row) || row < 1 || !Number.isSafeInteger(number) || number < 1) {
    return null;
  }

  return {
    section: match[1],
    number,
    id: `${match[1]}-${row}-${number}`,
  };
};

export const getChapelSeatId = (floor: 1 | 2 | 3, seat: null | string | undefined) => {
  const parsed = parseChapelSeat(seat);
  if (!parsed || (floor === 1) !== 'ABCDE'.includes(parsed.section)) {
    return null;
  }

  return parsed.id;
};

export const getChapelDoorDirection = (seat: null | string | undefined) => {
  const parsed = parseChapelSeat(seat);
  if (!parsed) {
    return '';
  }

  switch (parsed.section) {
    case 'A':
    case 'B':
      return '정면 좌측 문';
    case 'C':
      return parsed.number < 6 ? '정면 좌측 문' : '정면 우측 문';
    case 'D':
    case 'E':
      return '정면 우측 문';
    case 'F':
    case 'G':
      return '좌측 문';
    case 'H':
      return parsed.number < 5 ? '좌측 문' : '우측 문';
    case 'I':
    case 'J':
      return '우측 문';
    default:
      return '';
  }
};
