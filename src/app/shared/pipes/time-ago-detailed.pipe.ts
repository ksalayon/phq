// src/app/pipes/time-ago-detailed.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { differenceInSeconds, format, formatDuration, intervalToDuration } from 'date-fns';

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
    const twoDaysInSeconds = 2 * 24 * 60 * 60;

    if (secondsDiff > twoDaysInSeconds) {
      // Shows like: Apr 5, 2025, 2:32 PM (Local time)
      return format(from, 'PPpp'); // Uses user's browser locale + time zone
    }

    const duration = intervalToDuration({ start: from, end: now });

    let formatUnits: (keyof typeof duration)[] = [];

    if (secondsDiff < 60) {
      formatUnits = ['seconds'];
    } else if (secondsDiff < 3600) {
      formatUnits = ['minutes', 'seconds'];
    } else if (secondsDiff < 86400) {
      formatUnits = ['hours', 'minutes'];
    } else {
      formatUnits = ['days', 'hours'];
    }

    return formatDuration(duration, { format: formatUnits }) + ' ago';
  }
}
