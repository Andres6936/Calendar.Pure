'use strict';

class SelectorHTML {
    // Properties

    /**
     * @type {Element} Reference private to Html Element
     */
    #element = undefined

    // Construct

    /**
     * @param _element {Element} Reference to Html Element
     */
    constructor(_element) {
        console.assert(typeof _element === 'object');

        this.#element = _element
    }

    // Methods

    /**
     * Wrapper around of selector of elements with specify class name and
     * filter of elements with the tag name.
     *
     * This method is created with the intention of replace the function of
     * jQuery that filter for class name and return the collection of elements
     * with the tag specified.
     *
     * Equivalent jQuery: $('className' 'tagName')
     *
     * Requirement: The element select by class name should be exist and be
     * unique.
     *
     * @param className {string} Name of class that filter the elements.
     * @param tagName {string} Name of tag for filter the elements.
     * @return {HTMLCollection} Collection of elements.
     */
    filterClassGetByTag(className, tagName) {
        console.assert(typeof className === 'string');
        console.assert(typeof tagName === 'string');

        const selection = this.#element.getElementsByClassName(className)[0];
        return selection.getElementsByTagName(tagName);
    }

    /**
     * @param className {string} Name of class that filter the elements.
     * @throws Error If not elements found with the className specify.
     * @return {HTMLCollectionOf<Element>} Collection of elements.
     */
    filterClass(className) {
        console.assert(typeof className === 'string');

        const selection = this.#element.getElementsByClassName(className);
        if (selection.length === 0) {
            throw new Error(`Not elements found with the class: ${className}`);
        }
        return selection;
    }

    /**
     * @param className {string} Name of class that filter the elements.
     * @throws Error If the element with the class not exist.
     * @return {Element}
     */
    getFirstByClass(className) {
        // @type {HTMLCollectionOf<HTMLElement>}
        const result = this.#element.getElementsByClassName(className);
        if (result.length === 0) throw new Error('Empty Collection');
        return result[0];
    }
}

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
    this.type = this.element[0].classList.contains('daterange--single') ? 'single' : 'double';

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
        : (this.type === 'double' ? moment() : null);
    this.start_date = settings.start_date ? moment(settings.start_date)
        : (this.type === 'double' ? this.end_date.clone().subtract(1, 'month') : null);
    this.current_date = settings.current_date ? moment(settings.current_date)
        : (this.type === 'single' ? moment() : null);

    this.presets = !(settings.presets === false || this.type === 'single');

    this.callback = settings.callback || this.calendarSetDates;

    this.calendarHTML(this.type);

    // Wrapper to class, for reduce the dependency of jQuery
    const selector = new SelectorHTML(this.element[0]);

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

    /**
     * Enum for the types of toggle that application have.
     * @type {{MONTH: string, YEAR: string}}
     */
    const TypeToggle = {
        YEAR: 'year',
        MONTH: 'month',
    }

    // The Object.freeze() method freezes an object. A frozen object can no
    // longer be changed; freezing an object prevents new properties from being
    // added to it, existing properties from being removed, prevents changing
    // the enumerability, configurability, or writability of existing
    // properties, and prevents the values of existing properties from being
    // changed. In addition, freezing an object also prevents its prototype
    // from being changed. freeze() returns the same object that was passed in.
    Object.freeze(TypeToggle);

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


Calendar.prototype.presetCreate = function () {
    var self = this;
    var ul_presets = $('<ul class="dr-preset-list" style="display: none;"></ul>');
    var presets = typeof self.settings.presets === 'object' ? self.settings.presets :
        [{
            label: 'Last 30 days',
            start: moment(self.latest_date).subtract(29, 'days'),
            end: self.latest_date
        }, {
            label: 'Last month',
            start: moment(self.latest_date).subtract(1, 'month').startOf('month'),
            end: moment(self.latest_date).subtract(1, 'month').endOf('month')
        }, {
            label: 'Last 3 months',
            start: moment(self.latest_date).subtract(3, 'month').startOf('month'),
            end: moment(self.latest_date).subtract(1, 'month').endOf('month')
        }, {
            label: 'Last 6 months',
            start: moment(self.latest_date).subtract(6, 'month').startOf('month'),
            end: moment(self.latest_date).subtract(1, 'month').endOf('month')
        }, {
            label: 'Last year',
            start: moment(self.latest_date).subtract(1, 'year').startOf('year'),
            end: moment(self.latest_date).subtract(1, 'year').endOf('year')
        }, {
            label: 'All time',
            start: self.earliest_date,
            end: self.latest_date
        }];

    if (moment(self.latest_date).diff(moment(self.latest_date).startOf('month'), 'days') >= 6 &&
        typeof self.settings.presets !== 'object'
    ) {
        presets.splice(1, 0, {
            label: 'This month',
            start: moment(self.latest_date).startOf('month'),
            end: self.latest_date
        });
    }

    $.each(presets, function (i, d) {
        if (moment(d.start).isBefore(self.earliest_date)) {
            d.start = self.earliest_date;
        }
        if (moment(d.start).isAfter(self.latest_date)) {
            d.start = self.latest_date;
        }
        if (moment(d.end).isBefore(self.earliest_date)) {
            d.end = self.earliest_date;
        }
        if (moment(d.end).isAfter(self.latest_date)) {
            d.end = self.latest_date;
        }

        var startISO = moment(d.start).toISOString();
        var endISO = moment(d.end).toISOString();
        var string = moment(d.start).format(self.format.preset) + ' &ndash; ' + moment(d.end).format(self.format.preset);

        if ($('.dr-preset-list', self.element).length) {
            var item = $('.dr-preset-list .dr-list-item:nth-of-type(' + (i + 1) + ') .dr-item-aside', self.element);
            item.data('start', startISO);
            item.data('end', endISO);
            item.html(string);
        } else {
            ul_presets.append('<li class="dr-list-item">' + d.label +
                '<span class="dr-item-aside" data-start="' + startISO + '" data-end="' + endISO + '">' + string + '</span>' +
                '</li>');
        }
    });

    return ul_presets;
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
    if (this.type === 'double') {
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
    if (this.type === 'double') {

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


Calendar.prototype.calendarHTML = function (type) {
    // @type {HTMLUListElement} Created the element that contain the day of
    //  week {seven in total}.
    const daysOfTheWeek = document.createElement('ul');
    daysOfTheWeek.classList.add('dr-days-of-week-list');

    // @type {[string]} Contain the list of day in a week. {seven in total}.
    const days = this.days_array.splice(moment.localeData().firstDayOfWeek()).concat(this.days_array.splice(0, moment.localeData().firstDayOfWeek()));
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

    if (type === "double")
        return this.element.append('<div class="dr-input">' +
            '<div class="dr-dates">' +
            '<div class="dr-date dr-date-start" contenteditable>' + moment(this.start_date).format(this.format.input) + '</div>' +
            '<span class="dr-dates-dash">&ndash;</span>' +
            '<div class="dr-date dr-date-end" contenteditable>' + moment(this.end_date).format(this.format.input) + '</div>' +
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
            '</div>');

    return this.element.append('<div class="dr-input">' +
        '<div class="dr-dates">' +
        '<div class="dr-date" contenteditable placeholder="' + this.placeholder + '">' + (this.settings.current_date ? moment(this.current_date).format(this.format.input) : '') + '</div>' +
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
        '</div>');
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