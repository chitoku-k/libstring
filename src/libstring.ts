/*!
 * libstring - Copyright 2014, Chitoku
 * https://chitoku.jp/
 *
 * Licensed under MIT License
 * http://www.opensource.org/licenses/mit-license
 */
/// <reference path="./libstring.d.ts" />

module libstring {
    var AD = "西暦";
    var MONTHS_LONG = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    var MONTHS_SHORT = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    var DAYS_LONG = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
    var DAYS_SHORT = ["日", "月", "火", "水", "木", "金", "土"];
    var AM_PM = ["午前", "午後"];

    class CallbackInvoker<T> {
        constructor(public search: string[], public replacer: (value: T, format: string) => string) { }

        public invoke(option: string, value: T): string {
            if (this.search.some(x => x === option)) {
                return this.replacer(value, option);
            }
            return null;
        }
    }

    class RegExpReplacer<T> {
        constructor(public pattern: RegExp, public replacer: (value: T, format: string) => string) { }

        public invoke(option: string, value: T): string {
            return option.replace(this.pattern, this.replacer.bind(this, value));
        }
    }

    export class StringFormatter {
        private static instance = new StringFormatter();

        private static standardDateFormatReplacers: CallbackInvoker<Date>[] = [
            new CallbackInvoker<Date>(["d"],      date => String.format("{0:yyyy/MM/dd}", date)),
            new CallbackInvoker<Date>(["D"],      date => String.format("{0:yyyy年M月d日}", date)),
            new CallbackInvoker<Date>(["t"],      date => String.format("{0:H:mm}", date)),
            new CallbackInvoker<Date>(["T"],      date => String.format("{0:H:mm:ss}", date)),
            new CallbackInvoker<Date>(["f"],      date => String.format("{0:yyyy年M月d日 H:mm}", date)),
            new CallbackInvoker<Date>(["F"],      date => String.format("{0:yyyy年M月d日 H:mm:ss}", date)),
            new CallbackInvoker<Date>(["g"],      date => String.format("{0:yyyy/MM/dd H:mm}", date)),
            new CallbackInvoker<Date>(["G"],      date => String.format("{0:yyyy/MM/dd H:mm:ss}", date)),
            new CallbackInvoker<Date>(["y", "Y"], date => String.format("{0:yyyy年M月}", date)),
            new CallbackInvoker<Date>(["m", "M"], date => String.format("{0:M月d日}", date)),
            new CallbackInvoker<Date>(["r", "R"], date => date.toUTCString()),
            new CallbackInvoker<Date>(["o", "O"], date => String.format("{0:yyyy-MM-ddTHH:mm:ss.fffffff}", date)),
            new CallbackInvoker<Date>(["s"],      date => String.format("{0:yyyy-MM-ddTHH:mm:ss}", date)),
            new CallbackInvoker<Date>(["u"],      date => String.format("{0:yyyy-MM-dd HH:mm:ssZ}", date)),
            new CallbackInvoker<Date>(["U"],      date => String.format("{0:D4}年{1}月{2}日 {3}:{4:D2}:{5:D2}", date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()))
        ];

        private static customDateFormatReplacers: RegExpReplacer<Date>[] = [
            new RegExpReplacer<Date>(/d{4,}/g,    (date, format) => DAYS_LONG[date.getDay()]),
            new RegExpReplacer<Date>(/ddd/g,      (date, format) => DAYS_SHORT[date.getDay()]),
            new RegExpReplacer<Date>(/d+/g,       (date, format) => String.format("{0:D" + format.length + "}", date.getDate())),
            new RegExpReplacer<Date>(/f+/g,       (date, format) => date.getMilliseconds() + "0".repeat(format.length).slice(0, format.length - 1)),
            new RegExpReplacer<Date>(/F+/g,       (date, format) => ((format = (date.getMilliseconds() + "0".repeat(format.length)).slice(0, format.length)), +format === 0 ? "" : format)),
            new RegExpReplacer<Date>(/g+/g,       () => AD),
            new RegExpReplacer<Date>(/h+/g,       (date, format) => String.format("{0:D" + format.length + "}", date.getHours() > 12 ? date.getHours() - 12 : date.getHours())),
            new RegExpReplacer<Date>(/H+/g,       (date, format) => String.format("{0:D" + format.length + "}", date.getHours())),
            new RegExpReplacer<Date>(/K/g,        () => "Z"),
            new RegExpReplacer<Date>(/m+/g,       (date, format) => String.format("{0:D" + format.length + "}", date.getMinutes())),
            new RegExpReplacer<Date>(/MMMM/g,     (date, format) => MONTHS_LONG[date.getMonth()]),
            new RegExpReplacer<Date>(/MMM/g,      (date, format) => MONTHS_SHORT[date.getMonth()]),
            new RegExpReplacer<Date>(/M+/g,       (date, format) => String.format("{0:D" + format.length + "}", date.getMonth() + 1)),
            new RegExpReplacer<Date>(/s+/g,       (date, format) => String.format("{0:D" + format.length + "}", date.getSeconds())),
            new RegExpReplacer<Date>(/t{2,}/g,    (date, format) => date.getHours() <= 12 ? AM_PM[0] : AM_PM[1]),
            new RegExpReplacer<Date>(/t/g,        (date, format) => (date.getHours() <= 12 ? AM_PM[0] : AM_PM[1]).charAt(0)),
            new RegExpReplacer<Date>(/y+/g,       (date, format) => String.format("{0:D" + format.length + "}", date.getFullYear())),
            new RegExpReplacer<Date>(/zzz/g,      () => "+00:00"),
            new RegExpReplacer<Date>(/zz/g,       () => "+00"),
            new RegExpReplacer<Date>(/z/g,        () => "+0")
        ];

        private separateByThousand(str: string): string {
            var num = str.split(".");
            return num[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + (num[1] !== void 0 ? "." + num[1] : "");
        }

        private round(str: string, digit: number, defaultDigit: number): string {
            digit = isNaN(digit) ? defaultDigit : digit;
            var p = Math.pow(10, digit);
            str = String(Math.round(+str * p) / p);
            if (digit === 0) {
                return str;
            }
            return str + (str.includes(".") ? "0".repeat(digit - (str.length - str.indexOf(".") - 1)) : "." + "0".repeat(digit));
        }

        private formatDate(format: string, value: Date): string {
            var result: string = null;
            for (var i = 0, len = StringFormatter.standardDateFormatReplacers.length; i < len; i++) {
                if ((result = StringFormatter.standardDateFormatReplacers[i].invoke(format, value)) !== null) {
                    return result;
                }
            }
            result = format;
            StringFormatter.customDateFormatReplacers.forEach(x => result = x.invoke(result, value));
            return result;
        }

        private formatNumber(format: string, value: string): string {
            if (format === void 0) {
                return value;
            }
            var match: RegExpMatchArray;
            if ((match = format.match(/^[Cc](\d+)?$/))) {
                return "¥" + this.separateByThousand(this.round(value, +match[1], 0));
            }
            if ((match = format.match(/^[Dd](\d+)?$/))) {
                value = String(Math.round(+value));
                var length = (match[1] === void 0 ? 0 : +match[1]) - value.length;
                if (+value < 0) {
                    return "-" + "0".repeat(Math.max(0, length + 1)) + value.slice(1);
                } else {
                    return "0".repeat(Math.max(0, length)) + value;
                }
            }
            if ((match = format.match(/^([Ee])(\d+)?$/))) {
                var length = Math.max(0, match[2] === void 0 ? 6 : +match[2]);
                return (+value).toExponential(length).replace(/[Ee]/, match[1]);
            }
            if ((match = format.match(/^[Ff](\d+)?$/))) {
                return this.round(value, +match[1], 2);
            }
            if ((match = format.match(/^[Nn](\d+)?$/))) {
                return this.separateByThousand(this.round(value, +match[1], 2));
            }
            if ((match = format.match(/^[Pp](\d+)?$/))) {
                return this.separateByThousand(this.round(String(+value * 100), +match[1], 2)) + " %";
            }
            if ((match = format.match(/(^[Xx])(\d+)?$/))) {
                value = match[1] === "X" ? (+value).toString(16).toUpperCase() : (+value).toString(16).toLowerCase();
                return "0".repeat(Math.max(0, (+match[2] || value.length) - value.length)) + value;
            }
            return value;
        }

        public static invoke(format: string, ...args: any[]) {
            return format.replace(/{(\d+)(?::([^}]+))?\}/g, (str: string, m1: string, m2: string, offset: number, target: string) => {
                var value = args[+m1];
                if (value instanceof Date) {
                    return StringFormatter.instance.formatDate(m2 || "G", value);
                }
                if (!isNaN(+value)) {
                    return StringFormatter.instance.formatNumber(m2, String(value));
                }
                return value;
            });
        }
    }

    export var prototypes: any = {
        includes: function (searchString: string, position?: number): boolean {
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        },
        startsWith: function (searchString: string, position?: number): boolean {
            return String.prototype.indexOf.apply(this, arguments) === (position || 0);
        },
        endsWith: function (searchString: string, position?: number): boolean {
            var str = (<string>this).toString();
            position = position === void 0 || position > str.length ? str.length : position;
            position -= searchString.length;
            var index = str.indexOf(searchString, position);
            return index !== -1 && index === position;
        },
        repeat: function (count: number): string {
            if (count < 0 || count === Infinity) {
                throw new RangeError();
            }
            return count > 0 ? Array(count + 1).join(this) : "";
        },
        escapeHTML: function (): string {
            return (<string>this).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        },
        unescapeHTML: function (): string {
            return (<string>this).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#039;/g, "'").replace(/&amp;/g, "&");
        }
    };

    for (var member in prototypes) {
        if (!String.prototype[member]) {
            String.prototype[<string>member] = prototypes[member];
        }
    }

    if (!String.format) {
        String.format = StringFormatter.invoke;
    }
}
export = libstring;
