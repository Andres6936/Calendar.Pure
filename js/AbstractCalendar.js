"use strict";

// noinspection JSUnresolvedVariable

/**
 * Abstract class, Reference: https://stackoverflow.com/a/30560792
 *
 * The methods that must be implemented are: {provideRangeSwitcherDate},
 * if the method not is implemented a TypeError is throw.
 */
class AbstractCalendar {
    constructor() {
        if (new.target === AbstractCalendar) {
            throw new TypeError('Cannot construct Abstract Calendar instances directly');
        }

        // The method must be implemented the the child class.
        if (this.provideRangeSwitcherDate === undefined) {
            throw new TypeError("The method {provideRangeSwitcherDate} must be implemented.")
        }
    }
}

export {AbstractCalendar};
