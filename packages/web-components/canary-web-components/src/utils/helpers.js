/**
 * To investigate:
 * IcColorRGBA works via @ukic/web-components but IcBrandForegroundEnum does not even though they are exported
 * from @ukic/web-components in the same file. Why?
 */
import { forceUpdate } from "@stencil/core";
import { IC_ACCORDION, IC_ACCORDION_GROUP, IC_CHECKBOX, IC_SEARCH_BAR, IC_TEXT_FIELD, IC_BLOCK_COLOR_COMPONENTS, IC_BLOCK_COLOR_EXCEPTIONS, IC_FIXED_COLOR_COMPONENTS, IC_TAB_CONTEXT, } from "./constants"; // Using @ukic/web-components/dist/types/utils/constants does not work so duplicated constants into canary package
import { IcBrandForegroundEnum } from "./types"; // Using @ukic/web-components/dist/types/utils/types does not work so duplicated constants into canary package
const DARK_MODE_THRESHOLD = 133.3505;
const ANYWHERE_SEARCH_POSITION = "anywhere";
const icInput = "ic-input";
/**
 * converts an enum of strings into an array of strings
 */
export const stringEnumToArray = (theEnum) => {
    const arr = [];
    Object.values(theEnum).forEach((val) => {
        if (isNaN(Number(val))) {
            const str = val;
            arr.push(str);
        }
    });
    return arr;
};
/**
 * Used to inherit global attributes set on the host. Called in componentWillLoad and assigned
 * to a variable that is later used in the render function.
 *
 * This does not need to be reactive as changing attributes on the host element
 * does not trigger a re-render.
 */
export const inheritAttributes = (element, attributes = []) => {
    const attributeObject = {};
    attributes.forEach((attr) => {
        const value = element.getAttribute(attr);
        if (value !== null) {
            attributeObject[attr] = value;
            element.removeAttribute(attr);
        }
    });
    return attributeObject;
};
export const debounceEvent = (event, wait) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const original = event._original || event;
    return {
        _original: event,
        emit: debounce(original.emit.bind(original), wait),
    };
};
export const debounce = (func, wait = 0) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(func, wait, ...args);
    };
};
export const dynamicDebounce = (func, getDelay) => {
    let timer;
    return (...args) => {
        const delay = getDelay();
        clearTimeout(timer);
        timer = setTimeout(func, delay, ...args);
    };
};
/**
 * This method is used to add a hidden input to a host element that contains
 * a Shadow DOM. It does not add the input inside of the Shadow root which
 * allows it to be picked up inside of forms. It should contain the same
 * values as the host element.
 *
 * @param always Add a hidden input even if the container does not use Shadow
 * @param container The element where the input will be added
 * @param name The name of the input
 * @param value The value of the input
 * @param disabled If true, the input is disabled
 */
export const renderHiddenInput = (always, container, name, value, disabled) => {
    if (name !== undefined && (always || hasShadowDom(container))) {
        let input = getHiddenInputElement(container);
        if (input === null || input === undefined) {
            input = container.ownerDocument.createElement("input");
            input.type = "hidden";
            input.classList.add(icInput);
            container.appendChild(input);
        }
        input.disabled = !!disabled;
        input.name = name;
        if (value instanceof Date) {
            input.value = value ? value.toISOString() : "";
        }
        else {
            input.value = value || "";
        }
    }
};
const getHiddenInputElement = (container) => Array.from(container.querySelectorAll(`input.${icInput}`)).filter((el) => container === el.parentElement)[0];
/**
 * This method is used to add a hidden file input to a host element that contains
 * a Shadow DOM. It does not add the input inside of the Shadow root which
 * allows it to be picked up inside of forms. It should contain the same
 * values as the host element.
 *
 * @param event: The event that is emitted once a file is selected.
 * @param container The element where the input will be added
 * @param multiple If true, multiple files can be selected
 * @param disabled If true, the input is disabled
 * @param accept A string of the accepted files
 * @param name The name of the input
 * @param value The value of the input
 */
export const renderFileHiddenInput = (event, container, multiple, disabled, accept, name, value) => {
    if (name !== undefined && hasShadowDom(container)) {
        let input = getHiddenInputElement(container);
        if (input === null || input === undefined) {
            input = container.ownerDocument.createElement("input");
            input.classList.add(icInput);
            container.appendChild(input);
        }
        input.type = "file";
        input.hidden = true;
        input.multiple = multiple;
        input.name = name;
        input.disabled = disabled;
        if (value)
            input.files = value;
        if (accept)
            input.accept = accept;
        input.onchange = () => {
            event.emit(input.files);
        };
        input.click();
    }
};
export const removeHiddenInput = (container) => {
    var _a;
    (_a = getHiddenInputElement(container)) === null || _a === void 0 ? void 0 : _a.remove();
};
export const hasShadowDom = (el) => !!el && !!el.shadowRoot && !!el.attachShadow;
export const getInputHelperTextID = (id) => id + "-helper-text";
export const getInputValidationTextID = (id) => id + "-validation-text";
export const getInputDescribedByText = (el, inputId, helperText, validationText) => `${isSlotUsed(el, "helper-text") || helperText
    ? getInputHelperTextID(inputId)
    : ""} ${validationText ? getInputValidationTextID(inputId) : ""}`.trim();
/**
 * This method helps to understand the context in which a component exists,
 * to assist with choosing appropriate foreground colours to use. For example,
 * this method will help you use the 'white' version of a button if it's within
 * a block colour element using white foreground text.
 *
 * This only works for components/elements passed via <slot> and not if they
 * are part of an IC component.
 *
 * ""
 * @returns IcBrandForeground depending on the context
 */
export const getBrandFromContext = (el, brandFromEvent = null) => {
    var _a;
    const parentElement = el.parentElement || el.getRootNode().host.parentElement;
    const blockColorParent = parentElement === null || parentElement === void 0 ? void 0 : parentElement.closest(IC_BLOCK_COLOR_COMPONENTS.join(","));
    // If within a block color component
    if (blockColorParent) {
        const parentTag = blockColorParent.tagName.toLowerCase();
        const currentTag = el.tagName.toLowerCase();
        if ((_a = IC_BLOCK_COLOR_EXCEPTIONS[parentTag]) === null || _a === void 0 ? void 0 : _a.includes(currentTag)) {
            return IcBrandForegroundEnum.Default;
        }
        else if (brandFromEvent !== null &&
            !IC_FIXED_COLOR_COMPONENTS.includes(parentTag)) {
            return brandFromEvent;
        }
        else if (blockColorParent.classList.contains(`${parentTag}-${IcBrandForegroundEnum.Dark}`) ||
            blockColorParent.classList.contains(IcBrandForegroundEnum.Dark)) {
            return IcBrandForegroundEnum.Dark;
        }
        return IcBrandForegroundEnum.Light;
    }
    return IcBrandForegroundEnum.Default;
};
/**
 * Checks if the current device is a mobile or tablet device.
 * @returns {boolean} Returns true if the device is a mobile or tablet device, otherwise returns false.
 */
export const isMobileOrTablet = () => "maxTouchPoints" in navigator && "userAgent" in navigator
    ? navigator.maxTouchPoints > 0 &&
        /iPad|iPhone|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    : false;
/**
 * Will create a button within the lightDOM which interacts with the parent form.
 * This is required as buttons within the shadowDOM will not invoke a submit or reset
 *
 * @param form - parent form element which contains shadowDom button
 * @param button - shadowDOM button
 */
export const handleHiddenFormButtonClick = (form, button) => {
    const hiddenFormButton = document.createElement("button");
    button.type && hiddenFormButton.setAttribute("type", button.type);
    hiddenFormButton.style.display = "none";
    form.appendChild(hiddenFormButton);
    hiddenFormButton.click();
    hiddenFormButton.remove();
};
export const isEmptyString = (value) => value ? value.trim().length === 0 : true;
// A helper function that checks if a prop has been defined
export const isPropDefined = (prop) => prop !== undefined ? prop : null;
/**
 * Extracts the label using the value from an object. Requires the object to have a label and value property.
 * @param value - value from object
 * @param options - list of menu items
 * @returns - label corresponding to value
 */
export const getLabelFromValue = (value, options, valueField = "value", labelField = "label") => {
    const ungroupedOptions = [];
    if (options.length > 0 && options.map) {
        options.map((option) => {
            if (option.children) {
                option.children.map((option) => ungroupedOptions.push(option));
            }
            else {
                ungroupedOptions.push(option);
            }
        });
        const matchingValue = ungroupedOptions.find((option) => option[valueField] === value);
        if (matchingValue !== undefined)
            return matchingValue[labelField];
    }
    return undefined;
};
/**
 * Filters the options based on the search string.
 * @param options - array of options
 * @param includeDescriptions - determines whether option descriptions are included when filtering options
 * @param searchString - string used to filter the options
 * @param position - whether the search string matches the start of or anywhere in the options
 * @returns filtered array of options
 */
export const getFilteredMenuOptions = (options, includeDescriptions, searchString, position = ANYWHERE_SEARCH_POSITION, labelField = "label") => options.filter((option) => {
    var _a;
    const label = option[labelField].toLowerCase();
    const description = (_a = option.description) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    const lowerSearchString = searchString.toLowerCase();
    return position === ANYWHERE_SEARCH_POSITION
        ? includeDescriptions
            ? label.includes(lowerSearchString) ||
                (description === null || description === void 0 ? void 0 : description.includes(lowerSearchString))
            : label.includes(lowerSearchString)
        : includeDescriptions
            ? label.startsWith(lowerSearchString) ||
                (description === null || description === void 0 ? void 0 : description.startsWith(lowerSearchString))
            : label.startsWith(lowerSearchString);
});
/**
 * Gets count of options where only group title "parent" options have been removed.
 * Disabled options are included in the count.
 * @param options - array of options
 * @returns number of options not including group titles
 */
export const getOptionsWithoutGroupTitlesCount = (options) => {
    const optionsWithoutGroupTitles = [];
    if (options.length > 0 && options.map) {
        options.map((option) => {
            if (option.children) {
                option.children.map((option) => optionsWithoutGroupTitles.push(option));
            }
            else {
                optionsWithoutGroupTitles.push(option);
            }
        });
    }
    return optionsWithoutGroupTitles.length;
};
export const deviceSizeMatches = (size) => window.matchMedia(`(max-width: ${size}px)`).matches;
export const getCurrentDeviceSize = () => {
    if (deviceSizeMatches(DEVICE_SIZES.S)) {
        return DEVICE_SIZES.S;
    }
    if (deviceSizeMatches(DEVICE_SIZES.M)) {
        return DEVICE_SIZES.M;
    }
    if (deviceSizeMatches(DEVICE_SIZES.L)) {
        return DEVICE_SIZES.L;
    }
    if (deviceSizeMatches(DEVICE_SIZES.XL)) {
        return DEVICE_SIZES.XL;
    }
    //fallback needed as all of above get initialised to 0 in jest tests
    return DEVICE_SIZES.UNDEFINED;
};
export const getCssProperty = (cssVar) => getComputedStyle(document.documentElement).getPropertyValue(cssVar);
/**
 * Returns the brightness of the brand colour, calculated by using the brand RGB CSS values by:
 * - Multiplying each RGB value by a set number: https://www.w3.org/TR/AERT/#color-contrast
 * - Adding them together and dividing by 1000
 * This is a similar calculation to its CSS counterpart: "--ic-brand-text-color"
 * @returns number representing the brightness of the brand colour
 */
export const getBrandColorBrightness = () => {
    const r = getCssProperty("--ic-brand-color-primary-r");
    const g = getCssProperty("--ic-brand-color-primary-g");
    const b = getCssProperty("--ic-brand-color-primary-b");
    return (parseInt(r) * 299 + parseInt(g) * 587 + parseInt(b) * 114) / 1000;
};
/**
 * Returns if dark or light foreground colors should be used for color contrast reasons
 * @returns "dark" or "light"
 * @param brightness - Optional custom brightness value. Defaults to `getBrandColorBrightness`
 */
export const getBrandForegroundAppearance = (brightness = getBrandColorBrightness()) => brightness > DARK_MODE_THRESHOLD
    ? IcBrandForegroundEnum.Dark
    : IcBrandForegroundEnum.Light;
export const getSlot = (element, name) => (element === null || element === void 0 ? void 0 : element.querySelector(`[slot="${name}"]`)) || null;
export const slotHasContent = (element, name) => getSlot(element, name) !== null;
export const getSlotContent = (element, name) => {
    const slot = getSlot(element, name);
    return slot ? getSlotElements(slot) : null;
};
export const getSlotElements = (slot) => {
    const slotContent = slot.firstElementChild;
    if (slotContent === null)
        return [slot];
    const elements = slotContent.assignedElements
        ? slotContent.assignedElements()
        : slotContent.childNodes;
    return elements.length ? elements : slot.tagName ? [slot] : null;
};
export const getNavItemParentDetails = ({ parentElement, }) => {
    let navType = { navType: "", parent: null };
    if (parentElement) {
        switch (parentElement.tagName) {
            case "IC-NAVIGATION-GROUP":
                navType = getNavItemParentDetails(parentElement);
                break;
            case "IC-TOP-NAVIGATION":
                navType = { navType: "top", parent: parentElement };
                break;
            case "IC-SIDE-NAVIGATION":
                navType = { navType: "side", parent: parentElement };
                break;
            case "IC-PAGE-HEADER":
                navType = { navType: "page-header", parent: null };
                break;
        }
    }
    return navType;
};
export const DEVICE_SIZES = {
    XS: Number(getCssProperty("--ic-breakpoint-xs").replace("px", "")), // 0
    S: Number(getCssProperty("--ic-breakpoint-sm").replace("px", "")), // 576
    M: Number(getCssProperty("--ic-breakpoint-md").replace("px", "")), // 768
    L: Number(getCssProperty("--ic-breakpoint-lg").replace("px", "")), // 992
    XL: Number(getCssProperty("--ic-breakpoint-xl").replace("px", "")), // 1200
    UNDEFINED: 1200,
};
export const hasValidationStatus = (status, disabled) => !!status && !disabled;
export const isSlotUsed = ({ children }, slotName) => Array.from(children).some((child) => child.getAttribute("slot") === slotName);
// added as a common method to allow detection of gatsby hydration issue, where (camelCase) props are initially undefined & then update
// with a value. Allows a callback function to be executed when this is the case
export const onComponentPropUndefinedChange = (oldValue, newValue, callback) => {
    if (oldValue === undefined && newValue !== oldValue) {
        callback();
    }
};
export const onComponentRequiredPropUndefined = (props, component) => {
    props.forEach(({ prop, propName }) => {
        if (prop === null || prop === undefined) {
            console.error(`No ${propName} specified for ${component} component - prop '${propName}' (web components) / '${kebabToCamelCase(propName)}' (react) required`);
        }
    });
};
export const kebabToCamelCase = (kebabCase) => kebabCase
    .toLowerCase()
    .split("-")
    .map((word, index) => index === 0
    ? word
    : `${word.substring(0, 1).toUpperCase()}${word.substring(1)}`)
    .join("");
export const checkResizeObserver = (callbackFn) => {
    if (typeof window !== "undefined" &&
        typeof window.ResizeObserver !== "undefined") {
        callbackFn();
    }
};
const hex2dec = (v) => parseInt(v, 16);
export const hexToRgba = (hex) => {
    const hexChars = hex
        .replace("#", "")
        .split("")
        .map((char) => char.repeat(2));
    return {
        r: hex2dec(hex.length === 4 ? hexChars[0] : hex.slice(1, 3)),
        g: hex2dec(hex.length === 4 ? hexChars[1] : hex.slice(3, 5)),
        b: hex2dec(hex.length === 4 ? hexChars[2] : hex.slice(5)),
        a: 1,
    };
};
export const rgbaStrToObj = (rgbaStr) => {
    const isRGBA = rgbaStr.slice(3, 4).toLowerCase() === "a";
    const rgbValues = rgbaStr
        .substring(isRGBA ? 5 : 4, rgbaStr.length - 1)
        .replace(/ /g, "")
        .split(",")
        .map(Number);
    return {
        r: rgbValues[0],
        g: rgbValues[1],
        b: rgbValues[2],
        a: isRGBA ? rgbValues[3] : 1,
    };
};
export const elementOverflowsX = ({ scrollWidth, clientWidth, }) => scrollWidth > clientWidth;
export const hasClassificationBanner = () => !!document.querySelector("ic-classification-banner:not([inline='true'])");
export const addFormResetListener = (el, callbackFn) => {
    var _a;
    (_a = el.closest("FORM")) === null || _a === void 0 ? void 0 : _a.addEventListener("reset", callbackFn);
};
export const removeFormResetListener = (el, callbackFn) => {
    var _a;
    (_a = el.closest("FORM")) === null || _a === void 0 ? void 0 : _a.removeEventListener("reset", callbackFn);
};
export const pxToRem = (px, base = 16) => `${(1 / base) * parseInt(px)}rem`;
/**
 * Removes the disabled attribute from the provided element when its value is set to false.
 * This effectively makes it null, to not confuse screen readers that cannot interpret the false value
 */
export const removeDisabledFalse = (disabled, element) => {
    if (!disabled) {
        element.removeAttribute("disabled");
    }
};
export const isMacDevice = () => window.navigator.userAgent.toUpperCase().indexOf("MAC") >= 0;
export const isNumeric = (value) => /^-?\d+$/.test(value);
export async function waitForHydration() {
    const elements = document.getElementsByTagName("*");
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].tagName.startsWith("IC-")) {
            if (elements[i].classList.contains("hydrated")) {
                return true;
            }
        }
        else {
            return false;
        }
    }
    return false;
}
export const convertToRGBA = (color) => {
    const firstChar = color === null || color === void 0 ? void 0 : color.slice(0, 1).toLowerCase();
    return firstChar === "#"
        ? hexToRgba(color)
        : firstChar === "r"
            ? rgbaStrToObj(color)
            : null;
};
export const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
export const checkSlotInChildMutations = (addedNodes, removedNodes, slotName) => {
    const hasSlot = (nodeList) => Array.from(nodeList).some((node) => Array.isArray(slotName)
        ? slotName.some((name) => node.slot === name)
        : node.slot === slotName);
    return hasSlot(addedNodes) || hasSlot(removedNodes);
};
export const isElInAGGrid = (el) => !!el.closest(".ag-cell") && !!el.closest(".ag-root");
export const addDataToPosition = (dataObject, newKeys, newValue) => {
    const newData = {};
    const newIndexes = newKeys.map((key) => key.index);
    const keys = Object.keys(dataObject);
    const values = Object.values(dataObject);
    const numberOfKeys = keys.length + newIndexes.length;
    for (let i = 0, j = 0; i < numberOfKeys; i++) {
        if (newIndexes.includes(i)) {
            newData[newKeys[newIndexes.indexOf(i)].key] = newValue;
            continue;
        }
        newData[keys[j]] = values[j];
        j++;
    }
    return newData;
};
/**
 * Checks if the component is slotted in its relevant 'group' component
 * @param component - the component to check
 */
export const isSlottedInGroup = (component) => { var _a; return ((_a = component.parentElement) === null || _a === void 0 ? void 0 : _a.tagName) === `${component.tagName}-GROUP`; };
export const hasDynamicChildSlots = (mutationList, slotNames) => mutationList.some(({ type, addedNodes, removedNodes }) => type === "childList" &&
    checkSlotInChildMutations(addedNodes, removedNodes, slotNames));
export const renderDynamicChildSlots = (mutationList, slotNames, ref) => {
    if (hasDynamicChildSlots(mutationList, slotNames)) {
        forceUpdate(ref);
    }
};
/**
 * Focuses the provided element, or the next focusable element if it should be skipped. Used for focus trapping.
 * @param element - element to focus
 * @param focusedElementIndex - current focused element index
 * @param interactiveElementList - list of interactive elements
 * @param shiftKey - whether the shift key is pressed
 */
export const focusElement = (focusedElementIndex, interactiveElementList, shiftKey = false) => {
    let element = interactiveElementList[focusedElementIndex];
    if (!element) {
        return;
    }
    let newFocusedElementIndex = focusedElementIndex;
    if (shouldSkipElement(element)) {
        newFocusedElementIndex = getFocusIndexBasedOnShiftKey(newFocusedElementIndex, shiftKey);
        newFocusedElementIndex = getLoopedNextFocusIndexIfLastElement(newFocusedElementIndex, interactiveElementList);
        return focusElement(newFocusedElementIndex, interactiveElementList, shiftKey);
    }
    else {
        switch (element.tagName) {
            case IC_ACCORDION:
            case IC_ACCORDION_GROUP:
            case IC_CHECKBOX:
            case IC_SEARCH_BAR:
            case IC_TAB_CONTEXT:
            case IC_TEXT_FIELD:
                element.setFocus();
                break;
            default:
                element.focus();
        }
        return newFocusedElementIndex;
    }
};
/**
 * Gets the index of the currently focused element. Used for focus trapping.
 * @param el - host element of the component
 * @param interactiveElementList - list of interactive elements
 */
export const getFocusedElementIndex = (el, interactiveElementList) => {
    var _a;
    for (let i = 0; i < interactiveElementList.length; i++) {
        if (interactiveElementList[i] ===
            (((_a = el.shadowRoot) === null || _a === void 0 ? void 0 : _a.activeElement) || document.activeElement)) {
            return i;
        }
    }
    return 0; // Fallback to first element if none found
};
/**
 * Gets the next focusable element index based on whether the shift key is pressed. Used for focus trapping.
 * @param focusedElementIndex - current focused element index
 * @param shiftKey - whether the shift key is pressed
 */
export const getFocusIndexBasedOnShiftKey = (focusedElementIndex, shiftKey) => (shiftKey ? (focusedElementIndex -= 1) : (focusedElementIndex += 1));
/**
 * Gets the next focusable element index, looping back to the start or end if necessary. Used for focus trapping.
 * @param focusedElementIndex - current focused element index
 * @param interactiveElementList - list of interactive elements
 */
export const getLoopedNextFocusIndexIfLastElement = (focusedElementIndex, interactiveElementList) => {
    if (focusedElementIndex > interactiveElementList.length - 1) {
        return 0;
    }
    else if (focusedElementIndex < 0) {
        return interactiveElementList.length - 1;
    }
    return focusedElementIndex;
};
/**
 * Handles the tab key press for focus trapping. Used for focus trapping.
 * @param el - host element of the component
 * @param interactiveElementList - list of interactive elements
 * @param shiftKey - whether the shift key is pressed
 */
export function handleFocusTrapTabKeyPress(el, focusAttemptCount, interactiveElementList, shiftKey) {
    var _a;
    let newFocusAttemptCount = focusAttemptCount;
    const focusedElementIndex = getFocusedElementIndex(el, interactiveElementList);
    if (((_a = interactiveElementList[focusedElementIndex]) === null || _a === void 0 ? void 0 : _a.tagName) === IC_SEARCH_BAR) {
        return {
            newFocusAttemptCount,
            newFocusedElementIndex: focusedElementIndex,
            preventDefault: false,
        };
    }
    let newFocusedElementIndex = getFocusIndexBasedOnShiftKey(focusedElementIndex, shiftKey);
    newFocusedElementIndex = getLoopedNextFocusIndexIfLastElement(newFocusedElementIndex, interactiveElementList);
    newFocusAttemptCount = 0;
    const focusElementResult = focusElement(newFocusedElementIndex, interactiveElementList, shiftKey);
    if (focusElementResult) {
        newFocusedElementIndex = focusElementResult;
    }
    return { newFocusAttemptCount, newFocusedElementIndex, preventDefault: true };
}
/**
 * Sets up listener and mutation observer to refresh interactive elements on slot changes. Used for focus trapping.
 * @param contentWrapper - content wrapper element
 * @param getInteractiveElements - function to set interactive elements
 */
export const refreshInteractiveElementsOnSlotChange = (contentWrapper, getInteractiveElements) => {
    var _a;
    let contentAreaSlot = null;
    let contentAreaMutationObserver = null;
    if (contentWrapper) {
        contentAreaSlot = contentWrapper.querySelector("slot");
        // Detect changes to slotted elements
        contentAreaSlot === null || contentAreaSlot === void 0 ? void 0 : contentAreaSlot.addEventListener("slotchange", getInteractiveElements);
        contentAreaMutationObserver = new MutationObserver(() => {
            getInteractiveElements();
        });
        // Detect changes to children of slotted elements
        (_a = getSlotElements(contentWrapper)) === null || _a === void 0 ? void 0 : _a.forEach((el) => {
            contentAreaMutationObserver === null || contentAreaMutationObserver === void 0 ? void 0 : contentAreaMutationObserver.observe(el, {
                childList: true,
                subtree: true,
            });
        });
    }
    return { contentAreaSlot, contentAreaMutationObserver };
};
/**
 * Removes listener and disconnects mutation observer for slot changes. Used for focus trapping.
 * @param contentAreaSlotMutationObserver - mutation observer for content area slot
 * @param contentAreaSlot - content area slot element
 * @param getInteractiveElements - function to set interactive elements
 */
export const removeInteractiveElementSlotChangeListener = (contentAreaSlot, contentAreaSlotMutationObserver, getInteractiveElements) => {
    if (contentAreaSlot) {
        contentAreaSlot.removeEventListener("slotchange", getInteractiveElements);
        contentAreaSlotMutationObserver === null || contentAreaSlotMutationObserver === void 0 ? void 0 : contentAreaSlotMutationObserver.disconnect();
    }
};
/**
 * Determines whether an element should be skipped when focusing interactive elements. Used for focus trapping.
 * @param element - element to check
 */
export const shouldSkipElement = (element) => {
    if (!element) {
        return true;
    }
    const isHidden = getComputedStyle(element).visibility === "hidden" ||
        element.offsetHeight === 0 ||
        element.hasAttribute("disabled") ||
        (element.tagName === IC_ACCORDION_GROUP &&
            element.hasAttribute("single-expansion"));
    const radioEl = element.closest("ic-radio-option");
    return (isHidden ||
        (element.getAttribute("type") === "radio" &&
            !!radioEl &&
            !(radioEl.hasAttribute("selected") || element.tabIndex === 0)));
};
/**
 * Gets all interactive elements slotted within a component. Used for focus trapping.
 * @param el - host element of the component
 */
export const slottedInteractiveElements = (el) => Array.from(el.querySelectorAll(`a[href], button, input:not(.ic-input), textarea, select, details, [tabindex]:not([tabindex="-1"]),
          ic-button, ic-checkbox, ic-select, ic-search-bar, ic-tab-context,
          ic-back-to-top, ic-breadcrumb, ic-action-chip, ic-chip[dismissible="true"], ic-footer-link, ic-link, ic-navigation-button,
          ic-navigation-item, ic-switch, ic-text-field, ic-accordion-group, ic-accordion, ic-date-input, ic-date-picker, ic-time-input`));
//# sourceMappingURL=helpers.js.map
