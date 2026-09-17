import { TrainSchedule, SeatClass } from '../types';

/**
 * Formats a date string 'YYYY-MM-DD' and time 'HH:MM' into Google Calendar UTC/Local ISO format
 */
export function formatCalendarDateTimes(
  dateStr: string,
  depTime: string,
  arrTime: string
) {
  // Parse date
  const [year, month, day] = dateStr.split('-').map(Number);
  const [depH, depM] = depTime.split(':').map(Number);
  const [arrH, arrM] = arrTime.split(':').map(Number);

  // Pad helper
  const pad = (n: number) => String(n).padStart(2, '0');

  // Dep date
  const depDate = new Date(year, month - 1, day, depH, depM, 0);

  // Arr date (if arrival time < dep time, it spans into the next day like Night Mail)
  const isNextDay = arrH < depH || (arrH === depH && arrM < depM);
  const arrDate = new Date(year, month - 1, isNextDay ? day + 1 : day, arrH, arrM, 0);

  const startIso = `${depDate.getFullYear()}${pad(depDate.getMonth() + 1)}${pad(depDate.getDate())}T${pad(depDate.getHours())}${pad(depDate.getMinutes())}00`;
  const endIso = `${arrDate.getFullYear()}${pad(arrDate.getMonth() + 1)}${pad(arrDate.getDate())}T${pad(arrDate.getHours())}${pad(arrDate.getMinutes())}00`;

  return { startIso, endIso, depDate, arrDate };
}

/**
 * Builds a direct Google Calendar Web Intent URL
 */
export function generateGoogleCalendarUrl(
  train: TrainSchedule,
  dateStr: string,
  selectedClass?: SeatClass
): string {
  const { startIso, endIso } = formatCalendarDateTimes(
    dateStr,
    train.departure_time,
    train.arrival_time
  );

  const title = `🚆 Ceylon Rail: ${train.train_name} (${train.origin} ➔ ${train.destination})`;
  
  const details = [
    `Ceylon Rail Departure Alert`,
    `Train: ${train.train_name} (No. ${train.train_id}) - ${train.train_type}`,
    `Line: ${train.line}`,
    `Departure: ${train.departure_time} from ${train.origin}`,
    `Arrival: ${train.arrival_time} at ${train.destination}`,
    `Class: ${selectedClass || train.classes.join(', ')}`,
    train.scenic_highlight ? `Scenic Tip: ${train.scenic_highlight}` : '',
    `Official SLR Booking: https://seatreservation.railway.gov.lk`,
    `Notice: Please arrive at the platform at least 30 minutes before departure.`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const location = `${train.origin} Railway Station, Sri Lanka`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startIso}/${endIso}`,
    details: details,
    location: location,
    ctz: 'Asia/Colombo',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates and downloads an .ICS iCalendar file for iOS / Android / Desktop
 */
export function downloadIcsFile(
  train: TrainSchedule,
  dateStr: string,
  selectedClass?: SeatClass
) {
  const { startIso, endIso } = formatCalendarDateTimes(
    dateStr,
    train.departure_time,
    train.arrival_time
  );

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ceylon Rail//Sri Lanka Railways Timetable//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:ceylon-rail-${train.train_id}-${Date.now()}@ceylonrail.lk`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART;TZID=Asia/Colombo:${startIso}`,
    `DTEND;TZID=Asia/Colombo:${endIso}`,
    `SUMMARY:🚆 Ceylon Rail: ${train.train_name} (${train.origin} to ${train.destination})`,
    `DESCRIPTION:Train: ${train.train_name} (${train.train_id})\\nLine: ${train.line}\\nDeparts: ${train.departure_time}\\nArrives: ${train.arrival_time}\\nClass: ${selectedClass || train.classes.join(', ')}\\nScenic: ${train.scenic_highlight || 'Spectacular views'}\\nBookings: https://seatreservation.railway.gov.lk`,
    `LOCATION:${train.origin} Railway Station, Sri Lanka`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT45M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Your Ceylon Rail train departs in 45 minutes! Head to the platform.',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `CeylonRail_${train.train_name.replace(/\s+/g, '_')}_${dateStr}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Builds Google Tasks quick add URL / deep link
 */
export function generateGoogleTasksUrl(train: TrainSchedule, dateStr: string): string {
  const taskTitle = encodeURIComponent(
    `Board ${train.train_name} at ${train.origin} (${train.departure_time})`
  );
  return `https://tasks.google.com/?text=${taskTitle}`;
}
