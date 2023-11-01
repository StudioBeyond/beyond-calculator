////////////////////////////////////////
// 🎁 Variables
////////////////////////////////////////
const calcAttribute = 'by-calc-element';
const valueAttribute = 'by-calc-value';
const activeClass = 'is-active-inputactive';

const calcForm = document.querySelector(`[${calcAttribute}="form"]`);
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

// mgmtRangesTest = [
//   { min: -Infinity, max: 10000, value: 1993 },
//   { min: 10000 + 1, max: 50000, value: 0.2 },
//   { min: 50000 + 1, max: Infinity, value: 0.15 },
// ]

////////////////////////////////////////
// 📦 Elements & Variables
////////////////////////////////////////
const sliderComponents = Array.from(document.querySelectorAll(
  `[${calcAttribute}^="slider"]`));
const radioButtons = Array.from(document.querySelectorAll(
  `[${calcAttribute}^="radio"]`));
const checkboxButtons = Array.from(document.querySelectorAll(
  `[${calcAttribute}^="checkbox"]`));

const sliderGroups = groupElements(sliderComponents, calcAttribute);
const radioGroups = groupElements(radioButtons, calcAttribute);
const checkboxGroups = groupElements(checkboxButtons, calcAttribute);

// console.log(sliderGroups);
// console.log(radioGroups);
// console.log(checkboxGroups);

// Subtotals
const spendDisplay = document.querySelector(
  `[${calcAttribute}="display-spend"]`);
const managementDisplay = document.querySelector(
  `[${calcAttribute}="display-management"]`);
const mgmtRanges = Function(
  `"use strict"; return (${managementDisplay.getAttribute(valueAttribute)})`)();

// Totals
const totalDisplayTextUsd = document.querySelector(
  `[${calcAttribute}="total-display-text-usd"]`);
const totalDisplayUsd = totalDisplayTextUsd.querySelector(
  `[${calcAttribute}="total-display"]`);
const totalDisplayTextGbp = document.querySelector(
  `[${calcAttribute}="total-display-text-gbp"]`);
const totalDisplayGbp = totalDisplayTextGbp.querySelector(
  `[${calcAttribute}="total-display"]`);
value.totalBase = parseFloat(totalDisplayUsd.getAttribute('by-calc-total-base'));

////////////////////////////////////////
// 🤖 Functions & Listeners
////////////////////////////////////////
/**
 * Utility
 */
function groupElements(elements, attribute) {
  const groups = {};
  elements.forEach(element => {
    const attributeValue = element.getAttribute(attribute);
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
    const input = component.querySelector(`[${calcAttribute}="input"]`);
    const display = component.querySelector(`[${calcAttribute}="display"]`);
    input.addEventListener('input', () => {
      updateSliderDisplay(input, display);
      calculateTotal();
    });
  });
}

function calculateSliders(groupObject) {
  Object.keys(groupObject).forEach(key => {
    const inputElement = groupObject[key][0].querySelector(
      `[${calcAttribute}="input"]`);
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
function radioSelector(array) {
  return array.find(item => item.classList.contains(activeClass));
}

function checkboxSelector(array) {
  return array.filter(item => item.classList.contains(activeClass));
}

function radioAggregator(selected) {
  return selected ? parseFloat(selected.getAttribute(valueAttribute)) : 0;
}

function checkboxAggregator(selectedArray) {
  return selectedArray ?
    selectedArray.reduce((sum, element) =>
      sum + parseFloat(element.getAttribute(valueAttribute)), 0) :
    0;
}

function calculateGroups(groupObject, selectorFn, aggregatorFn) {
  Object.keys(groupObject).forEach(key => {
    const selectedElements = selectorFn(groupObject[key]);
    value[`${key.toLowerCase()}Value`] = aggregatorFn(selectedElements);
  });
}

// function getValueFromAttribute(element, mgmtRanges) {
//   const number = parseFloat(element.getAttribute(valueAttribute));
//   if (isNaN(number)) {
//     console.log(number); // Output: "number"
//     console.log(typeof number); // Output: "number"

//     return null;
//   }
//   return getValueInRange(number, mgmtRanges);
// }

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
  console.log(value.totalManagementRate)

  value.totalManagement =
    value.totalManagementRate > 1 ?
    value.totalManagementRate :
    value.totalSpend * value.totalManagementRate;

  if (value.platformValue > 1) {
    value.totalManagement *= (value.platformValue - 1 * 0.5) + 1
  }
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

  value.totalSpend = value.revenueValue * value.growthValue
  calculateManagement()

  value.totalUsd = value.totalSpend + value.totalManagement
  value.totalGbp = value.totalUsd * value.rateUsdGbp;

  updateDisplayAll();
  animateTotalDisplay();
  console.table(value);
}

////////////////////////////////////////
// 🏁 Initialize Code
////////////////////////////////////////
var Webflow = Webflow || [];
Webflow.push(function () {
  sliderListeners(sliderComponents);
  observeMutations(radioButtons);
  observeMutations(checkboxButtons);

  radioGroups.growth[0].click()
  checkboxGroups.platform[0].click()

  calculateTotal();
  scrollToTopInstantly();
});

function scrollToTopInstantly() {
  window.scrollTo({
    top: 0,
    behavior: 'instant'
  });
}

////////////////////////////////////////
// 💸 Currency Toggle
////////////////////////////////////////
const currencyAttribute = 'by-currency-element'
const currencyForm = document.querySelector(`[${currencyAttribute}="form"]`);
const currencyCheckbox = document.querySelector(`[${currencyAttribute}="checkbox"]`);
const [isUsd, isGbp] = currencyForm.getAttribute('by-currency-classes').split(', ');

// const currencyPreference = localStorage.getItem('currencyPreference');
// currencyPreference === isGbp ? currencyCheckbox.click() : null;

const updateClasses = () => {
  if (currencyCheckbox.checked) {
    currencyForm.classList.add(isGbp);
    currencyForm.classList.remove(isUsd);
    localStorage.setItem('currencyPreference', isGbp);
  } else {
    currencyForm.classList.add(isUsd);
    currencyForm.classList.remove(isGbp);
    localStorage.setItem('currencyPreference', isUsd);
  }
  animateTotalDisplay();
};

updateClasses();
currencyCheckbox.addEventListener('change', updateClasses);
