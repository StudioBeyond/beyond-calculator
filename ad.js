////////////////////////////////////////
// 🎁 Variables
////////////////////////////////////////
const CALC_ATTRIBUTE = 'by-calc-element';
const VALUE_ATTRIBUTE = 'by-calc-value';
const FS_ACTIVE_CLASS_ATTRIBUTE = 'fs-inputactive-class';
const FS_ACTIVE_CLASS_SELECTOR = '[fs-inputactive-class]';

const calcForm = document.querySelector(`[${CALC_ATTRIBUTE}="form"]`);
const rateUsdGbp = parseFloat(calcForm.getAttribute('by-currency-rate'));

const value = {
  totalUsd: 0,
  totalGbp: 0,
  totalBase: 0,
  rateUsdGbp: rateUsdGbp,

  totalSpend: 0,
  totalManagement: 0,
  totalManagementRate: 0,

  revenueValue: 0,
  growthValue: 0,
  platformValue: 0,

};

////////////////////////////////////////
// 📦 Elements & Variables
////////////////////////////////////////
const sliderComponents = Array.from(document.querySelectorAll(
  `[${CALC_ATTRIBUTE}^="slider"]`));
const radioButtons = Array.from(document.querySelectorAll(
  `[${CALC_ATTRIBUTE}^="radio"]`));
const checkboxButtons = Array.from(document.querySelectorAll(
  `[${CALC_ATTRIBUTE}^="checkbox"]`));

const sliderGroups = groupElements(sliderComponents);
const radioGroups = groupElements(radioButtons);
const checkboxGroups = groupElements(checkboxButtons);

// Subtotals
const spendDisplay = document.querySelector(
  `[${CALC_ATTRIBUTE}="display-spend"]`);
const managementDisplay = document.querySelector(
  `[${CALC_ATTRIBUTE}="display-management"]`);
const mgmtRanges = Function(
  `"use strict"; return (${managementDisplay.getAttribute(VALUE_ATTRIBUTE)})`)();

// Totals
const totalDisplayTextUsd = document.querySelector(`[${CALC_ATTRIBUTE}="total-display-text-usd"]`);
const totalDisplayUsd = totalDisplayTextUsd.querySelector(`[${CALC_ATTRIBUTE}="total-display"]`);
const totalDisplayTextGbp = document.querySelector(`[${CALC_ATTRIBUTE}="total-display-text-gbp"]`);
const totalDisplayGbp = totalDisplayTextGbp.querySelector(`[${CALC_ATTRIBUTE}="total-display"]`);
value.totalBase = parseFloat(totalDisplayUsd.getAttribute('by-calc-total-base'));

////////////////////////////////////////
// 🤖 Functions & Listeners
////////////////////////////////////////
/**
 * Utility
 */
function groupElements(elements) {
  const groups = {};
  elements.forEach(element => {
    const attributeValue = element.getAttribute(CALC_ATTRIBUTE);
    const groupName = attributeValue.substring(attributeValue.indexOf('-') + 1);
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(element);
  });
  return groups;
}

// Slider value display
function updateSliderDisplay(input, display) {
  const value = parseFloat(input.value);
  display.textContent = !isNaN(value) ? value.toLocaleString('en-US') : '';
}

function sliderListeners(sliderComponents) {
  sliderComponents.forEach(component => {
    const input = component.querySelector(`[${CALC_ATTRIBUTE}="input"]`);
    const display = component.querySelector(`[${CALC_ATTRIBUTE}="display"]`);

    updateSliderDisplay(input, display);
    input.addEventListener('input', () => {
      updateSliderDisplay(input, display);
      calculateTotal();
    });
  });
}

function calculateSliders(groupObject) {
  Object.keys(groupObject).forEach(key => {
    const inputElement = groupObject[key][0].querySelector(
      `[${CALC_ATTRIBUTE}="input"]`);
    const InputValue = parseFloat(inputElement.value);
    value[`${key.toLowerCase()}Value`] = InputValue;
  });
}

// Mutation Observer
function createMutationObserver(element, callback) {
  const observer = new MutationObserver(mutationsList => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        callback();
        break;
      }
    }
  });
  observer.observe(element, { attributes: true });
}

function observeMutations(elements) {
  elements.forEach(element => {
    createMutationObserver(element, calculateTotal);
  });
}

// Assigning selected values
function getFsActiveClass(array) {
  return array[0].querySelector(
    FS_ACTIVE_CLASS_SELECTOR).getAttribute(FS_ACTIVE_CLASS_ATTRIBUTE);
}

function radioSelector(array) {
  return array.find(item => item.classList.contains(getFsActiveClass(array)));
}

function checkboxSelector(array) {
  return array.filter(item => item.classList.contains(getFsActiveClass(array)));
}

function radioAggregator(selected) {
  return selected ? parseFloat(selected.getAttribute(VALUE_ATTRIBUTE)) : 0;
}

function checkboxAggregator(selectedArray) {
  return selectedArray ?
    selectedArray.reduce((sum, element) =>
      sum + parseFloat(element.getAttribute(VALUE_ATTRIBUTE)), 0) :
    0;
}

function calculateGroups(groupObject, selectorFn, aggregatorFn) {
  Object.keys(groupObject).forEach(key => {
    const selectedElements = selectorFn(groupObject[key]);
    value[`${key.toLowerCase()}Value`] = aggregatorFn(selectedElements);
  });
}

// Management Total
function getValueInRange(number, mgmtRanges) {
  for (let i = 0; i < mgmtRanges.length; i++) {
    const range = mgmtRanges[i];
    if (number >= range.min && number <= range.max) {
      return range.value;
    }
  }
  return null;
}

function calculateManagement() {
  value.totalManagementRate = getValueInRange(value.totalSpend, mgmtRanges);

  value.totalManagement = value.totalManagementRate > 1 ?
    value.totalManagementRate * value.platformValue :
    value.totalSpend * value.totalManagementRate * value.platformValue;
}

// Animate Totals
function animateTotalDisplay() {
  const elements = [
    totalDisplayTextUsd,
    totalDisplayTextGbp,
  ];
  elements.forEach((element) => {
    const className = element.getAttribute('by-update-class');
    const delay = element.getAttribute('by-update-delay');

    element.classList.add(className);
    setTimeout(() => {
      element.classList.remove(className);
    }, delay);
  });
}

/**
 * Calculate total
 */
function updateDisplay(element, value) {
  if (element && !isNaN(value)) {
    element.textContent = Math.round(value).toLocaleString('en-US');
  } else {
    element.textContent = 'NaN';
  }
}

function updateDisplayAll() {
  updateDisplay(spendDisplay, value.totalSpend)
  updateDisplay(managementDisplay, value.totalManagement)
  updateDisplay(totalDisplayUsd, value.totalUsd)
  updateDisplay(totalDisplayGbp, value.totalGbp)
}

function calculateTotal() {
  calculateSliders(sliderGroups)
  calculateGroups(radioGroups, radioSelector, radioAggregator);
  calculateGroups(checkboxGroups, checkboxSelector, checkboxAggregator);

  value.platformValue = value.platformValue > 1 ? value.platformValue : 1

  value.totalSpend = value.revenueValue * value.growthValue

  if (value.totalSpend > 0) {
    calculateManagement()
    value.totalUsd = value.totalSpend + value.totalManagement
  } else {
    value.totalSpend = 0
    value.totalManagement = 0
    value.totalUsd = 0
  }

  value.totalGbp = value.totalUsd * value.rateUsdGbp;

  updateDisplayAll();
  animateTotalDisplay();
  console.table(value);
}

function scrollToTopInstantly() {
  window.scrollTo({
    top: 0,
    behavior: 'instant'
  });
}
////////////////////////////////////////
// 🏁 Initialize Code
////////////////////////////////////////
function initCalc() {
  sliderListeners(sliderComponents);
  observeMutations(radioButtons);
  observeMutations(checkboxButtons);

  radioGroups.growth[0].click()
  checkboxGroups.platform[0].click()

  calculateTotal();
  scrollToTopInstantly();
}

var Webflow = Webflow || [];
Webflow.push(function () {
  initCalc()
});

////////////////////////////////////////
// 💸 Currency Toggle
////////////////////////////////////////
const CURRENCY_ATTRIBUTE = 'by-currency-element'
const currencyForm = document.querySelector(`[${CURRENCY_ATTRIBUTE}="form"]`);
const currencyCheckbox = document.querySelector(`[${CURRENCY_ATTRIBUTE}="checkbox"]`);
const [isUsd, isGbp] = currencyForm.getAttribute('by-currency-classes').split(', ');
const useCurrencyPreference = false

const updateClasses = () => {
  const selectedClass = currencyCheckbox.checked ? isGbp : isUsd;
  const removedClass = currencyCheckbox.checked ? isUsd : isGbp;
  currencyForm.classList.add(selectedClass);
  currencyForm.classList.remove(removedClass);
  localStorage.setItem('currencyPreference', selectedClass);
  animateTotalDisplay();
};
if (useCurrencyPreference) {
  const currencyPreference = localStorage.getItem('currencyPreference');
  currencyPreference === isGbp ? currencyCheckbox.click() : null;
}

updateClasses();
currencyCheckbox.addEventListener('change', updateClasses);
