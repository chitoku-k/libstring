/*!
 * libstring - Copyright 2014, Chitoku
 * https://chitoku.jp/
 *
 * Licensed under MIT License
 * http://www.opensource.org/licenses/mit-license
 */
/// <reference path="./libstring.d.ts" />
var libstring;
(function (libstring) {
    var AD = "西暦";
    var MONTHS_LONG = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    var MONTHS_SHORT = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    var DAYS_LONG = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
    var DAYS_SHORT = ["日", "月", "火", "水", "木", "金", "土"];
    var AM_PM = ["午前", "午後"];
    var CallbackInvoker = (function () {
        function CallbackInvoker(search, replacer) {
            this.search = search;
            this.replacer = replacer;
        }
        CallbackInvoker.prototype.invoke = function (option, value) {
            if (this.search.some(function (x) { return x === option; })) {
                return this.replacer(value, option);
            }
            return null;
        };
        return CallbackInvoker;
    })();
    var RegExpReplacer = (function () {
        function RegExpReplacer(pattern, replacer) {
            this.pattern = pattern;
            this.replacer = replacer;
        }
        RegExpReplacer.prototype.invoke = function (option, value) {
            return option.replace(this.pattern, this.replacer.bind(this, value));
        };
        return RegExpReplacer;
    })();
    var StringFormatter = (function () {
        function StringFormatter() {
        }
        StringFormatter.prototype.separateByThousand = function (str) {
            var num = str.split(".");
            return num[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + (num[1] !== void 0 ? "." + num[1] : "");
        };
        StringFormatter.prototype.round = function (str, digit, defaultDigit) {
            digit = isNaN(digit) ? defaultDigit : digit;
            var p = Math.pow(10, digit);
            str = String(Math.round(+str * p) / p);
            if (digit === 0) {
                return str;
            }
            return str + (str.includes(".") ? "0".repeat(digit - (str.length - str.indexOf(".") - 1)) : "." + "0".repeat(digit));
        };
        StringFormatter.prototype.formatDate = function (format, value) {
            var result = null;
            for (var i = 0, len = StringFormatter.standardDateFormatReplacers.length; i < len; i++) {
                if ((result = StringFormatter.standardDateFormatReplacers[i].invoke(format, value)) !== null) {
                    return result;
                }
            }
            result = format;
            StringFormatter.customDateFormatReplacers.forEach(function (x) { return result = x.invoke(result, value); });
            return result;
        };
        StringFormatter.prototype.formatNumber = function (format, value) {
            if (format === void 0) {
                return value;
            }
            var match;
            if ((match = format.match(/^[Cc](\d+)?$/))) {
                return "¥" + this.separateByThousand(this.round(value, +match[1], 0));
            }
            if ((match = format.match(/^[Dd](\d+)?$/))) {
                value = String(Math.round(+value));
                var length = (match[1] === void 0 ? 0 : +match[1]) - value.length;
                if (+value < 0) {
                    return "-" + "0".repeat(Math.max(0, length + 1)) + value.slice(1);
                }
                else {
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
        };
        StringFormatter.invoke = function (format) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return format.replace(/{(\d+)(?::([^}]+))?\}/g, function (str, m1, m2, offset, target) {
                var value = args[+m1];
                if (value instanceof Date) {
                    return StringFormatter.instance.formatDate(m2 || "G", value);
                }
                if (!isNaN(+value)) {
                    return StringFormatter.instance.formatNumber(m2, String(value));
                }
                return value;
            });
        };
        StringFormatter.instance = new StringFormatter();
        StringFormatter.standardDateFormatReplacers = [
            new CallbackInvoker(["d"], function (date) { return String.format("{0:yyyy/MM/dd}", date); }),
            new CallbackInvoker(["D"], function (date) { return String.format("{0:yyyy年M月d日}", date); }),
            new CallbackInvoker(["t"], function (date) { return String.format("{0:H:mm}", date); }),
            new CallbackInvoker(["T"], function (date) { return String.format("{0:H:mm:ss}", date); }),
            new CallbackInvoker(["f"], function (date) { return String.format("{0:yyyy年M月d日 H:mm}", date); }),
            new CallbackInvoker(["F"], function (date) { return String.format("{0:yyyy年M月d日 H:mm:ss}", date); }),
            new CallbackInvoker(["g"], function (date) { return String.format("{0:yyyy/MM/dd H:mm}", date); }),
            new CallbackInvoker(["G"], function (date) { return String.format("{0:yyyy/MM/dd H:mm:ss}", date); }),
            new CallbackInvoker(["y", "Y"], function (date) { return String.format("{0:yyyy年M月}", date); }),
            new CallbackInvoker(["m", "M"], function (date) { return String.format("{0:M月d日}", date); }),
            new CallbackInvoker(["r", "R"], function (date) { return date.toUTCString(); }),
            new CallbackInvoker(["o", "O"], function (date) { return String.format("{0:yyyy-MM-ddTHH:mm:ss.fffffff}", date); }),
            new CallbackInvoker(["s"], function (date) { return String.format("{0:yyyy-MM-ddTHH:mm:ss}", date); }),
            new CallbackInvoker(["u"], function (date) { return String.format("{0:yyyy-MM-dd HH:mm:ssZ}", date); }),
            new CallbackInvoker(["U"], function (date) { return String.format("{0:D4}年{1}月{2}日 {3}:{4:D2}:{5:D2}", date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()); })
        ];
        StringFormatter.customDateFormatReplacers = [
            new RegExpReplacer(/d{4,}/g, function (date, format) { return DAYS_LONG[date.getDay()]; }),
            new RegExpReplacer(/ddd/g, function (date, format) { return DAYS_SHORT[date.getDay()]; }),
            new RegExpReplacer(/d+/g, function (date, format) { return String.format("{0:D" + format.length + "}", date.getDate()); }),
            new RegExpReplacer(/f+/g, function (date, format) { return date.getMilliseconds() + "0".repeat(format.length).slice(0, format.length - 1); }),
            new RegExpReplacer(/F+/g, function (date, format) { return ((format = (date.getMilliseconds() + "0".repeat(format.length)).slice(0, format.length)), +format === 0 ? "" : format); }),
            new RegExpReplacer(/g+/g, function () { return AD; }),
            new RegExpReplacer(/h+/g, function (date, format) { return String.format("{0:D" + format.length + "}", date.getHours() > 12 ? date.getHours() - 12 : date.getHours()); }),
            new RegExpReplacer(/H+/g, function (date, format) { return String.format("{0:D" + format.length + "}", date.getHours()); }),
            new RegExpReplacer(/K/g, function () { return "Z"; }),
            new RegExpReplacer(/m+/g, function (date, format) { return String.format("{0:D" + format.length + "}", date.getMinutes()); }),
            new RegExpReplacer(/MMMM/g, function (date, format) { return MONTHS_LONG[date.getMonth()]; }),
            new RegExpReplacer(/MMM/g, function (date, format) { return MONTHS_SHORT[date.getMonth()]; }),
            new RegExpReplacer(/M+/g, function (date, format) { return String.format("{0:D" + format.length + "}", date.getMonth() + 1); }),
            new RegExpReplacer(/s+/g, function (date, format) { return String.format("{0:D" + format.length + "}", date.getSeconds()); }),
            new RegExpReplacer(/t{2,}/g, function (date, format) { return date.getHours() <= 12 ? AM_PM[0] : AM_PM[1]; }),
            new RegExpReplacer(/t/g, function (date, format) { return (date.getHours() <= 12 ? AM_PM[0] : AM_PM[1]).charAt(0); }),
            new RegExpReplacer(/y+/g, function (date, format) { return String.format("{0:D" + format.length + "}", date.getFullYear()); }),
            new RegExpReplacer(/zzz/g, function () { return "+00:00"; }),
            new RegExpReplacer(/zz/g, function () { return "+00"; }),
            new RegExpReplacer(/z/g, function () { return "+0"; })
        ];
        return StringFormatter;
    })();
    libstring.StringFormatter = StringFormatter;
    libstring.prototypes = {
        includes: function (searchString, position) {
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        },
        startsWith: function (searchString, position) {
            return String.prototype.indexOf.apply(this, arguments) === (position || 0);
        },
        endsWith: function (searchString, position) {
            var str = this.toString();
            position = position === void 0 || position > str.length ? str.length : position;
            position -= searchString.length;
            var index = str.indexOf(searchString, position);
            return index !== -1 && index === position;
        },
        repeat: function (count) {
            if (count < 0 || count === Infinity) {
                throw new RangeError();
            }
            return count > 0 ? Array(count + 1).join(this) : "";
        },
        escapeHTML: function () {
            return this.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        },
        unescapeHTML: function () {
            return this.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#039;/g, "'").replace(/&amp;/g, "&");
        }
    };
    for (var member in libstring.prototypes) {
        if (!String.prototype[member]) {
            String.prototype[member] = libstring.prototypes[member];
        }
    }
    if (!String.format) {
        String.format = StringFormatter.invoke;
    }
})(libstring || (libstring = {}));
var module = module || {};
module.exports = libstring;
