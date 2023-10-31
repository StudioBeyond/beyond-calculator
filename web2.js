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

  pageValueUnique: 0,
  pageValueTemplate: 0,
  pageValueTotal: 0,

  pageCountUnique: 0,
  pageCountTemplate: 0,
  pageCountTotal: 0,

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

/**
 * Ceckboxes
 */
// Checkbox Pages
const checkboxButtons = Array.from(document.querySelectorAll(`[${webcalcAttribute}^="checkbox"]`));

const checkboxesPageUnique = Array.from(document.querySelectorAll(
  `[${webcalcAttribute}="checkbox-page-unique"]`));
const checkboxesPageUnique2 = document.querySelectorAll(
  `[${webcalcAttribute}="checkbox-page-unique"]`);
console.log(checkboxesPageUnique)
console.log(checkboxesPageUnique2)
const checkboxesPageUniqueHome = checkboxesPageUnique.find(checkbox => checkbox
  .innerText === 'Home');
const checkboxPageUniqueOptions = checkboxesPageUnique.filter(checkbox => parseFloat(checkbox
  .getAttribute(valueAttribute)) !== 0);

const checkboxesPageTemplate = Array.from(document.querySelectorAll(
  `[${webcalcAttribute}="checkbox-page-template"]`));
const checkboxPageTemplateReset = checkboxesPageTemplate.find(checkbox => parseFloat(checkbox
  .getAttribute(valueAttribute)) === 0);
const checkboxPageTemplateOptions = checkboxesPageTemplate.filter(checkbox => parseFloat(checkbox
  .getAttribute(valueAttribute)) !== 0);

const checkboxesIntegration = Array.from(document.querySelectorAll(
  `[${webcalcAttribute}="checkbox-integration"]`));

const checkboxIntegrationReset = checkboxesIntegration.find(checkbox => parseFloat(checkbox
  .getAttribute(valueAttribute)) === 0);
const checkboxIntegrationOptions = checkboxesIntegration.filter(checkbox => parseFloat(checkbox
  .getAttribute(valueAttribute)) !== 0);

/**
 * Radios
 */
const radioButtons = Array.from(document.querySelectorAll(`[${webcalcAttribute}^="radio"]`));
const radiosMotion = Array.from(document.querySelectorAll(
  `[${webcalcAttribute}="radio-motion"]`));
const radiosCopy = Array.from(document.querySelectorAll(`[${webcalcAttribute}="radio-copy"]`));
const radiosSeo = Array.from(document.querySelectorAll(`[${webcalcAttribute}="radio-seo"]`));
const radiosTimeline = Array.from(document.querySelectorAll(
  `[${webcalcAttribute}="radio-timeline"]`));

/**
 * Totals
 */
const totalDisplayTextUsd = document.querySelector(
  `[${webcalcAttribute}="total-display-text-usd"]`);
const totalDisplayUsd = totalDisplayTextUsd.querySelector(`[${webcalcAttribute}="total-display"]`);
const totalDisplayTextGbp = document.querySelector(
  `[${webcalcAttribute}="total-display-text-gbp"]`);
const totalDisplayGbp = totalDisplayTextGbp.querySelector(`[${webcalcAttribute}="total-display"]`);
value.totalBase = parseFloat(totalDisplayUsd.getAttribute('by-webcalc-total-base'));

////////////////////////////////////////
// 👀 Observers
////////////////////////////////////////
/**
 * Observer functions
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

/**
 * Observe elements
 */
observeMutations(radioButtons);
observeMutations(checkboxButtons);
observeMutationCheckboxes(checkboxPageTemplateOptions, checkboxPageTemplateReset)
observeMutationCheckboxes(checkboxIntegrationOptions, checkboxIntegrationReset)

////////////////////////////////////////
// 🤖 Functions
////////////////////////////////////////
/**
 * Utility
 */
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

// Count Pages
const calculatePageTotal = () => {
  const selectedPageUnique = filterSelected(checkboxPageUniqueOptions);
  const selectedPageTemplate = filterSelected(checkboxPageTemplateOptions);
  value.pageValueUnique = selectedPageUnique ? selectedPageUnique.reduce((sum, page) => {
    return sum + parseFloat(page.getAttribute(valueAttribute));
  }, 0) : 0;
  value.pageValueTemplate = selectedPageTemplate ? selectedPageTemplate.reduce((sum, page) => {
    return sum + parseFloat(page.getAttribute(valueAttribute));
  }, 0) : 0;
  value.pageValueTotal = value.pageValueUnique + value.pageValueTemplate;

  value.pageCountUnique = selectedPageUnique ? selectedPageUnique.length : 0;
  value.pageCountTemplate = selectedPageTemplate ? selectedPageTemplate.length : 0;
  value.pageCountTotal = value.pageCountUnique + value.pageCountTemplate
}

function calculateRadioValue(selected, valueAttribute, pageCountTotal) {
  return selected ? parseFloat(selected.getAttribute(valueAttribute)) * pageCountTotal : 0;
}

const updateTotalDisplay = () => {
  totalDisplayUsd.textContent = !isNaN(value.totalUsd) ? Math.round(value.totalUsd)
    .toLocaleString('en-US') : 'NaN';
  totalDisplayGbp.textContent = !isNaN(value.totalGbp) ? Math.round(value.totalGbp)
    .toLocaleString('en-US') : 'NaN';
}

function calculateTotal() {
  // Pages Checkboxes
  calculatePageTotal();

  value.motion = calculateRadioValue(
    findSelected(radiosMotion),
    valueAttribute,
    value.pageCountTotal);
  value.copy = calculateRadioValue(
    findSelected(radiosCopy),
    valueAttribute,
    value.pageCountTotal);
  value.seo = calculateRadioValue(
    findSelected(radiosSeo),
    valueAttribute,
    value.pageCountTotal);
  value.timeline = calculateRadioValue(
    findSelected(radiosTimeline),
    valueAttribute,
    1);
  value.timelineRate = value.timeline <= 1 ? 1 : 0.5;
  value.timelineRate = value.pageCountTotal != 0 ? value.timelineRate : 0;

  const selectedIntegration = filterSelected(checkboxesIntegration);
  value.integration = selectedIntegration ? selectedIntegration.reduce((sum, integration) => {
    return sum + parseFloat(integration.getAttribute(valueAttribute));
  }, 0) : 0;

  // Total
  value.totalUsd = 0
  value.totalUsd =
    (value.pageCountTotal ?
      value.totalBase : 0) +
    value.pageValueTotal +
    value.motion +
    value.copy +
    value.seo +
    value.integration;

  updateTimelineDisplay();
  value.totalUsd *= value.timeline

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
  //   checkboxesPageUnique[0].click();
  checkboxesPageTemplate[0].click();
  radiosMotion[0].click();
  radiosCopy[0].click();
  radiosSeo[0].click();
  checkboxesIntegration[0].click();
  radiosTimeline[0].click();

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
