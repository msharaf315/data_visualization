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

let selectedCountry = null;

async function createFilters(countries) {
  const container = document.getElementById("filters");
  container.innerHTML = "";
  container.appendChild(
    createDropdown("countrySelect", countries, "Country", async (val) => {
      selectedCountry = val;
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
  data = await getData();
  // console.log("fetched data: ");
  // console.log(data);

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
  return await fetch("http://127.0.0.1:8000/")
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
  await updateCharts();
}
