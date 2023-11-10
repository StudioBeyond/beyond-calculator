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

  identityValue: 0,
  positioningValue: 0,
  messagingValue: 0,
  guidelineValue: 0,
  portalValue: 0,
  kitValue: 0,
  timelineValue: 0,

  timeRateValue: 0,
  timeRateCount: 1,
  timeWeekCount: 0,
  timeWeekText: '',
};

////////////////////////////////////////
// 📦 Elements & Variables
////////////////////////////////////////

// Radios
const radioButtons = Array.from(document.querySelectorAll(
  `[${calcAttribute}^="radio"]`));
const radioGroups = {};
radioButtons.forEach(button => {
  const attributeValue = button.getAttribute(calcAttribute);
  const groupName = attributeValue.substring(attributeValue.indexOf('-') + 1);
  if (!radioGroups[groupName]) {
    radioGroups[groupName] = [];
  }
  radioGroups[groupName].push(button);
});

// Checkboxes
const checkboxButtons = Array.from(document.querySelectorAll(
  `[${calcAttribute}^="checkbox"]`));
const checkboxGroups = {};
checkboxButtons.forEach(button => {
  const attributeValue = button.getAttribute(calcAttribute);
  const groupName = attributeValue.substring(attributeValue.indexOf('-') + 1);
  if (!checkboxGroups[groupName]) {
    checkboxGroups[groupName] = [];
  }
  checkboxGroups[groupName].push(button);
});

// Totals
const totalDisplayTextUsd = document.querySelector(
  `[${calcAttribute}="total-display-text-usd"]`);
const totalDisplayUsd = totalDisplayTextUsd.querySelector(`[${calcAttribute}="total-display"]`);
const totalDisplayTextGbp = document.querySelector(
  `[${calcAttribute}="total-display-text-gbp"]`);
const totalDisplayGbp = totalDisplayTextGbp.querySelector(`[${calcAttribute}="total-display"]`);
value.totalBase = parseFloat(totalDisplayUsd.getAttribute('by-calc-total-base'));

////////////////////////////////////////
// 🤖 Functions & Listeners
////////////////////////////////////////
/**
 * Utility
 */
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
  `[${calcAttribute}="timeline-display"]`);
const timelineRanges = JSON.parse(
  parseRanges(timelineDisplay.getAttribute('by-calc-timeline-ranges'))
);

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
const updateTotalDisplay = () => {
  totalDisplayUsd.textContent = !isNaN(value.totalUsd) ? Math.round(value.totalUsd)
    .toLocaleString('en-US') : 'NaN';
  totalDisplayGbp.textContent = !isNaN(value.totalGbp) ? Math.round(value.totalGbp)
    .toLocaleString('en-US') : 'NaN';
}

function calculateTotal() {
  calculateGroups(radioGroups, radioSelector, radioAggregator);
  calculateGroups(checkboxGroups, checkboxSelector, checkboxAggregator);

  value.timeRateValue = value.timelineValue
  value.timeRateCount = value.timeRateValue <= 1 ? 1 : 0.5;

  value.totalUsd =
    value.identityValue +
    value.positioningValue +
    value.messagingValue +
    value.guidelineValue +
    value.kitValue +
    value.portalValue

  updateTimelineDisplay();

  value.totalUsd *= value.timelineValue;
  value.totalGbp = value.totalUsd * value.rateUsdGbp;
  updateTotalDisplay();
  animateTotalDisplay();

  console.table(value);
}

////////////////////////////////////////
// 🏁 Initialize Code
////////////////////////////////////////
var Webflow = Webflow || [];
Webflow.push(function () {
  observeMutations(radioButtons);
  observeMutations(checkboxButtons);

  radioGroups.guideline[0].click()
  radioGroups.identity[0].click()
  radioGroups.messaging[0].click()
  radioGroups.portal[0].click()
  radioGroups.positioning[0].click()
  radioGroups.timeline[0].click()

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

const currencyPreference = localStorage.getItem('currencyPreference');
currencyPreference === isGbp ? currencyCheckbox.click() : null;

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
