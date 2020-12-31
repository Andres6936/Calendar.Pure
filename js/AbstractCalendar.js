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

    #_presets = undefined;

    #_endDate = undefined;

    #_startDate = undefined;

    #_daysArray = undefined;

    #_latestDate = undefined;

    #_formatInput = undefined;

    #_placeholder = undefined;

    #_currentDate = undefined;

    #_earliestDate = undefined;

    #_formatPreset = undefined;

    #_settingsPresets = undefined;

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

    // Setters

    set presets(value) {
        this.#_presets = value;
    }

    set endDate(value) {
        this.#_endDate = value;
    }

    set startDate(value) {
        this.#_startDate = value;
    }

    set daysArray(value) {
        this.#_daysArray = value;
    }

    set latestDate(value) {
        this.#_latestDate = value;
    }

    set formatInput(value) {
        this.#_formatInput = value;
    }

    set placeholder(value) {
        this.#_placeholder = value;
    }

    set currentDate(value) {
        this.#_currentDate = value;
    }

    set earliestDate(value) {
        this.#_earliestDate = value;
    }

    set formatPreset(value) {
        this.#_formatPreset = value;
    }

    set settingsPresets(value) {
        this.#_settingsPresets = value;
    }

// Getters

    get presets() {
        return this.#_presets;
    }

    get endDate() {
        return this.#_endDate;
    }

    get startDate() {
        return this.#_startDate;
    }

    get daysArray() {
        return this.#_daysArray;
    }

    get latestDate() {
        return this.#_latestDate;
    }

    get formatInput() {
        return this.#_formatInput;
    }

    get placeholder() {
        return this.#_placeholder;
    }

    get currentDate() {
        return this.#_currentDate;
    }

    get earliestDate() {
        return this.#_earliestDate;
    }

    get formatPreset() {
        return this.#_formatPreset;
    }

    get settingsPresets() {
        return this.#_settingsPresets;
    }
}

export {AbstractCalendar};
