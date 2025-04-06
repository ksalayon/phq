import { Pipe, PipeTransform } from '@angular/core';
import { differenceInSeconds, format, formatDuration, intervalToDuration } from 'date-fns';

const THRESHOLD_IN_DAYS = 2; // If date is older than this value, then it reverts back to a standard date time display
const SECONDS_IN_A_MINUTE = 60;
const SECONDS_IN_AN_HOUR = 3600;
const SECONDS_IN_A_DAY = 86400;
const TWO_DAYS_IN_SECONDS = THRESHOLD_IN_DAYS * SECONDS_IN_A_DAY;

/**
 * Pipe that transforms a given date, string, or timestamp into a "time ago" format with detailed granularity.
 * The pipe dynamically adjusts the level of detail based on the time difference between the provided date and the current moment.
 *
 * Key Features:
 * - If the difference exceeds two days, the output displays the full date and time using the user's local time zone.
 * - For time differences less than two days, it provides a detailed "time ago" format with specific units such as days, hours, minutes, or seconds.
 *
 * Use Case:
 * The pipe is useful for displaying relative timestamps in real-time applications, activity feeds, or logs where detailed time context is needed.
 */
@Pipe({
  name: 'timeAgoDetailed',
  standalone: true,
})
export class TimeAgoDetailedPipe implements PipeTransform {
  transform(value: Date | string | number | undefined | null): string {
    if (!value) {
      return '';
    }
    const from = new Date(value);
    const now = new Date();

    const secondsDiff = differenceInSeconds(now, from);

    if (secondsDiff > TWO_DAYS_IN_SECONDS) {
      // Shows like: Apr 5, 2025, 2:32 PM (Local time)
      return format(from, 'PPpp'); // Uses user's browser locale + time zone
    }

    const duration = intervalToDuration({ start: from, end: now });

    let formatUnits: (keyof typeof duration)[] = [];

    if (secondsDiff < SECONDS_IN_A_MINUTE) {
      formatUnits = ['seconds'];
    } else if (secondsDiff < SECONDS_IN_AN_HOUR) {
      formatUnits = ['minutes', 'seconds'];
    } else if (secondsDiff < SECONDS_IN_A_DAY) {
      formatUnits = ['hours', 'minutes'];
    } else {
      formatUnits = ['days', 'hours'];
    }

    return formatDuration(duration, { format: formatUnits }) + ' ago';
  }
}
