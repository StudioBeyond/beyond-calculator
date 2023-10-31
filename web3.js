////////////////////////////////////////
// 🎁 Variables
////////////////////////////////////////
const webcalcAttribute = 'by-webcalc-element';
const valueAttribute = 'by-webcalc-value';
const activeClass = 'is-active-inputactive';

const value = {
  totalUsd: 0,
  totalGbp: 0,
  totalBase: 0,
  rateUsdToGbp: 0.85,

  pageCountUnique: 0,
  pageCountTotal: 0,

  pageValuePerUnique: 0,

  pageValueTotalUnique: 0,
  pageValueTotalAll: 0,

  motion: 0,
  copy: 0,
  seo: 0,
  integration: 0,

  timeline: 0,
  timelineRate: 1,
  timelineWeeks: 0,
  timelineText: '',
};

////////////////////////////////////////
// 📦 Elements & Variables
////////////////////////////////////////

// Sliders
const pageUniqueInput = document.querySelector(`[${webcalcAttribute}="page-unique-input"]`);
const pageUniqueDisplay = document.querySelector(`[${webcalcAttribute}="page-unique-display"]`);

const pageInputs = Array.from([pageUniqueInput]);
value.pageValuePerUnique = parseFloat(pageUniqueInput
  .getAttribute(valueAttribute))

// Radios
const radioButtons = Array.from(document.querySelectorAll(`[${webcalcAttribute}^="radio"]`));
const radiosMotion = Array.from(document.querySelectorAll(
  `[${webcalcAttribute}="radio-motion"]`));
const radiosCopy = Array.from(document.querySelectorAll(`[${webcalcAttribute}="radio-copy"]`));
const radiosSeo = Array.from(document.querySelectorAll(`[${webcalcAttribute}="radio-seo"]`));
const radiosTimeline = Array.from(document.querySelectorAll(
  `[${webcalcAttribute}="radio-timeline"]`));

// Checkboxes
const checkboxButtons = Array.from(document.querySelectorAll(`[${webcalcAttribute}^="checkbox"]`));
const checkboxesIntegration = Array.from(document.querySelectorAll(
  `[${webcalcAttribute}="checkbox-integration"]`));
const checkboxIntegrationReset = checkboxesIntegration.find(checkbox => parseFloat(checkbox
  .getAttribute(
    valueAttribute)) === 0);
const checkboxIntegrationOptions = checkboxesIntegration.filter(checkbox => parseFloat(checkbox
  .getAttribute(
    valueAttribute)) !== 0);

// Totals
const totalDisplayTextUsd = document.querySelector(
  `[${webcalcAttribute}="total-display-text-usd"]`);
const totalDisplayUsd = totalDisplayTextUsd.querySelector(`[${webcalcAttribute}="total-display"]`);
const totalDisplayTextGbp = document.querySelector(
  `[${webcalcAttribute}="total-display-text-gbp"]`);
const totalDisplayGbp = totalDisplayTextGbp.querySelector(`[${webcalcAttribute}="total-display"]`);
value.totalBase = parseFloat(totalDisplayUsd.getAttribute('by-webcalc-total-base'));

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

function observeMutationCheckboxes(checkboxOptions, checkboxReset) {
  checkboxOptions.forEach(checkbox => {
    createMutationObserver(checkbox, () => {

      console.log("Option Mutate");
      const selecteds = filterSelected(checkboxOptions);
      console.log(selecteds);
      if (checkboxReset.classList.contains(activeClass)) {
        checkboxReset.click();
      }
      if (!selecteds.length) {
        checkboxReset.click();
      }
    });
  })
  createMutationObserver(checkboxReset, () => {
    const selecteds = filterSelected(checkboxOptions);
    if (selecteds.length > 0) {
      selecteds.forEach((checkbox) => {
        checkbox.click();
      });
    }
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
};

// Find selected radio
const findSelected = (array) => {
  const selected = array.find(item => item.classList.contains(activeClass));
  return selected;
};

// Find selected checkbox/es
const filterSelected = (array) => {
  const selected = array.filter(item => item.classList.contains(activeClass));
  return selected;
};

/**
 * Slider
 */
function updateSliderDisplay(input, display) {
  const value = parseFloat(input.value);
  display.textContent = !isNaN(value) ? value.toLocaleString('en-US') : '';
}

function calculatePages() {
  value.pageCountUnique = parseFloat(pageUniqueInput.value);
  value.pageCountTotal = parseFloat(value.pageCountUnique);

  value.pageValueTotalUnique =
    value.pageValuePerUnique *
    value.pageCountUnique
  value.pageValueTotalAll =
    value.pageValueTotalUnique
}

pageInputs.forEach(input => {
  input.addEventListener('input', () => {
    updateSliderDisplay(pageUniqueInput, pageUniqueDisplay)
    calculateTotal();
  });
});

/**
 * Radio
 */
observeMutations(radioButtons);

/**
 * Checkboxes
 */
observeMutations(checkboxButtons);
observeMutationCheckboxes(
  checkboxIntegrationOptions, checkboxIntegrationReset)

/**
 * Timeline
 */
const parseTimelineRanges = (timelineRangesString) => {
  return timelineRangesString
    .replace(/'/g, '"')
    .replace(/([-]?)Infinity/g, '"$1Infinity"')
    .replace(/(\d+ \+ \d+)/g, (_, expr) => eval(expr));
};
const toProperType = (val) => {
  return val === "-Infinity" ? -Infinity :
    (val === "Infinity" ? Infinity : val);
};

const timelineDisplay = document.querySelector(`[${webcalcAttribute}="timeline-display"]`);
let timelineRangesString = timelineDisplay.getAttribute('by-webcalc-timeline-ranges');

timelineRangesString = parseTimelineRanges(timelineRangesString);

let timelineRanges = JSON.parse(timelineRangesString);
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
      value.timelineWeeks = range.weeks * value.timelineRate;
      value.timelineText = `${value.timelineWeeks} weeks`
      timelineDisplay.textContent = value.timelineText;
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
  calculatePages();

  // Radio
  const selectedMotion = findSelected(radiosMotion);
  const selectedCopy = findSelected(radiosCopy);
  const selectedSeo = findSelected(radiosSeo);
  const selectedTimeline = findSelected(radiosTimeline);
  value.motion = selectedMotion ?
    parseFloat(selectedMotion.getAttribute(valueAttribute)) * value.pageCountTotal : 0;
  value.copy = selectedCopy ?
    parseFloat(selectedCopy.getAttribute(valueAttribute)) * value.pageCountTotal : 0;
  value.seo = selectedSeo ?
    parseFloat(selectedSeo.getAttribute(valueAttribute)) * value.pageCountTotal : 0;
  value.timeline = selectedTimeline ?
    parseFloat(selectedTimeline.getAttribute(valueAttribute)) : 0;
  value.timelineRate = value.timeline <= 1 ? 1 : 0.5;
  value.timelineRate = value.pageCountTotal != 0 ? value.timelineRate : 0

  // Checkbox
  const selectedIntegration = filterSelected(checkboxesIntegration);
  value.integration = selectedIntegration ? selectedIntegration.reduce((sum, integration) => {
    return sum + parseFloat(integration.getAttribute(valueAttribute));
  }, 0) : 0;

  // Total

  value.totalUsd =
    (value.pageCountTotal ? value.totalBase : 0) +
    value.pageValueTotalAll +
    value.motion +
    value.copy +
    value.seo +
    value.integration;

  updateTimelineDisplay();
  value.totalUsd *= value.timeline;

  value.totalGbp =
    value.totalUsd *
    value.rateUsdToGbp;

  updateTotalDisplay();
  animateTotalDisplay();

  console.table(value);
};

////////////////////////////////////////
// 🏁 Initialize Code
////////////////////////////////////////
var Webflow = Webflow || [];
Webflow.push(function () {
  radiosMotion[0].click();
  radiosCopy[0].click();
  radiosSeo[0].click();
  checkboxesIntegration[0].click();
  console.log(checkboxesIntegration[0])
  radiosTimeline[0].click();

  updateSliderDisplay(pageUniqueInput, pageUniqueDisplay)
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
/**
 * Change currency
 */
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
  animateTotalDisplay()
};

updateClasses();
currencyCheckbox.addEventListener('change', updateClasses);
