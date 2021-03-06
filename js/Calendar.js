'use strict';

import {SelectorHTML} from "./SelectorHTML.js";
import {CalendarSingle} from "./CalendarSingle.js";
import {CalendarDouble} from "./CalendarDouble.js";
import {TypeCalendar, TypeToggle} from "./Enums.js";

function Calendar(settings) {
    const self = this;

    /**
     * @type {Object}
     */
    this.settings = settings;

    /**
     * @type {boolean}
     */
    this.calIsOpen = false;

    /**
     * @type {boolean}
     */
    this.presetIsOpen = false;

    /**
     * @type {*|boolean}
     */
    this.sameDayRange = settings.same_day_range || false;

    /**
     * Element of type divisor.
     * @type {HTMLCollection}
     */
    this.element = settings.element || $('.daterange');

    /**
     * @type {HTMLElement|null}
     */
    this.selected = null;

    /**
     * @type {string} Indicate if the type of calendar is 'simple' or 'double'.
     */
    this.type = determineTypeCalendar(this.element[0].classList);

    /**
     * Determine if the calendar is single o double.
     * @param classList {DOMTokenList} List of the class.
     * @return {string} type of calendar.
     */
    function determineTypeCalendar(classList) {
        if (classList.contains('daterange--single')) {
            return TypeCalendar.SINGLE;
        } else if (classList.contains('daterange--double')) {
            return TypeCalendar.DOUBLE;
        } else {
            console.error('The Calendar not have a type {SINGLE or DOUBLE} associated.')
        }
    }

    /**
     * @type {boolean}
     */
    this.required = settings.required !== false;

    this.format = settings.format || {};
    this.format.input = settings.format && settings.format.input || 'MMMM D, YYYY';
    this.format.preset = settings.format && settings.format.preset || 'll';
    this.format.jump_month = settings.format && settings.format.jump_month || 'MMMM';
    this.format.jump_year = settings.format && settings.format.jump_year || 'YYYY';

    this.placeholder = settings.placeholder || this.format.input;

    this.days_array = settings.days_array && settings.days_array.length === 7 ?
        settings.days_array : moment.weekdaysMin();

    this.orig_start_date = null;
    this.orig_end_date = null;
    this.orig_current_date = null;

    this.earliest_date = settings.earliest_date ? moment(settings.earliest_date)
        : moment('1900-01-01', 'YYYY-MM-DD');
    this.latest_date = settings.latest_date ? moment(settings.latest_date)
        : moment('2900-12-31', 'YYYY-MM-DD');
    this.end_date = settings.end_date ? moment(settings.end_date)
        : (this.type === TypeCalendar.DOUBLE ? moment() : null);
    this.start_date = settings.start_date ? moment(settings.start_date)
        : (this.type === TypeCalendar.DOUBLE ? this.end_date.clone().subtract(1, 'month') : null);
    this.current_date = settings.current_date ? moment(settings.current_date)
        : (this.type === TypeCalendar.SINGLE ? moment() : null);

    this.presets = !(settings.presets === false || this.type === TypeCalendar.SINGLE);

    this.callback = settings.callback || this.calendarSetDates;

    // Wrapper to class, for reduce the dependency of jQuery
    const selector = new SelectorHTML(this.element[0]);

    this.calendarHTML(this.type, selector);

    try {
        selector.getFirstByClass('dr-presets').onclick = function () {
            self.presetToggle();
        }
    } catch (ignored) {

    }

    try {
        for (const element of selector.filterClass('dr-list-item')) {
            element.onclick = function () {
                // Only exist a item-aside for each list-item
                // @type {HTMLElement}
                const itemAside = element.getElementsByClassName('dr-item-aside').item(0);

                // @type {DOMStringMap}
                const start = itemAside.dataset.start;
                // @type {DOMStringMap}
                const end = itemAside.dataset.end;

                self.start_date = self.calendarCheckDate(start);
                self.end_date = self.calendarCheckDate(end);

                self.calendarSetDates();
                self.presetToggle();
                self.calendarSaveDates();

                // Reference for this code:
                //  https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes
                //  https://developer.mozilla.org/en-US/docs/Web/API/HTMLOrForeignElement/dataset
            }
        }
    } catch (ignored) {

    }

    try {
        for (const element of selector.filterClass('dr-date')) {
            element.onclick = function () {
                self.calendarOpen(this);
            }

            /**
             * @param event KeyboardEvent: objects describe a user interaction with
             *  the keyboard; each event describes a single interaction between
             *  the user and a key (or combination of a key with modifier keys) on
             *  the keyboard.
             */
            element.addEventListener('keyup', function (event) {
                console.log('Keyup Event');
                if (event.code === 9 && !self.calIsOpen && !self.start_date && !self.end_date)
                    self.calendarOpen(this);
            })

            /**
             *
             * @param event KeyboardEvent: objects describe a user interaction with
             *  the keyboard; each event describes a single interaction between
             *  the user and a key (or combination of a key with modifier keys) on
             *  the keyboard.
             */
            element.addEventListener('keydown', function (event) {
                if (event.code === 'Tab') {
                    if (self.selected?.classList.contains('dr-date-start')) {
                        event.preventDefault();
                        self.calendarCheckDates();
                        self.calendarSetDates();

                        try {
                            for (const element of selector.filterClass('dr-date-end')) {
                                element.click();
                            }
                        } catch (ignored) {

                        }
                    } else {
                        self.calendarCheckDates();
                        self.calendarSetDates();
                        self.calendarSaveDates();
                        self.calendarClose('force');
                    }
                } else if (event.code === 'Enter') {
                    event.preventDefault();
                    self.calendarCheckDates();
                    self.calendarSetDates();
                    self.calendarSaveDates();
                    self.calendarClose('force');
                } else if (event.code === 'Escape') {
                    self.calendarSetDates();
                    self.calendarClose('force');
                } else if (event.code === 'ArrowUp') {
                    event.preventDefault();
                    var timeframe = 'day';

                    if (event.shiftKey)
                        timeframe = 'week';

                    if (event.metaKey)
                        timeframe = 'month';

                    var back = moment(self.current_date).subtract(1, timeframe);

                    $(this).html(back.format(self.format.input));
                    self.current_date = back;
                } else if (event.code === 'ArrowDown') {
                    event.preventDefault();
                    var timeframe = 'day';

                    if (event.shiftKey)
                        timeframe = 'week';

                    if (event.metaKey)
                        timeframe = 'month';

                    var forward = moment(self.current_date).add(1, timeframe);

                    $(this).html(forward.format(self.format.input));
                    self.current_date = forward;
                }
            })
        }
    } catch (ignored) {

    }

    /**
     * Set the event listener for the toggle, this allow change the month or
     * year selected in the calendar.
     *
     * @param switcher {Element} Each instance of calendar should be set a
     *  event listener for the toggle.
     *
     * @param typeToggle {string} Type toggle include Month or Year.
     */
    function setEventToggle(switcher, typeToggle) {
        // The span inside of element is that contain the data properties.
        // The properties that should be save the span element are:
        //  - current month selected.
        //  - current year selected.
        const span = switcher.getElementsByTagName('span').item(0);

        // Construct, set the properties month and year in the span tag.
        // Avoid get undefined when the attribute be read.
        span.dataset.month = moment().month();
        span.dataset.year = moment().year();

        const toggles = switcher.getElementsByTagName('i');
        for (const toggle of toggles) {
            toggle.onclick = function () {
                const m = span.dataset.month;
                const y = span.dataset.year;

                const thisMoment = moment([y, m, 1]);

                if (toggle.classList.contains('dr-left')) {
                    const backDate = thisMoment.clone().subtract(1, typeToggle);
                    self.calendarOpen(self.selected, backDate);

                    // Update the current month and year for the toggle.
                    span.dataset.month = backDate.month();
                    span.dataset.year = backDate.year();
                } else if (toggle.classList.contains('dr-right')) {
                    const forwardDate = thisMoment.clone().add(1, typeToggle).startOf('day');
                    self.calendarOpen(self.selected, forwardDate);

                    // Update the current month and year for the toggle.
                    span.dataset.month = forwardDate.month();
                    span.dataset.year = forwardDate.year();
                }
            }
        }
    }

    for (const element of selector.filterClass('dr-range-switcher')) {
        const monthSwitcher = element.getElementsByClassName('dr-month-switcher').item(0);
        setEventToggle(monthSwitcher, TypeToggle.MONTH);

        const yearSwitcher = element.getElementsByClassName('dr-year-switcher').item(0);
        setEventToggle(yearSwitcher, TypeToggle.YEAR);
    }

    $('.dr-dates-dash', this.element).click(function () {
        $('.dr-date-start', self.element).trigger('click');
    });

    // Once you click into a selection.. this lets you click out
    const clickHandler = function (event) {
        const contains = $(event.target).parent().closest(self.element);

        if (!contains.length) {
            document.removeEventListener('click', clickHandler, false);

            if (self.presetIsOpen)
                self.presetToggle();

            if (self.calIsOpen) {
                if ($(self.selected).hasClass('dr-date-end'))
                    self.calendarSaveDates();

                self.calendarSetDates();
                self.calendarClose('force');
            }
        }
    };

    this.element.on('click', function () {
        document.addEventListener('click', clickHandler, false);
    });
}


Calendar.prototype.presetToggle = function () {
    if (this.presetIsOpen === false) {
        this.orig_start_date = this.start_date;
        this.orig_end_date = this.end_date;
        this.orig_current_date = this.current_date;

        this.presetIsOpen = true;
    } else if (this.presetIsOpen) {
        this.presetIsOpen = false;
    }

    if (this.calIsOpen === true)
        this.calendarClose();

    $('.dr-preset-list', this.element).slideToggle(200);
    $('.dr-input', this.element).toggleClass('dr-active');
    $('.dr-presets', this.element).toggleClass('dr-active');
    this.element.toggleClass('dr-active');
}

Calendar.prototype.calendarSetDates = function () {
    $('.dr-date-start', this.element).html(moment(this.start_date).format(this.format.input));
    $('.dr-date-end', this.element).html(moment(this.end_date).format(this.format.input));

    if (!this.start_date && !this.end_date) {
        var old_date = $('.dr-date', this.element).html();
        var new_date = moment(this.current_date).format(this.format.input);

        if (old_date.length === 0 && !this.required)
            new_date = '';

        if (old_date !== new_date)
            $('.dr-date', this.element).html(new_date);
    }
}


Calendar.prototype.calendarSaveDates = function () {
    if (this.type === TypeCalendar.DOUBLE) {
        if (!moment(this.orig_end_date).isSame(this.end_date) || !moment(this.orig_start_date).isSame(this.start_date))
            return this.callback();
    } else {
        if (!this.required || !moment(this.orig_current_date).isSame(this.current_date))
            return this.callback();
    }
}

Calendar.prototype.calendarCheckDate = function (d) {
    // Today
    if (d === 'today' || d === 'now')
        return moment().isAfter(this.latest_date) ? this.latest_date :
            moment().isBefore(this.earliest_date) ? this.earliest_date : moment();

    // Earliest
    if (d === 'earliest')
        return this.earliest_date;

    // Latest
    if (d === 'latest')
        return this.latest_date;

    // Convert string to a date if keyword ago or ahead exists
    if (d && (/\bago\b/.test(d) || /\bahead\b/.test(d)))
        return this.stringToDate(d);

    var regex = /(?:\d)((?:st|nd|rd|th)?,?)/;
    var d_array = d ? d.replace(regex, '').split(' ') : [];

    // Add current year if year is not included
    if (d_array.length === 2) {
        d_array.push(moment().format(this.format.jump_year));
        d = d_array.join(' ');
    }

    // Convert using settings format
    var parsed_d = this.parseDate(d);

    if (!parsed_d.isValid())
        return moment(d); // occurs when parsing preset dates

    return parsed_d;
}

Calendar.prototype.calendarCheckDates = function () {
    var startTxt = $('.dr-date-start', this.element).html();
    var endTxt = $('.dr-date-end', this.element).html();
    var c = this.calendarCheckDate($(this.selected).html());
    var s;
    var e;

    // Modify strings via some specific keywords to create valid dates
    // Finally set all strings as dates
    if (startTxt === 'ytd' || endTxt === 'ytd') { // Year to date
        s = moment().startOf('year');
        e = moment().endOf('year');
    } else {
        s = this.calendarCheckDate(startTxt);
        e = this.calendarCheckDate(endTxt);
    }

    if (c.isBefore(this.earliest_date))
        c = this.earliest_date;
    if (s.isBefore(this.earliest_date))
        s = this.earliest_date;
    if (e.isBefore(this.earliest_date) || e.isBefore(s))
        e = s.clone().add(6, 'day');

    if (c.isAfter(this.latest_date))
        c = this.latest_date;
    if (e.isAfter(this.latest_date))
        e = this.latest_date;
    if (s.isAfter(this.latest_date) || s.isAfter(e))
        s = e.clone().subtract(6, 'day');

    // Push and save if it's valid otherwise return to previous state
    if (this.type === TypeCalendar.DOUBLE) {

        // Is this a valid date?
        if (s.isSame(e) && !this.sameDayRange)
            return this.calendarSetDates();

        this.start_date = s.isValid() ? s : this.start_date;
        this.end_date = e.isValid() ? e : this.end_date;
    }

    this.current_date = c.isValid() ? c : this.current_date;
}


Calendar.prototype.stringToDate = function (str) {
    var date_arr = str.split(' ');

    if (date_arr[2] === 'ago') {
        return moment(this.current_date).subtract(date_arr[0], date_arr[1]);
    } else if (date_arr[2] === 'ahead') {
        return moment(this.current_date).add(date_arr[0], date_arr[1]);
    }

    return this.current_date;
}


Calendar.prototype.calendarOpen = function (selected, switcher) {
    const self = this;
    let other;
    const cal_width = $('.dr-dates', this.element).innerWidth() - 8;

    this.selected = selected || this.selected;

    if (this.presetIsOpen === true)
        this.presetToggle();

    if (this.calIsOpen === true) {
        this.calendarClose(switcher ? 'switcher' : undefined);
    } else if ($(this.selected).html().length) {
        this.orig_start_date = this.start_date;
        this.orig_end_date = this.end_date;
        this.orig_current_date = this.current_date;
    }

    this.calendarCheckDates();
    this.calendarCreate(switcher);
    this.calendarSetDates();

    const next_month = moment(switcher || this.current_date).add(1, 'month').startOf('month').startOf('day');
    const past_month = moment(switcher || this.current_date).subtract(1, 'month').endOf('month');
    const next_year = moment(switcher || this.current_date).add(1, 'year').startOf('month').startOf('day');
    const past_year = moment(switcher || this.current_date).subtract(1, 'year').endOf('month');
    const this_moment = moment(switcher || this.current_date);

    $('.dr-month-switcher span', this.element)
        .data('month', this_moment.month())
        .html(this_moment.format(this.format.jump_month));
    $('.dr-year-switcher span', this.element)
        .data('year', this_moment.year())
        .html(this_moment.format(this.format.jump_year));

    $('.dr-switcher i', this.element).removeClass('dr-disabled');

    if (next_month.isAfter(this.latest_date))
        $('.dr-month-switcher .dr-right', this.element).addClass('dr-disabled');

    if (past_month.isBefore(this.earliest_date))
        $('.dr-month-switcher .dr-left', this.element).addClass('dr-disabled');

    if (next_year.isAfter(this.latest_date))
        $('.dr-year-switcher .dr-right', this.element).addClass('dr-disabled');

    if (past_year.isBefore(this.earliest_date))
        $('.dr-year-switcher .dr-left', this.element).addClass('dr-disabled');

    $('.dr-day', this.element).on({
        mouseenter: function () {
            let selected = $(this);

            if ($(self.selected).hasClass("dr-date-start")) {
                selected.addClass('dr-hover dr-hover-before');
                $('.dr-start', self.element).css({'border': 'none', 'padding-left': '0.3125rem'});
                setMaybeRange('start');
            }

            if ($(self.selected).hasClass("dr-date-end")) {
                selected.addClass('dr-hover dr-hover-after');
                $('.dr-end', self.element).css({'border': 'none', 'padding-right': '0.3125rem'});
                setMaybeRange('end');
            }

            if (!self.start_date && !self.end_date)
                selected.addClass('dr-maybe');

            $('.dr-selected', self.element).css('background-color', 'transparent');

            function setMaybeRange(type) {
                other = undefined;

                // @type {number}
                const DAY_PER_WEEK = 7;
                // @type {number}
                const AMOUNT_ROW_PER_CALENDAR = 6;

                self.range(DAY_PER_WEEK * AMOUNT_ROW_PER_CALENDAR).forEach(function (i) {
                    let next = selected.next().data('date');
                    let prev = selected.prev().data('date');
                    const curr = selected.data('date');

                    if (!curr)
                        return false;

                    if (!prev)
                        prev = curr;

                    if (!next)
                        next = curr;

                    if (type === 'start') {
                        if (moment(next).isSame(self.end_date) || (self.sameDayRange && moment(curr).isSame(self.end_date)))
                            return false;

                        if (moment(curr).isAfter(self.end_date)) {
                            other = other || moment(curr).add(6, 'day').startOf('day');

                            if (i > 5 || (next ? moment(next).isAfter(self.latest_date) : false)) {
                                $(selected).addClass('dr-end');
                                other = moment(curr);
                                return false;
                            }
                        }

                        selected = selected.next().addClass('dr-maybe');
                    } else if (type === 'end') {
                        if (moment(prev).isSame(self.start_date) || (self.sameDayRange && moment(curr).isSame(self.start_date)))
                            return false;

                        if (moment(curr).isBefore(self.start_date)) {
                            other = other || moment(curr).subtract(6, 'day');

                            if (i > 5 || (prev ? moment(prev).isBefore(self.earliest_date) : false)) {
                                $(selected).addClass('dr-start');
                                other = moment(curr);
                                return false;
                            }
                        }

                        selected = selected.prev().addClass('dr-maybe');
                    }
                });
            }
        },
        mouseleave: function () {
            if ($(this).hasClass('dr-hover-before dr-end'))
                $(this).removeClass('dr-end');

            if ($(this).hasClass('dr-hover-after dr-start'))
                $(this).removeClass('dr-start');

            $(this).removeClass('dr-hover dr-hover-before dr-hover-after');
            $('.dr-start, .dr-end', self.element).css({'border': '', 'padding': ''});
            $('.dr-maybe:not(.dr-current)', self.element).removeClass('dr-start dr-end');
            $('.dr-day', self.element).removeClass('dr-maybe');
            $('.dr-selected', self.element).css('background-color', '');
        }
    });

    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        $('.dr-day', this.element).on({
            touchstart: function () {
                self.selectOneDate(other, self, $(this).data('date'));
            }
        });

        $('div[contenteditable]', this.element).removeAttr('contenteditable');
    } else {
        $('.dr-day', this.element).on({
            mousedown: function () {
                self.selectOneDate(other, self, $(this).data('date'));
            }
        });
    }

    $('.dr-calendar', this.element)
        .css('width', cal_width)
        .slideDown(200);
    $('.dr-input', this.element).addClass('dr-active');
    $(selected).addClass('dr-active').focus();
    this.element.addClass('dr-active');

    this.calIsOpen = true;
}


Calendar.prototype.calendarClose = function (type) {
    var self = this;

    if (!this.calIsOpen || this.presetIsOpen || type === 'force') {
        $('.dr-calendar', this.element).slideUp(200, function () {
            $('.dr-day', self.element).remove();
        });
    } else {
        $('.dr-day', this.element).remove();
    }

    if (type === 'switcher') {
        return false;
    }

    $('.dr-input, .dr-date', this.element).removeClass('dr-active');
    this.element.removeClass('dr-active');

    this.calIsOpen = false;
}


Calendar.prototype.calendarCreate = function (switcher) {
    var self = this;
    var array = this.calendarArray(this.start_date, this.end_date, this.current_date, switcher);

    array.forEach(function (d, i) {
        var classString = "dr-day";

        if (d.fade)
            classString += " dr-fade";

        if (d.start)
            classString += " dr-start";

        if (d.end)
            classString += " dr-end";

        if (d.current)
            classString += " dr-current";

        if (d.selected)
            classString += " dr-selected";

        if (d.outside)
            classString += " dr-outside";

        $('.dr-day-list', self.element).append('<li class="' + classString + '" data-date="' + d.date + '">' + d.str + '</li>');
    });
}


Calendar.prototype.calendarArray = function (start, end, current, switcher) {
    var self = this;
    current = moment(current || start || end).startOf('day');

    var reference = switcher || current || start || end;

    var startRange = moment(reference).startOf('month').startOf('week');
    var endRange = moment(startRange).add(6 * 7 - 1, 'days').endOf('day');

    var daysInRange = [];
    var d = moment(startRange);
    while (d.isBefore(endRange)) {
        daysInRange.push({
            str: +d.format('D'),
            start: start && d.isSame(start, 'day'),
            end: end && d.isSame(end, 'day'),
            current: current && d.isSame(current, 'day'),
            selected: start && end && d.isBetween(start, end),
            date: d.toISOString(),
            outside: d.isBefore(self.earliest_date) || d.isAfter(self.latest_date),
            fade: !d.isSame(reference, 'month')
        });
        d.add(1, 'd');
    }

    return daysInRange;
}

/**
 * @param type {string|TypeCalendar} If the calendar is of type SINGLE or DOUBLE.
 * @param selector {SelectorHTML} The HTML wrapper that content all the code of Calendar.
 */
Calendar.prototype.calendarHTML = function (type, selector) {
    let calendar = undefined;

    if (type === TypeCalendar.SINGLE) {
        calendar = new CalendarSingle();
    } else if (type === TypeCalendar.DOUBLE) {
        calendar = new CalendarDouble();
    } else {
        throw new Error("Not is possible determine the type (SINGLE or DOUBLE) of Calendar.");
    }

    calendar.presets = this.presets;
    calendar.endDate = this.end_date;
    calendar.selector = selector;
    calendar.startDate = this.start_date;
    calendar.daysArray = this.days_array;
    calendar.formatInput = this.format.input;
    calendar.latestDate = this.latest_date;
    calendar.placeholder = this.placeholder;
    calendar.currentDate = this.current_date;
    calendar.earliestDate = this.earliest_date;
    calendar.formatPreset = this.format.preset;
    calendar.settingsPresets = this.settings.presets;

    return this.element.append(calendar.provideRangeSwitcherDate());
}


Calendar.prototype.parseDate = function (d) {
    if (moment.defaultZone !== null && moment.hasOwnProperty('tz')) {
        return moment.tz(d, this.format.input, moment.defaultZone.name);
    } else {
        return moment(d, this.format.input);
    }
}

/**
 * Generate a Array with length passed for parameters and initialize each index
 *  from 0 to length.
 *
 * @param length Size of array to generate.
 * @return {[Number]} Each index go to from 0 to length.
 */
Calendar.prototype.range = function (length) {
    const range = new Array(length);

    for (let index = 0; index < length; index++) {
        range[index] = index;
    }

    return range;
}


Calendar.prototype.selectOneDate = function (other, cal, date) {
    var string = moment(date).format(cal.format.input);

    if (other) {
        $('.dr-date', cal.element)
            .not(cal.selected)
            .html(other.format(cal.format.input));
    }

    $(cal.selected).html(string);
    cal.calendarOpen(cal.selected);

    if ($(cal.selected).hasClass('dr-date-start')) {
        $('.dr-date-end', cal.element).trigger('click');
    } else {
        cal.calendarSaveDates();
        cal.calendarClose('force');
    }
}

export {Calendar};
