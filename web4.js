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

  timeRateValue: 0,
  timeRateCount: 1,
  timeWeekCount: 0,
  timeWeekText: '',

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
    input.addEventListener('change', () => {
      updateSliderDisplay(input, display);
      calculateTotal();
    });
  });
}

function calculateSliders(groupObject) {
  console.log(groupObject);

  Object.keys(groupObject).forEach(key => {
    const inputElement = groupObject[key][0].querySelector(`[${CALC_ATTRIBUTE}="input"]`);
    const hasByCalcValue = groupObject[key][0].querySelector('[by-calc-value]') !== null;

    // console.log(key, hasByCalcValue);
    if (hasByCalcValue) {
      const inputCount = parseFloat(inputElement.value);
      value[`${key.toLowerCase()}Count`] = inputCount;
      const inputValueMultiplier = parseFloat(inputElement.getAttribute(VALUE_ATTRIBUTE))
      const inputValue = inputCount * inputValueMultiplier
      value[`${key.toLowerCase()}Value`] = inputValue;
    } else {
      const inputValue = parseFloat(inputElement.value);
      value[`${key.toLowerCase()}Value`] = inputValue;
    }
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

/**
 * Checkbox Reset
 */
// Helper function to check if all options are unclicked
function areAllOptionsUnclicked(options) {
  return options.every(option => !option.classList.contains(getFsActiveClass([option])));
}

// Helper function to deactivate other checkboxes when reset is activated
function deactivateOtherCheckboxesWhenResetIsActive(resetCheckbox, options) {
  if (resetCheckbox.classList.contains(getFsActiveClass([resetCheckbox]))) {
    options.forEach(option => {
      if (option.classList.contains(getFsActiveClass([option]))) {
        option.click();
      }
    });
  }
}

// Helper function to toggle reset checkbox
function toggleResetCheckboxIfNeeded(resetCheckbox, options) {
  const shouldActivateReset = areAllOptionsUnclicked(options);
  const isResetActive = resetCheckbox.classList.contains(getFsActiveClass([resetCheckbox]));

  if (shouldActivateReset && !isResetActive) {
    resetCheckbox.click();
  } else if (!shouldActivateReset && isResetActive) {
    resetCheckbox.click();
  }
}

// Observes and manages reset checkbox behavior accordingly
function observeCheckboxesWithReset(checkboxGroups) {
  Object.keys(checkboxGroups).forEach(groupName => {
    const checkboxes = checkboxGroups[groupName];
    const checkboxReset = checkboxes.find(checkbox => parseFloat(checkbox.getAttribute(
      VALUE_ATTRIBUTE)) === 0);
    const checkboxOptions = checkboxes.filter(checkbox => parseFloat(checkbox.getAttribute(
      VALUE_ATTRIBUTE)) !== 0);

    // Event listener for reset checkbox
    if (checkboxReset) {
      checkboxReset.addEventListener('click', (event) => {
        if (checkboxReset.classList.contains(getFsActiveClass([checkboxReset])) &&
          areAllOptionsUnclicked(checkboxOptions)) {
          event.preventDefault();
        } else {
          deactivateOtherCheckboxesWhenResetIsActive(checkboxReset, checkboxOptions);
        }
      });
    }

    checkboxes.forEach(checkbox => {
      createMutationObserver(checkbox, () => {
        toggleResetCheckboxIfNeeded(checkboxReset, checkboxOptions);

        // Unselect reset checkbox when an option is clicked
        if (checkboxOptions.includes(checkbox) && checkbox.classList.contains(
            getFsActiveClass([checkbox]))) {
          if (checkboxReset && checkboxReset.classList.contains(getFsActiveClass([
              checkboxReset
            ]))) {
            checkboxReset.click();
          }
        }
      });
    });
  });
}

/**
 * Initialize Checkboxes and Radios with 'by-start-checked' attribute as checked
 */
function initializeCheckedElements(groupObject) {
  Object.keys(groupObject).forEach(key => {
    groupObject[key].forEach(element => {
      const hasStartChecked =
        element.getAttribute('by-start-checked') === 'true' ||
        element.querySelector('[by-start-checked="true"]');
      const isVisible = !element.classList.contains('w-condition-invisible') ||
        !element.querySelector('.w-condition-invisible');

      if (hasStartChecked && isVisible) {
        console.log(element);
        element.click();
      }
    });
  });
}

/**
 * Animate Totals
 */
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
 * Timeline
 */
const parseRanges = (rangesString) => {
  return rangesString
    .replace(/'/g, '"')
    .replace(/([-]?)Infinity/g, '"$1Infinity"')
    .replace(/(\d+ \+ \d+)/g, (_, expr) => eval(expr));
};
const toProperType = (val) => {
  return val === "-Infinity" ? -Infinity :
    (val === "Infinity" ? Infinity : val);
};

const timelineDisplay = document.querySelector(
  `[${CALC_ATTRIBUTE}="timeline-display"]`);
const timelineRanges = JSON.parse(
  parseRanges(timelineDisplay.getAttribute(VALUE_ATTRIBUTE)));

timelineRanges.forEach(range => {
  Object.keys(range).forEach(key => {
    range[key] = toProperType(range[key]);
  });
});

const updateTimelineDisplay = () => {
  if (!timelineDisplay) {
    console.error('Timeline display element not found.');
    return;
  }
  for (const range of timelineRanges) {
    if (value.totalUsd >= range.min && value.totalUsd <= range.max) {
      value.timeWeekCount = range.weeks * value.timeRateCount;
      value.timeWeekText = `${value.timeWeekCount} weeks`
      timelineDisplay.textContent = value.timeWeekText;
      break;
    }
  }
};

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
  updateDisplay(totalDisplayUsd, value.totalUsd)
  updateDisplay(totalDisplayGbp, value.totalGbp)
}

function calculateTotal() {
  calculateSliders(sliderGroups)
  calculateGroups(radioGroups, radioSelector, radioAggregator);
  calculateGroups(checkboxGroups, checkboxSelector, checkboxAggregator);

  // Total
  value.totalUsd =
    (value.pageCount ? value.totalBase : 0) +
    value.pageValue +
    (value.motionValue * value.pageCount) +
    value.graphicValue +
    (value.copyValue * value.pageCount) +
    (value.seoValue * value.pageCount) +
    value.migrationValue +
    value.integrationValue +
    value.legalValue +
    value.languageValue +
    value.ecomValue +
    value.productValue;

  value.timeRateValue = value.timelineValue
  value.timeRateCount = value.timeRateValue <= 1 ? 1 : 0.5;
  updateTimelineDisplay();

  value.totalUsd *= value.timelineValue;
  value.totalGbp = value.totalUsd * value.rateUsdGbp;

  updateDisplayAll()
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
  observeCheckboxesWithReset(checkboxGroups);

  initializeCheckedElements(radioGroups);
  initializeCheckedElements(checkboxGroups);

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
