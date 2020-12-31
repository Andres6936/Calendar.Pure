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
            (this.presets ? this.providePresetList()[0].outerHTML : '') +
            '</div>';
    }

    providePresetList() {
        const self = this;
        const ul_presets = $('<ul class="dr-preset-list" style="display: none;"></ul>');
        const presets = typeof this.settingsPresets === 'object' ? this.settingsPresets :
            [{
                label: 'Last 30 days',
                start: moment(this.latestDate).subtract(29, 'days'),
                end: this.latestDate
            }, {
                label: 'Last month',
                start: moment(this.latestDate).subtract(1, 'month').startOf('month'),
                end: moment(this.latestDate).subtract(1, 'month').endOf('month')
            }, {
                label: 'Last 3 months',
                start: moment(this.latestDate).subtract(3, 'month').startOf('month'),
                end: moment(this.latestDate).subtract(1, 'month').endOf('month')
            }, {
                label: 'Last 6 months',
                start: moment(this.latestDate).subtract(6, 'month').startOf('month'),
                end: moment(this.latestDate).subtract(1, 'month').endOf('month')
            }, {
                label: 'Last year',
                start: moment(this.latestDate).subtract(1, 'year').startOf('year'),
                end: moment(this.latestDate).subtract(1, 'year').endOf('year')
            }, {
                label: 'All time',
                start: this.earliestDate,
                end: this.latestDate
            }];

        if (moment(this.latestDate).diff(moment(this.latestDate).startOf('month'), 'days') >= 6 &&
            typeof this.settingsPresets !== 'object'
        ) {
            presets.splice(1, 0, {
                label: 'This month',
                start: moment(this.latestDate).startOf('month'),
                end: this.latestDate
            });
        }

        presets.forEach(function (item, index) {
            if (moment(item.start).isBefore(self.earliestDate)) {
                item.start = self.earliestDate;
            }
            if (moment(item.start).isAfter(self.latestDate)) {
                item.start = self.latestDate;
            }
            if (moment(item.end).isBefore(self.earliestDate)) {
                item.end = self.earliestDate;
            }
            if (moment(item.end).isAfter(self.latestDate)) {
                item.end = self.latestDate;
            }

            const startISO = moment(item.start).toISOString();
            const endISO = moment(item.end).toISOString();
            const string = moment(item.start).format(self.formatPreset) + ' &ndash; ' + moment(item.end).format(self.formatPreset);

            ul_presets.append('<li class="dr-list-item">' + item.label +
                '<span class="dr-item-aside" data-start="' + startISO + '" data-end="' + endISO + '">' + string + '</span>' +
                '</li>');
        });

        return ul_presets;
    }
}

export {CalendarDouble};
