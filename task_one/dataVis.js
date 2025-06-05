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

// scatterplot axes
let xAxis, yAxis, xAxisLabel, yAxisLabel;
// radar chart axes
let radarAxes, radarAxesAngle;

let dimensions = [
  "dimension 1",
  "dimension 2",
  "dimension 3",
  "dimension 4",
  "dimension 5",
  "dimension 6",
];
//*HINT: the first dimension is often a label; you can simply remove the first dimension with
// dimensions.splice(0, 1);

// the visual channels we can use for the scatterplot
let channels = ["scatterX", "scatterY", "size"];

// size of the plots
let margin, width, height, radius;
// svg containers
let scatter, radar, dataTable;

// Add additional variables
let selected_points = {
  "#2EE875": null,
  "#A6443F": null,
  "#E5271D": null,
  "#388F59": null,
  "#664240": null,
};

function init() {
  // define size of plots
  margin = { top: 20, right: 20, bottom: 20, left: 50 };
  width = 600;
  height = 500;
  radius = width / 2;

  // Start at default tab
  document.getElementById("defaultOpen").click();
  // data table initialization
  dataTable = d3.select("#dataTable");

  // scatterplot SVG container and axes
  scatter = d3
    .select("#sp")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");

  // radar chart SVG container and axes
  radar = d3
    .select("#radar")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // read and parse input file
  let fileInput = document.getElementById("upload"),
    readFile = function () {
      // clear existing visualizations
      clear();

      let reader = new FileReader();
      reader.onloadend = function () {
        uploaded_data = reader.result;
        let { columns, rows } = __parse_data(uploaded_data);
        __create_table(columns, rows);
        initVis({ columns, rows });

        // TODO: possible place to call the dashboard file for Part 2
        initDashboard(null);
      };
      reader.readAsBinaryString(fileInput.files[0]);
    };
  fileInput.addEventListener("change", readFile);
}

function __parse_data(uploaded_data) {
  parsed_data = d3.csvParse(uploaded_data, d3.autoType);
  columns = parsed_data.columns;
  data = parsed_data.slice(0, -1);
  return { columns: columns, rows: parsed_data };
}

function __create_table(columns, parsed_data) {
  dataTable.append("table").style("class", "dataTableClass");
  dataTable
    .append("thead")
    .append("tr")
    .selectAll("th")
    .data(columns)
    .enter()
    .append("th")
    .text((d) => d)
    .attr("class", "tableHeaderClass");

  // Append tbody
  dataTable
    .append("tbody")
    .selectAll("tr")
    .data(parsed_data)
    .enter()
    .append("tr")
    .selectAll("td")
    .data((row) => columns.map((col) => row[col]))
    .enter()
    .append("td")
    .text((d) => d)
    .attr("class", "tableBodyClass");
}

function initVis(_data) {
  // TODO: parse dimensions (i.e., attributes) from input file
  let columns = _data.columns;
  let rows = _data.rows;

  // Remove the name from the dimensions
  dimensions = columns.splice(1);
  // y scalings for scatterplot
  // TODO: set y domain for each dimension

  // radar chart axes
  radarAxesAngle = (Math.PI * 2) / dimensions.length;
  let axisRadius = d3.scaleLinear().range([0, radius]);
  let maxAxisRadius = 0.75,
    textRadius = 0.8;
  gridRadius = 0.1;

  // radar axes

  // radius scalings for radar chart
  // TODO: set radius domain for each dimension
  let r = d3.scaleLinear().range([0, radius]);

  radarAxes = radar
    .selectAll(".axis")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "axis");

  radarAxes
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", function (d, i) {
      return radarX(axisRadius(maxAxisRadius), i);
    })
    .attr("y2", function (d, i) {
      return radarY(axisRadius(maxAxisRadius), i);
    })
    .attr("class", "line")
    .style("stroke", "black");

  // TODO: render grid lines in gray

  // TODO: render correct axes labels
  radar
    .selectAll(".axisLabel")
    .data(dimensions)
    .enter()
    .append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr("x", function (d, i) {
      return radarX(axisRadius(textRadius), i);
    })
    .attr("y", function (d, i) {
      return radarY(axisRadius(textRadius), i);
    })
    .text("dimension");

  // init menu for the visual channels
  channels.forEach(function (c) {
    initMenu(c, dimensions, rows);
  });

  // refresh all select menus
  channels.forEach(function (c) {
    refreshMenu(c);
  });
  // Use dimensions not columns here to remove the name column
  renderScatterplot(dimensions, rows);
  renderRadarChart();
}

// clear visualizations before loading a new file
function clear() {
  scatter.selectAll("*").remove();
  radar.selectAll("*").remove();
  dataTable.selectAll("*").remove();
  for (let key in selected_points) {
    selected_points[key] = null;
  }
}

function renderScatterplot(columns, rows) {
  console.log(`Rendering scatter plot"`);
  // clear scatter before rendering new plot
  scatter.selectAll("*").remove();

  // X axis
  let x_dimension = readMenu("scatterX");
  let min_x = _get_min_value_from_data(rows, x_dimension);
  let max_x = _get_max_value_from_data(rows, x_dimension);

  let x = d3
    .scaleLinear()
    .domain([min_x, max_x])
    .range([margin.left, width - margin.left - margin.right]);

  xAxis = scatter
    .append("g")
    .attr("class", "axis")
    .attr(
      "transform",
      "translate(0, " + (height - margin.bottom - margin.top) + ")"
    )
    .call(d3.axisBottom(x));

  xAxisLabel = xAxis
    .append("text")
    .style("text-anchor", "middle")
    .attr("x", width - margin.right)
    .text(x_dimension);

  // Y axis
  let y_dimension = readMenu("scatterY");
  let min_y = _get_min_value_from_data(rows, y_dimension);
  let max_y = _get_max_value_from_data(rows, y_dimension);

  let y = d3
    .scaleLinear()
    .domain([min_y, max_y])
    .range([height - margin.bottom - margin.top, margin.top]);

  yAxis = scatter
    .append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + margin.left + ")")
    .call(d3.axisLeft(y));

  yAxisLabel = yAxis
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", margin.top / 2)
    .text(y_dimension);

  // Print the dots
  let size_dim = readMenu("size");
  let min_size = _get_min_value_from_data(rows, size_dim);
  let max_size = _get_max_value_from_data(rows, size_dim);
  scatter
    .append("g")
    .selectAll("dot")
    .data(rows)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return x(d[x_dimension]);
    })
    .attr("cy", function (d) {
      return y(d[y_dimension]);
    })
    .attr("r", function (d) {
      // Normalize size from 0.05 -> 1.05
      let radius_percent =
        (d[size_dim] - min_size) / (max_size - min_size) + 0.05;
      return radius_percent * (width / 45);
    })
    .style("fill", "#000000")
    .style("opacity", "0.6")
    .on("click", function (event, d) {
      // Loop over all prev selected values
      for (let key in selected_points) {
        let value = selected_points[key];
        // if value was already selected remove it & return
        if (_.isEqual(value, d)) {
          selected_points[key] = null;
          d3.select(this).style("fill", "#000000");
          // console.log("item clicked, removing from selected items", d);
          // console.log("selected points: ", selected_points);

          return;
        }
      }
      // add value to dict if it did was not previously selected & return
      for (let key in selected_points) {
        let value = selected_points[key];
        if (!value) {
          selected_points[key] = d;
          console.log(key);
          d3.select(this).style("fill", key);
          // console.log("item clicked, adding to selected items", d);
          // console.log("selected points: ", selected_points);
          return;
        }
      }
    });
}
// Helper function to define the domain for the axis
function _get_min_value_from_data(rows, dimension) {
  return Math.min(...rows.map((row) => row[dimension]));
}

function _get_max_value_from_data(rows, dimension) {
  return Math.max(...rows.map((row) => row[dimension]));
}

function renderRadarChart() {
  // TODO: show selected items in legend
  // TODO: render polylines in a unique color
}

function radarX(radius, index) {
  return radius * Math.cos(radarAngle(index));
}

function radarY(radius, index) {
  return radius * Math.sin(radarAngle(index));
}

function radarAngle(index) {
  return radarAxesAngle * index - Math.PI / 2;
}

// init scatterplot select menu
function initMenu(id, dimensions, rows) {
  $("select#" + id).empty();

  dimensions.forEach(function (d) {
    $("select#" + id).append("<option>" + d + "</option>");
  });

  $("#" + id).selectmenu({
    select: function () {
      renderScatterplot(dimensions, rows);
    },
  });
}

// refresh menu after reloading data
function refreshMenu(id) {
  $("#" + id).selectmenu("refresh");
}

// read current scatterplot parameters
function readMenu(id) {
  return $("#" + id).val();
}

// switches and displays the tabs
function openPage(pageName, elmnt, color) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }
  document.getElementById(pageName).style.display = "block";
  elmnt.style.backgroundColor = color;
}
