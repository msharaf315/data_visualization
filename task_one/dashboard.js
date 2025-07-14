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

function initLineChart() {
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

  //Read the data
  d3.csv(
    "https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv",

    // When reading the csv, I must format variables:
    function (d) {
      return { date: d3.timeParse("%Y-%m-%d")(d.date), value: d.value };
    }
  ).then(
    // Now I can use this dataset:
    function (data) {
      // Add X axis --> it is a date format
      const x = d3
        .scaleTime()
        .domain(
          d3.extent(data, function (d) {
            return d.date;
          })
        )
        .range([0, width]);
      lineChart
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

      // Add Y axis
      const y = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(data, function (d) {
            return +d.value;
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
              return x(d.date);
            })
            .y(function (d) {
              return y(d.value);
            })
        );
    }
  );
}

function __parse_data(uploaded_data) {
  d3.csv(
    "/Users/sharaf/github/data_visualization/task_two/minors_causes_of_death.csv"
  ).then(function (data) {
    // Column names (keys from the first row object)
    const columns = data.columns;

    // All rows as objects
    const rows = data;

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
  readData();
  initLineChart();
}
