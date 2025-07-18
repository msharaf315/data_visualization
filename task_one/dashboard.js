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
let filters = {};

let selectedCountry = null;

function createFilters(countries) {
  const container = document.getElementById("filters");
  container.innerHTML = "";
  container.appendChild(createDropdown("countrySelect", countries, "Country", val => { selectedCountry = val; updateCharts(); }));
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
  options.forEach(option => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.text = option;
    select.appendChild(opt);
  });
  select.onchange = function() { onChange(this.value); };
  wrapper.appendChild(select);
  return wrapper;
}

function updateCharts() {
  fetchLineChart();
  fetchPieChart();
}

function fetchLineChart() {
  let url = `http://localhost:8080/?country=${encodeURIComponent(selectedCountry)}`;
  d3.json(url).then(function(response) {
    drawLineChart(response.line_chart_data);
  });
}

function fetchPieChart() {
  let url = `http://localhost:8080/pie?country=${encodeURIComponent(selectedCountry)}`;
  d3.json(url).then(function(response) {
    drawPieChart(response.pie_chart_data);
  });
}


function initLineChart(data) {
  console.log("one item");

  console.log(typeof data[0]["year"]);

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
        return +d.year;
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
          return x(d.year);
        })
        .y(function (d) {
          return y(d.total_death);
        })
    );
}


function drawPieChart(data) {
  d3.select("#pieChart").selectAll("*").remove();
  const width = 400, height = 400, radius = Math.min(width, height) / 2;
  const svg = d3.select("#pieChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);
  const color = d3.scaleOrdinal().domain(data.map(d => d.Cause)).range(d3.schemeCategory10);
  const pie = d3.pie().value(d => d.total_death);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  const arcs = pie(data);
  svg.selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.Cause))
    .on("click", function(event, d) {
      selectedCause = d.data.Cause;
      updateCharts();
    })
    .on("mouseover", function(event, d) {
      const percent = d.data.percentage.toFixed(2);
      d3.select("#pieTooltip")
        .style("display", "block")
        .html(`<b>${d.data.Cause}</b><br/>Deaths: ${d.data.total_death}<br/>Percent: ${percent}%`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
      d3.select("#pieTooltip").style("display", "none");
    });
  // Add labels to pie slices
  svg.selectAll("text")
    .data(arcs)
    .enter()
    .append("text")
    .attr("transform", function(d) { return `translate(${arc.centroid(d)})`; })
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "#333")
    .text(function(d) { return `${d.data.Cause}: ${d.data.percentage.toFixed(1)}%`; });
}


function __parse_data(uploaded_data) {
  d3.csv("minors_causes_of_death.csv").then(function (data) {
    // Column names (keys from the first row object)
    const columns = data.columns;

    // All rows as objects
    const rows = data;
    console.log("Data read");

    console.log("Columns:", columns);
    console.log("Rows:", rows);
  });
}

function readData() {
  readFile = function () {
    // clear existing visualizations
    clear();

    let reader = new FileReader();
    reader.onloadend = function () {
      uploaded_data = reader.result;
      let { columns, rows } = __parse_data(uploaded_data);
      rows_global = rows;
      _setTextColumnName(rows);
      __create_table(columns, rows);
      initVis({ columns, rows });

      // TODO: possible place to call the dashboard file for Part 2
      initDashboard(null);
    };
    reader.readAsBinaryString(fileInput.files[0]);
  };
}

function initDashboard() {
  console.log("init dashboard");
  __parse_data();
  initLineChart();
}
