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

function initLineChart(data) {
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
          return d.year;
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
  data = await getData();
  console.log(data);

  initLineChart(data["line_chart_data"]);
}
