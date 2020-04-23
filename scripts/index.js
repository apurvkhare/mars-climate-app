const API_KEY = "sePp6shZesL2eeG0JOnSUEOyyWmBCyKCRIdG64Bb";
const API_URL = `https://api.nasa.gov/insight_weather/?api_key=${API_KEY}&feedtype=json&ver=1.0`;

//Elements
const previousWeatherToggle = document.querySelector(".show-previous-weather");
const previousWeather = document.querySelector(".previous-weather");

const currentSol = document.querySelector("[data-current-sol]");
const currentDate = document.querySelector("[data-current-date]");
const currentTempHigh = document.querySelector("[data-current-temp-high]");
const currentTempLow = document.querySelector("[data-current-temp-low]");
const windSpeed = document.querySelector("[data-wind-speed]");
const windDirectionArrow = document.querySelector(
  "[data-wind-direction-arrow]"
);
const windDirectionText = document.querySelector("[data-wind-direction-text]");

const previousSolTemplate = document.querySelector(
  "[data-previous-sol-template]"
);
const previousSolsContainer = document.querySelector("[data-previous-sols]");

const unitToggle = document.querySelector(".unit__toggle");
const metricRadio = document.getElementById("cel");
const imperialRadio = document.getElementById("fah");

let tempUnit = " &#8451;";

const displayTemperature = (temp) => {
  let returnTemp = temp;
  if (!isMetric()) {
    returnTemp = (temp - 32) * (5 / 9);
  }
  return Math.round(returnTemp);
};

const displaySpeed = (speed) => {
  let returnSpeed = speed;
  if (!isMetric()) {
    returnSpeed = speed / 1.609;
  }
  return Math.round(returnSpeed);
};

//Function to handle the switching of "Previous days" weather display

//Function to fetch data from Insight NASA API
const getWeather = async () => {
  const result = await fetch(API_URL);
  const data = await result.json();
  const { sol_keys, validity_checks, ...solData } = data;

  return Object.entries(solData).map(([sol, data]) => {
    return {
      sol: sol,
      maxTemp: data.AT.mx,
      minTemp: data.AT.mn,
      windSpeed: data.HWS.av,
      windDirectionDegrees: data.WD.most_common.compass_degrees,
      windDirectionCardinal: data.WD.most_common.compass_point,
      date: new Date(data.First_UTC),
    };
  });
};

//Function to store relevant data from the API to an Array
const showWeatherData = async () => {
  const dataArray = await getWeather();
  selectedSolIndex = dataArray.length - 1;
  console.log(dataArray);
  displaySelectedSol(dataArray);
  displayPreviousSols(dataArray);

  const updateUnits = () => {
    const speedUnits = document.querySelectorAll("[data-speed-unit]");
    const tempUnits = document.querySelectorAll("[data-temp-unit]");
    console.log(tempUnits);

    speedUnits.forEach((unit) => {
      unit.innerText = isMetric() ? " kph" : " mph";
    });

    tempUnits.forEach((unit) => {
      unit.innerHTML = isMetric() ? " &#8451;" : " &#8457;";
      tempUnit = isMetric() ? " &#8451;" : " &#8457;";
      console.log(unit.innerHTML);
    });

    displaySelectedSol(dataArray);
    displayPreviousSols(dataArray);
  };

  updateUnits();

  previousWeatherToggle.addEventListener("click", () => {
    previousWeather.classList.toggle("show-weather");
  });

  unitToggle.addEventListener("click", () => {
    let metricUnit = !isMetric();
    metricRadio.checked = metricUnit;
    imperialRadio.checked = !metricUnit;
    updateUnits();
    displaySelectedSol(dataArray);
    displayPreviousSols(dataArray);
  });

  metricRadio.addEventListener("change", () => updateUnits());

  imperialRadio.addEventListener("change", () => updateUnits());
};

let selectedSolIndex;

const displayDate = (date) =>
  date.toLocaleDateString(undefined, { day: "numeric", month: "long" });

const displaySelectedSol = (sols) => {
  const selectedSol = sols[selectedSolIndex];
  currentSol.innerText = selectedSol.sol;
  currentDate.innerText = displayDate(selectedSol.date);
  currentTempHigh.innerText = displayTemperature(selectedSol.maxTemp);
  currentTempLow.innerText = displayTemperature(selectedSol.minTemp);
  windSpeed.innerText = displaySpeed(selectedSol.windSpeed);
  windDirectionArrow.style.setProperty(
    "--direction",
    `${selectedSol.windDirectionDegrees}deg`
  );
  windDirectionText.innerText = selectedSol.windDirectionCardinal;
};

const displayPreviousSols = (sols) => {
  previousSolsContainer.innerHTML = "";
  sols.forEach((solData, index) => {
    const solContainer = previousSolTemplate.content.cloneNode(true);
    solContainer.querySelector("[data-sol]").innerText = solData.sol;
    solContainer.querySelector("[data-date]").innerText = displayDate(
      solData.date
    );
    solContainer.querySelector(
      "[data-temp-high]"
    ).innerText = displayTemperature(solData.maxTemp);
    solContainer.querySelector(
      "[data-temp-low]"
    ).innerText = displayTemperature(solData.minTemp);
    solContainer
      .querySelectorAll("[data-temp-unit]")
      .forEach((unit) => (unit.innerHTML = tempUnit));
    solContainer
      .querySelector("[data-select-button]")
      .addEventListener("click", () => {
        selectedSolIndex = index;
        displaySelectedSol(sols);
      });
    previousSolsContainer.appendChild(solContainer);
  });
};

const isMetric = () => metricRadio.checked;
showWeatherData();
