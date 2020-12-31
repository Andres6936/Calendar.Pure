"use strict";


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
     * @return {Element} Return the first element that coincide with
     * the class name.
     */
    getFirstByClass(className) {
        // @type {HTMLCollectionOf<HTMLElement>}
        const result = this.#element.getElementsByClassName(className);
        if (result.length === 0) throw new Error('Empty Collection');
        return result[0];
    }

    /**
     * @param query Filter that select the elements.
     * @return {NodeListOf<*>} All element descendants of node that match selectors.
     */
    querySelectorAll(query) {
        return this.#element.querySelectorAll(query);
    }
}

export {SelectorHTML};
