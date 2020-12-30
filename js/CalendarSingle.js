"use strict";

import {AbstractCalendar} from "./AbstractCalendar.js";

class CalendarSingle extends AbstractCalendar {
    provideRangeSwitcherDate() {

        const daysOfTheWeek = this.provideDaysOfTheWeek();

        return '<div class="dr-input">' +
            '<div class="dr-dates">' +
            '<div class="dr-date" contenteditable placeholder="' + this.placeholder + '">' + moment(this.currentDate).format(this.formatInput) + '</div>' +
            '</div>' +
            '</div>' +

            '<div class="dr-selections">' +
            '<div class="dr-calendar" style="display: none;">' +
            '<div class="dr-range-switcher">' +
            '<div class="dr-switcher dr-month-switcher">' +
            '<i class="dr-left"></i>' +
            '<span></span>' +
            '<i class="dr-right"></i>' +
            '</div>' +
            '<div class="dr-switcher dr-year-switcher">' +
            '<i class="dr-left"></i>' +
            '<span></span>' +
            '<i class="dr-right"></i>' +
            '</div>' +
            '</div>' +
            daysOfTheWeek.outerHTML +
            '<ul class="dr-day-list"></ul>' +
            '</div>' +
            '</div>';
    }
}

export {CalendarSingle};
