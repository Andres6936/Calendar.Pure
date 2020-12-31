"use strict";

// noinspection JSUnresolvedVariable

/**
 * Abstract class, Reference: https://stackoverflow.com/a/30560792
 *
 * The methods that must be implemented are: {provideRangeSwitcherDate},
 * if the method not is implemented a TypeError is throw.
 */
class AbstractCalendar {

    // Properties

    presets = undefined;

    endDate = undefined;

    selector = undefined;

    startDate = undefined;

    daysArray = undefined;

    latestDate = undefined;

    formatInput = undefined;

    placeholder = undefined;

    currentDate = undefined;

    earliestDate = undefined;

    formatPreset = undefined;

    settingsPresets = undefined;

    // Construct

    constructor() {
        if (new.target === AbstractCalendar) {
            throw new TypeError('Cannot construct Abstract Calendar instances directly');
        }

        // The method must be implemented the the child class.
        if (this.provideRangeSwitcherDate === undefined) {
            throw new TypeError("The method {provideRangeSwitcherDate} must be implemented.")
        }
    }

    // Methods

    provideDaysOfTheWeek() {
        // @type {HTMLUListElement} Created the element that contain the day of
        //  week {seven in total}.
        const daysOfTheWeek = document.createElement('ul');
        daysOfTheWeek.classList.add('dr-days-of-week-list');

        // @type {[string]} Contain the list of day in a week. {seven in total}.
        const days = this.daysArray.splice(moment.localeData().firstDayOfWeek()).concat(this.daysArray.splice(0, moment.localeData().firstDayOfWeek()));
        console.assert(days.length === 7, 'The week not have seven (7) days.');

        // @type {string} Generally a string of only two characters.
        for (const day of days) {
            console.assert(day.length === 2,
                'The string that represent the day not have two (2) characters.');

            // @type {HTMLLIElement} Represent the day.
            const element = document.createElement('li');
            element.classList.add('dr-day-of-week');
            element.innerText = day;

            daysOfTheWeek.appendChild(element);
        }

        return daysOfTheWeek;
    }
}

export {AbstractCalendar};
