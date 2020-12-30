"use strict";

/**
 * Enum for determine the type of calendar.
 *
 * If the calendar is single, only a date is processed, if
 * the calendar is double, a start date and end date are
 * processed.
 *
 * @type {{SINGLE: string, DOUBLE: string}}
 */
const TypeCalendar = {
    SINGLE: 'single',
    DOUBLE: 'double',
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
Object.freeze(TypeCalendar);
Object.freeze(TypeToggle);

// Export the enum
export {TypeCalendar, TypeToggle};
