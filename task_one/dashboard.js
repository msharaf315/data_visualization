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

/* Minimal dashboard.js with country filter only */

let selectedCountry = null;

function init() {
  // Fetch all data to get filter options
  d3.json("http://localhost:8080/").then(function (response) {
    const data = response.line_chart_data;
    const countries = Array.from(new Set(data.map((d) => d.country))).sort();
    createFilters(countries);
    selectedCountry = countries[0];
    updateCharts();
  });
}

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

function drawLineChart(data) {
  // Set dimensions and margins
  const margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  // Remove any previous chart
  d3.select("#lineChart").selectAll("*").remove();

  // Append SVG
  const svg = d3
    .select("#lineChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X axis: year
  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => +d.year))
    .range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  // Y axis: total_death
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => +d.total_death)])
    .range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // Group data by Cause
  const causes = Array.from(new Set(data.map((d) => d.Cause)));
  const color = d3.scaleOrdinal().domain(causes).range(d3.schemeCategory10);

  causes.forEach((cause) => {
    const causeData = data.filter((d) => d.Cause === cause);
    svg
      .append("path")
      .datum(causeData)
      .attr("fill", "none")
      .attr("stroke", color(cause))
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(+d.year))
          .y((d) => y(+d.total_death))
      );
  });
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
// Only minimal code for line chart, pie chart, and interactive filters remains.
