"use strict";

class AbstractCalendar {
    constructor() {
        if (new.target === AbstractCalendar) {
            throw new TypeError('Cannot construct Abstract Calendar instances directly');
        }
    }
}

export {AbstractCalendar};
