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

  typeValue: 0,
  typeCount: 0,

  filmValue: 0,
  scriptValue: 0,
  voiceValue: 0,
  socialValue: 0,
  photoValue: 0,
  timelineValue: 0,

  timeRateValue: 0,
  timeRateCount: 1,
  timeWeekCount: 0,
  timeWeekText: '',
};

////////////////////////////////////////
// 📦 Elements & Variables
////////////////////////////////////////
// Sliders
const inputVidCount = document.querySelector(`[${calcAttribute}="input-vid-count"]`);
const displayVidCount = document.querySelector(`[${calcAttribute}="display-vid-count"]`);

const vidInputs = Array.from([inputVidCount]);

// Radios
const radioButtons = Array.from(document.querySelectorAll(`[${calcAttribute}^="radio"]`));
const radiosType = Array.from(document.querySelectorAll(
  `[${calcAttribute}="radio-type"]`));
const radiosFilm = Array.from(document.querySelectorAll(
  `[${calcAttribute}="radio-film"]`));
const radiosScript = Array.from(document.querySelectorAll(
  `[${calcAttribute}="radio-script"]`));
const radiosVoice = Array.from(document.querySelectorAll(
  `[${calcAttribute}="radio-voice"]`));
const radiosSocial = Array.from(document.querySelectorAll(
  `[${calcAttribute}="radio-social"]`));
const radiosPhoto = Array.from(document.querySelectorAll(
  `[${calcAttribute}="radio-photo"]`));
const radiosTimeline = Array.from(document.querySelectorAll(
  `[${calcAttribute}="radio-timeline"]`));

const radioGroups = {
  radiosType,
  radiosFilm,
  radiosScript,
  radiosVoice,
  radiosSocial,
  radiosPhoto,
  radiosTimeline
}

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

vidInputs.forEach(input => {
  input.addEventListener('input', () => {
    updateSliderDisplay(inputVidCount, displayVidCount)
    calculateTotal();
  });
});

function calculateRadioGroups() {
  const calcRadioGroups = [
    { name: 'Type', count: value.typeCount },
    { name: 'Film', count: 1 },
    { name: 'Script', count: value.typeCount },
    { name: 'Voice', count: value.typeCount },
    { name: 'Social', count: 1 },
    { name: 'Photo', count: 1 },
    { name: 'Timeline', count: 1 }
  ];

  calcRadioGroups.forEach((group) => {
    const selectedElement = findSelected(radioGroups[`radios${group.name}`]);

    value[`${group.name.toLowerCase()}Value`] =
      selectedElement ?
      parseFloat(selectedElement.getAttribute(valueAttribute)) * group.count :
      0;
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
  value.typeCount = parseFloat(inputVidCount.value)
  calculateRadioGroups()

  value.timeRateCount = value.timelineValue <= 1 ? 1 : 0.5;
  value.timeRateCount = value.typeValue !== 0 ? value.timeRateCount : 0;
  value.totalUsd = (value.typeValue ? value.totalBase : 0) +
    value.typeValue +
    value.filmValue +
    value.scriptValue +
    value.voiceValue +
    value.socialValue +
    value.photoValue;

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

  //   radiosType[0].click()
  radiosFilm[0].click()
  radiosScript[0].click()
  radiosVoice[0].click()
  radiosSocial[0].click()
  radiosPhoto[0].click()
  radiosTimeline[0].click()

  updateSliderDisplay(inputVidCount, displayVidCount)
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
