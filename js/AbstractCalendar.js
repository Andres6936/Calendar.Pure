"use strict";

/**
 * Abstract class, Reference: https://stackoverflow.com/a/30560792
 */
class AbstractCalendar {
    constructor() {
        if (new.target === AbstractCalendar) {
            throw new TypeError('Cannot construct Abstract Calendar instances directly');
        }
    }
}

export {AbstractCalendar};
