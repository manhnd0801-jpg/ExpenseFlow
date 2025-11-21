import * as moment from 'moment-timezone';

export class DateUtil {
  private static readonly DEFAULT_TIMEZONE = 'UTC';
  private static readonly DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss';

  static now(timezone: string = this.DEFAULT_TIMEZONE): Date {
    return moment.tz(timezone).toDate();
  }

  static format(date: Date, format: string = this.DEFAULT_FORMAT, timezone: string = this.DEFAULT_TIMEZONE): string {
    return moment.tz(date, timezone).format(format);
  }

  static parse(dateString: string, format?: string, timezone: string = this.DEFAULT_TIMEZONE): Date {
    if (format) {
      return moment.tz(dateString, format, timezone).toDate();
    }
    return moment.tz(dateString, timezone).toDate();
  }

  static addDays(date: Date, days: number): Date {
    return moment(date).add(days, 'days').toDate();
  }

  static addMonths(date: Date, months: number): Date {
    return moment(date).add(months, 'months').toDate();
  }

  static addYears(date: Date, years: number): Date {
    return moment(date).add(years, 'years').toDate();
  }

  static startOfDay(date: Date): Date {
    return moment(date).startOf('day').toDate();
  }

  static endOfDay(date: Date): Date {
    return moment(date).endOf('day').toDate();
  }

  static startOfMonth(date: Date): Date {
    return moment(date).startOf('month').toDate();
  }

  static endOfMonth(date: Date): Date {
    return moment(date).endOf('month').toDate();
  }

  static isBetween(date: Date, startDate: Date, endDate: Date): boolean {
    return moment(date).isBetween(startDate, endDate, null, '[]');
  }

  static diffInDays(date1: Date, date2: Date): number {
    return moment(date1).diff(moment(date2), 'days');
  }
}