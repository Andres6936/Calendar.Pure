"use strict";

import {AbstractCalendar} from "./AbstractCalendar.js";

class CalendarDouble extends AbstractCalendar {
    provideRangeSwitcherDate() {

        const daysOfTheWeek = this.provideDaysOfTheWeek();

        // With the attribute spellcheck="false" turn off the spell checking.
        return '<div class="dr-input">' +
            '<div class="dr-dates">' +
            '<div class="dr-date dr-date-start" contenteditable spellcheck="false">' + moment(this.startDate).format(this.formatInput) + '</div>' +
            '<span class="dr-dates-dash">&ndash;</span>' +
            '<div class="dr-date dr-date-end" contenteditable spellcheck="false">' + moment(this.endDate).format(this.formatInput) + '</div>' +
            '</div>' +

            (this.presets ? '<div class="dr-presets">' +
                '<span class="dr-preset-bar"></span>' +
                '<span class="dr-preset-bar"></span>' +
                '<span class="dr-preset-bar"></span>' +
                '</div>' : '') +
            '</div>' +

            '<div class="dr-selections">' +
            '<div class="dr-calendar" style="display: none;">' +
            '<div class="dr-range-switcher">' +
            '<div class="dr-switcher dr-month-switcher">' +
            '<i class="dr-left"></i>' +
            '<span>April</span>' +
            '<i class="dr-right"></i>' +
            '</div>' +
            '<div class="dr-switcher dr-year-switcher">' +
            '<i class="dr-left"></i>' +
            '<span>2015</span>' +
            '<i class="dr-right"></i>' +
            '</div>' +
            '</div>' +
            daysOfTheWeek.outerHTML +
            '<ul class="dr-day-list"></ul>' +
            '</div>' +
            (this.presets ? this.presetCreate()[0].outerHTML : '') +
            '</div>';
    }
}

export {CalendarDouble};
