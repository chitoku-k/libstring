/*
 * libstring - Copyright 2014, Chitoku
 * https://chitoku.jp/
 *
 * Licensed under MIT License
 * http://www.opensource.org/licenses/mit-license
 */

declare module libstring {
    export interface StringPrototype {
        endsWith(searchString: string, position?: number): boolean;
        escapeHTML(): string;
        includes(searchString: string, position?: number): boolean;
        repeat(count: number): string;
        startsWith(searchString: string, position?: number): boolean;
        unescapeHTML(): string;
        [prototype: string]: any;
    }
}

interface String extends libstring.StringPrototype { }

interface StringConstructor {
    format(format: string, ...args: any[]): string;
}
