"use strict";

import {AbstractCalendar} from "./AbstractCalendar.js";

class CalendarDouble extends AbstractCalendar {
    provideRangeSwitcherDate() {

        const daysOfTheWeek = this.provideDaysOfTheWeek();

        const divInput = document.createElement('div');
        divInput.classList.add('dr-input');

        // Begin RAII block
        {
            const divDates = document.createElement('div');
            divDates.classList.add('dr-dates');

            const divStartDate = document.createElement('div');
            divStartDate.innerText = moment(this.startDate).format(this.formatInput);
            // With the attribute spellcheck="false" turn off the spell checking.
            divStartDate.setAttribute('spellcheck', 'false');
            divStartDate.classList.add('dr-date-start');
            divStartDate.classList.add('dr-date');

            const divDashDate = document.createElement('span');
            divDashDate.classList.add('dr-dates-dash');
            divDashDate.innerText = '-';

            const divEndDate = document.createElement('div');
            divEndDate.innerText = moment(this.endDate).format(this.formatInput);
            // With the attribute spellcheck="false" turn off the spell checking.
            divEndDate.setAttribute('spellcheck', 'false');
            divEndDate.classList.add('dr-date-end');
            divEndDate.classList.add('dr-date');

            divDates.appendChild(divStartDate);
            divDates.appendChild(divDashDate);
            divDates.appendChild(divEndDate);

            divInput.appendChild(divDates);
        }

        if (this.presets) {
            const divPresets = document.createElement('div');
            divPresets.classList.add('dr-presets');

            for (let i = 0; i < 3; i += 1) {
                const spanDash = document.createElement('span');
                spanDash.classList.add('dr-preset-bar');
                divPresets.appendChild(spanDash);
            }

            divInput.appendChild(divPresets);
        }

        // Next Section

        const divSelections = document.createElement('div');
        divSelections.classList.add('dr-selections');

        // Begin RAII block
        {
            const divCalendar = document.createElement('div');
            divCalendar.classList.add('dr-calendar');
            divCalendar.style.display = 'none';

            const divRangeSwitcher = document.createElement('div');
            divRangeSwitcher.classList.add('dr-range-switcher');

            const divMonthSwitcher = document.createElement('div');
            divMonthSwitcher.classList.add('dr-month-switcher');
            divMonthSwitcher.classList.add('dr-switcher');

            const elementLeft = document.createElement('i');
            elementLeft.classList.add('dr-left');

            const spanTextApril = document.createElement('span');
            spanTextApril.innerText = 'April';

            const elementRight = document.createElement('i');
            elementRight.classList.add('dr-right');

            const divYearSwitcher = document.createElement('div');
            divYearSwitcher.classList.add('dr-year-switcher');
            divYearSwitcher.classList.add('dr-switcher');

            const spanText2015 = document.createElement('span');
            spanText2015.innerText = '2015';

            const ulDayList = document.createElement('ul');
            ulDayList.classList.add('dr-day-list');

            divMonthSwitcher.appendChild(elementLeft);
            divMonthSwitcher.appendChild(spanTextApril);
            divMonthSwitcher.appendChild(elementRight);

            divYearSwitcher.appendChild(elementLeft);
            divYearSwitcher.appendChild(spanText2015);
            divYearSwitcher.appendChild(elementRight);

            divRangeSwitcher.appendChild(divMonthSwitcher);
            divRangeSwitcher.appendChild(divYearSwitcher);

            divCalendar.appendChild(divRangeSwitcher);
            divCalendar.appendChild(daysOfTheWeek);
            divCalendar.appendChild(ulDayList);

            divSelections.appendChild(divCalendar);

            if (this.presets) {
                divSelections.appendChild(this.providePresetList());
            }
        }

        return divInput.outerHTML + divSelections.outerHTML;
    }

    /**
     * Create and return a list html with the presets.
     *
     * @return {HTMLUListElement} Element type UL, that have store (wrapper)
     * elements that represent each of presets.
     */
    providePresetList() {
        // @type {HTMLUListElement} Element that store (wrapper) the preset
        const wrapperList = document.createElement('ul');
        wrapperList.classList.add('dr-preset-list');
        // Make the text unselectable.
        wrapperList.style.userSelect = 'none';
        wrapperList.style.display = 'none';

        // @type {[({start: any, end: any, label: string})]} The list of presets,
        //  each preset store: a label, a start date and end date.
        const presets = this.settingsPresets !== undefined ? this.settingsPresets :
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

        for (const item of presets) {
            if (moment(item.start).isBefore(this.earliestDate)) {
                item.start = this.earliestDate;
            }
            if (moment(item.start).isAfter(this.latestDate)) {
                item.start = this.latestDate;
            }
            if (moment(item.end).isBefore(this.earliestDate)) {
                item.end = this.earliestDate;
            }
            if (moment(item.end).isAfter(this.latestDate)) {
                item.end = this.latestDate;
            }

            // @type {string} The start date
            const startISO = moment(item.start).toISOString();
            // @type {string} The end date
            const endISO = moment(item.end).toISOString();
            // @type {string} The label with the format: 'start date - end date'
            const string = moment(item.start).format(this.formatPreset) + ' - ' + moment(item.end).format(this.formatPreset);

            // @type {HTMLLIElement} Represent the element
            const listElement = document.createElement('li');
            listElement.classList.add('dr-list-item');
            listElement.innerText = item.label;

            // @type {HTMLSpanElement} Repesent the label with the format
            const spanElement = document.createElement('span');
            spanElement.classList.add('dr-item-aside');
            spanElement.innerText = string;
            spanElement.dataset.start = startISO;
            spanElement.dataset.end = endISO;

            listElement.appendChild(spanElement);
            wrapperList.appendChild(listElement);
        }

        return wrapperList;
    }
}

export {CalendarDouble};
