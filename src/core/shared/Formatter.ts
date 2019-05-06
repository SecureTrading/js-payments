export default abstract class Formatter {
  public static trimNonNumeric(data: string): string {
    return data.trim().replace(Formatter.DATA_NON_NUMERIC, '');
  }

  public static maskExpirationDate(data: string): string {
    if (Formatter.DATE_MONTH_WITHOUT_SEPARATOR.test(data)) {
      return `${data}/`;
    } else if (Formatter.DATE_MONTH_WITH_SEPARATOR.test(data)) {
      return data.replace('/', '');
    } else {
      return data;
    }
  }

  private static DATA_NON_NUMERIC: RegExp = /\D/g;
  private static DATE_MONTH_WITH_SEPARATOR: RegExp = /^\d\d\/$/;
  private static DATE_MONTH_WITHOUT_SEPARATOR: RegExp = /^\d\d$/;
}
