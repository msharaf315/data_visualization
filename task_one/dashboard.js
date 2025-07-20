/*
 * Data Visualization - Framework
 * Copyright (C) University of Passau
 *   Faculty of Computer Science and Mathematics
 *   Chair of Cognitive sensor systems
 * Maintenance:
 *   2025, Alexander Gall <alexander.gall@uni-passau.de>
 *
 * All rights reserved.
 */

// TODO: File for Part 2
// TODO: You can edit this file as you wish - add new methods, variables etc. or change/delete existing ones.

// TODO: use descriptive names for variables
let lineChart;
let columns, rows;

// Filter state variables
let selectedCountry = null;
let selectedYear = null;
let selectedCause = null;
let selectedSex = null;

async function createFilters() {
  console.log("Creating filters with predefined options...");
  
  // predefined filter options directly
  const filterOptions = {
    countries: ['Seychelles', 'Brunei Darussalam', 'Cyprus', 'Sri Lanka',
       'Syrian Arab Republic', 'Azerbaijan', 'Belarus',
       'Russian Federation', 'Turkmenistan', 'Egypt', 'South Africa',
       'Bahrain', 'Malaysia', 'Maldives', 'Qatar', 'Republic of Korea',
       'Thailand', 'Belgium', 'Estonia', 'Finland', 'Georgia', 'Latvia',
       'Lithuania', 'Montenegro', 'Republic of Moldova', 'Serbia',
       'Slovakia', 'Slovenia', 'Morocco', 'Anguilla',
       'Antigua and Barbuda', 'Argentina', 'Aruba', 'Bahamas', 'Barbados',
       'Belize', 'Bermuda', 'Bolivia', 'Brazil', 'British Virgin Islands',
       'Canada', 'Cayman Islands', 'Chile', 'Colombia', 'Costa Rica',
       'Cuba', 'Dominica', 'Dominican Republic', 'Ecuador', 'El Salvador',
       'Grenada', 'Guyana', 'Haiti', 'Jamaica', 'Mexico', 'Montserrat',
       'Netherlands Antilles', 'Nicaragua', 'Panama', 'Paraguay', 'Peru',
       'Puerto Rico', 'Saint Kitts and Nevis', 'Saint Lucia',
       'Saint Vincent and Grenadines', 'Suriname', 'Trinidad and Tobago',
       'Turks and Caicos Islands', 'United States of America',
       'Virgin Islands (USA)', 'Uruguay', 'Venezuela', 'Hong Kong SAR',
       'Israel', 'Japan', 'Kuwait', 'Philippines', 'Austria', 'Croatia',
       'Czech Republic', 'Denmark', 'France', 'Germany', 'Hungary',
       'Iceland', 'Kyrgyzstan', 'Luxembourg', 'Malta', 'Netherlands',
       'Norway', 'Poland', 'Portugal', 'Romania', 'Spain', 'Sweden',
       'Switzerland', 'United Kingdom',
       'United Kingdom, England and Wales',
       'United Kingdom, Northern Ireland', 'United Kingdom, Scotland',
       'Serbia and Montenegro, Former', 'Australia', 'Fiji', 'Kiribati',
       'New Zealand', 'Kazakhstan', 'Ukraine', 'Armenia', 'Bulgaria',
       'North Macedonia', 'Uzbekistan', 'Mauritius', 'Rodrigues',
       'Guatemala', 'Ireland', 'Italy', 'Oman', 'Cape Verde', 'Iraq',
       'Occupied Palestinian Territory', 'Saudi Arabia',
       'Bosnia and Herzegovina', 'Tunisia', 'Honduras', 'Jordan',
       'Singapore', 'Turkey', 'Libyan Arab Jamahiriya',
       'Iran (Islamic Republic of)', 'Tajikistan', 'Mongolia', 'Greece',
       'United Arab Emirates', 'Papua New Guinea',
       'Micronesia (Federated States of)', 'Solomon Islands', 'Lebanon',
       'Botswana'],
    years: [2001, 2002, 1996, 1997, 1998, 1999, 2000, 1995, 1994, 1988, 1989,
       1990, 1991, 1992, 1993, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
       2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2019, 2020, 2018,
       2021, 2022, 2023],
    causes: ['All causes', 'Certain infectious and parasitic diseases',
       'Human immunodeficiency virus [HIV] disease',
       'Diseases of the blood and blood-forming organs and certain disorders involving the immune mechanism',
       'Remainder of diseases of the blood and blood-forming organs and certain disorders involving the immune mechanism',
       'Diseases of the nervous system',
       'Remainder of diseases of the nervous system',
       'Diseases of the circulatory system', 'Other heart diseases',
       'Diseases of the respiratory system', 'Pneumonia',
       'Other acute lower respiratory infections',
       'Chronic lower respiratory diseases',
       'Diseases of the digestive system', 'Diseases of the liver',
       'Remainder of diseases of the digestive system',
       'Certain conditions originating in the perinatal period',
       'Congenital malformations, deformations and chromosomal abnormalities',
       'Symptoms, signs and abnormal clinical and laboratory findings, not elsewhere classified',
       'External causes of morbidity and mortality',
       'Transport accidents', 'Assault', 'Septicaemia',
       'Remainder of certain infectious and parasitic diseases',
       'Neoplasms', 'Malignant neoplasm of cervix uteri',
       "Non-Hodgkin's lymphoma", 'Meningitis', 'Cerebrovascular diseases',
       'Diseases of the genitourinary system',
       'Remainder of diseases of the genitourinary system',
       'Intentional self-harm', 'All other external causes',
       'Malignant neoplasm of meninges, brain and other parts of central nervous system',
       'Leukaemia', 'Remainder of malignant neoplasms',
       'Endocrine, nutritional and metabolic diseases',
       'Remainder of endocrine, nutritional and metabolic diseases',
       'Remainder of diseases of the respiratory system',
       'Gastric and duodenal ulcer',
       'Diseases of the musculoskeletal system and connective tissue',
       'Glomerular and renal tubulo-interstitial diseases', 'Falls',
       'Accidental drowning and submersion',
       'Accidental poisoning by and exposure to noxious substances',
       'Remainder of neoplasms ',
       'Diarrhoea and gastroenteritis of presumed infectious origin',
       'Other intestinal infectious diseases',
       'Malignant neoplasm of lip, oral cavity and pharynx', 'Anaemias',
       'Exposure to smoke, fire and flames', 'Meningococcal infection',
       'Other tuberculosis',
       'Malignant neoplasm of trachea, bronchus and lung',
       'Malignant melanoma of skin', 'Ischaemic heart diseases',
       'Cholera', 'Respiratory tuberculosis', 'Tetanus', 'Diphtheria',
       'Rabies',
       'Other arthropod-borne viral fevers and viral haemorrhagic fevers',
       'Measles', 'Viral hepatitis', 'Malaria',
       'Malignant neoplasm of oesophagus',
       'Malignant neoplasm of stomach',
       'Malignant neoplasm of liver and intrahepatic bile ducts',
       'Malignant neoplasm of breast',
       'Malignant neoplasm of other and unspecified parts of uterus',
       'Malignant neoplasm of ovary',
       'Multiple myeloma and malignant plasma cell neoplasms',
       'Diabetes mellitus', 'Malnutrition',
       'Mental and behavioural disorders',
       'Mental and behavioural disorders due to psychoactive substance use',
       'Remainder of mental and behavioural disorders',
       'Acute rheumatic fever and chronic rheumatic heart diseases',
       'Hypertensive diseases',
       'Remainder of diseases of the circulatory system', 'Influenza',
       'Diseases of the skin and subcutaneous tissue',
       'Pregnancy, childbirth and the puerperium',
       'Pregnancy with abortive outcome', 'Other direct obstetric deaths',
       'Infections with a predominantly sexual mode of transmission',
       'Malignant neoplasm of colon, rectum and anus',
       'Malignant neoplasm of bladder', 'Diseases of the eye and adnexa',
       'Diseases of the ear and mastoid process',
       'Malignant neoplasm of prostate', 'Indirect obstetric deaths',
       'Malignant neoplasm of pancreas',
       'Remainder of pregnancy, childbirth and the puerperium',
       'Acute poliomyelitis', 'Malignant neoplasm of larynx',
       'Atherosclerosis', 'Whooping cough', 'Yellow fever',
       'Schistosomiasis', 'Leishmaniasis', 'Trypanosomiasis', 'Other',
       "Alzheimer's disease", 'Plague'],
    sex: [1, 2, 9]
  };
  
  console.log("Using filter options:", filterOptions);

  const container = document.getElementById("filters");
  container.innerHTML = "";
  
  // Add "Clear All Filters" button
  const clearButton = document.createElement("button");
  clearButton.textContent = "Clear All Filters";
  clearButton.style.marginRight = "20px";
  clearButton.style.padding = "5px 10px";
  clearButton.onclick = async () => {
    selectedCountry = null;
    selectedYear = null;
    selectedCause = null;
    selectedSex = null;
    // Reset all dropdowns
    const countrySelect = document.getElementById("countrySelect");
    const yearSelect = document.getElementById("yearSelect");
    const causeSelect = document.getElementById("causeSelect");
    const sexSelect = document.getElementById("sexSelect");
    
    if (countrySelect) countrySelect.value = "";
    if (yearSelect) yearSelect.value = "";
    if (causeSelect) causeSelect.value = "";
    if (sexSelect) sexSelect.value = "";
    
    await updateCharts();
  };
  container.appendChild(clearButton);
  
  // Create all filter dropdowns
  container.appendChild(
    createDropdown("countrySelect", ["", ...filterOptions.countries], "Country", async (val) => {
      selectedCountry = val || null;
      await updateCharts();
    })
  );
  
  container.appendChild(
    createDropdown("yearSelect", ["", ...filterOptions.years], "Year", async (val) => {
      selectedYear = val || null;
      await updateCharts();
    })
  );
  
  container.appendChild(
    createDropdown("causeSelect", ["", ...filterOptions.causes], "Cause", async (val) => {
      selectedCause = val || null;
      await updateCharts();
    })
  );
  
  container.appendChild(
    createDropdown("sexSelect", ["", ...filterOptions.sex], "Sex", async (val) => {
      selectedSex = val || null;
      await updateCharts();
    })
  );
}

function createDropdown(id, options, label, onChange) {
  const wrapper = document.createElement("span");
  wrapper.style.marginRight = "20px";
  const lbl = document.createElement("label");
  lbl.htmlFor = id;
  lbl.innerText = label + ": ";
  wrapper.appendChild(lbl);
  const select = document.createElement("select");
  select.id = id;
  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.text = option;
    select.appendChild(opt);
  });
  select.onchange = function () {
    onChange(this.value);
  };
  wrapper.appendChild(select);
  return wrapper;
}

async function updateCharts() {
  // Clear existing charts first
  d3.select("#lineChart").selectAll("*").remove();
  d3.select("#pieChart").selectAll("*").remove();
  
  data = await getData();
  console.log("fetched data: ", data);

  initLineChart(data["line_chart_data"]);
  drawPieChart(data["pie_chart_data"]);
}

function initLineChart(data) {
  var formatTime = d3.timeFormat("%Y");
  data = data.map((item) => ({
    ...item,
    date: new Date(item.year, 0, 1), // Month is 0-indexed, so 0 = January
  }));

  // set the dimensions and margins of the graph
  const margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  lineChart = d3
    .select("#lineChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add X axis --> it is a date format
  var x = d3
    .scaleTime()
    .domain(
      d3.extent(data, function (d) {
        return d.date;
      })
    )
    .range([0, width]);

  lineChart
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function (d) {
        return +d.total_death;
      }),
    ])
    .range([height, 0]);
  lineChart.append("g").call(d3.axisLeft(y));

  // nest function allows to group the calculation per level of a factor

  // Tool tip
  var div = d3
    .select("#line-chart-container")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // svg.selectAll("dot")
  lineChart
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", 5)
    .attr("cx", function (d) {
      return x(d.date);
    })
    .attr("cy", function (d) {
      return y(d.total_death);
    })
    .attr("fill", "#ff7f0c")
    .on("mouseover", function (event, d) {
      console.log(d);

      div.transition().duration(200).style("opacity", 1);
      div
        .html(
          "year: " +
            formatTime(d.date) +
            "<br/>" +
            "Death count:" +
            d.total_death.toLocaleString()
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      div.transition().duration(500).style("opacity", 0);
    });

  // Add the line
  lineChart
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .line()
        .x(function (d) {
          return x(d.date);
        })
        .y(function (d) {
          return y(d.total_death);
        })
    );
}

function drawPieChart(data) {
  d3.select("#pieChart").selectAll("*").remove();
  const width = 400,
    height = 400,
    radius = Math.min(width, height) / 2;
  const svg = d3
    .select("#pieChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);
  const color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.Cause))
    .range(d3.schemeCategory10);
  const pie = d3.pie().value((d) => d.total_death);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  const arcs = pie(data);
  svg
    .selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.Cause))
    .on("click", async function (event, d) {
      selectedCause = d.data.Cause;
      await updateCharts();
    })
    .on("mouseover", function (event, d) {
      const percent = d.data.percentage.toFixed(2);
      d3.select("#pieTooltip")
        .style("display", "block")
        .html(
          `<b>${d.data.Cause}</b><br/>Deaths: ${d.data.total_death}<br/>Percent: ${percent}%`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      d3.select("#pieTooltip").style("display", "none");
    });
  // Add labels to pie slices
  svg
    .selectAll("text")
    .data(arcs)
    .enter()
    .append("text")
    .attr("transform", function (d) {
      return `translate(${arc.centroid(d)})`;
    })
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .text(function (d) {
      return `${d.data.Cause}: ${d.data.percentage.toFixed(1)}%`;
    });
}

async function getData() {
  // Build query parameters for filters
  const params = new URLSearchParams();
  if (selectedCountry) params.append('country', selectedCountry);
  if (selectedYear) params.append('year', selectedYear);
  if (selectedCause) params.append('cause', selectedCause);
  if (selectedSex) params.append('sex', selectedSex);
  
  const url = `http://127.0.0.1:8000/?${params.toString()}`;
  console.log("Fetching data with URL:", url);
  
  return await fetch(url)
    .then((response) => {
      return response.json(); // parse JSON data
    })
    .then((data) => {
      return data; // use the data
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

async function initDashboard() {
  console.log("init dashboard");
  await createFilters(); // Create filter dropdowns first
  await updateCharts(); // Then load initial data
}
