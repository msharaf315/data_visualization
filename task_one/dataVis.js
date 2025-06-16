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

// Radius scales
let r_scales =[]
let line = d3
  .line()
  .x((d) => d.x)
  .y((d) => d.y);
// scatterplot axes
let xAxis, yAxis, xAxisLabel, yAxisLabel, x, y;
// radar chart axes
let radarAxes, radarAxesAngle;
let rows_global;
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
let textColumnName = null;
// size of the plots
let margin, width, height, radius;
// svg containers
let scatter, radar, dataTable;

// Add additional variables
let selected_points = {
  "#9600EB": null,
  "#009391": null,
  "#EBB901": null,
  "#149909": null,
  "#761601": null,
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
        rows_global = rows;
        _setTextColumnName(rows);
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
  let rows = _data.rows;

  // Remove the name from the dimensions
  dimensions = _filterNumericAttributes(rows);

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
  renderRadarChart(rows);
}

function _getGridlinesCordinates(data_point) {
  let coordinates = [];
  // radius scalings for radar chart
  let gridLineScale = d3
    .scaleLinear()
    .domain([0, 10])
    .range([0, 0.66 * radius]);
  for (var i = 0; i < dimensions.length; i++) {
    let ft_name = dimensions[i];
    value = gridLineScale(data_point[ft_name]);
    coordinates.push({
      x: radarX(value, i),
      y: radarY(value, i),
    });
  }
  coordinates.push(coordinates[0]);
  return coordinates;
}

function _getPathCoordinates(data_point) {
  let coordinates = [];
  // radius scalings for radar chart

  for (var i = 0; i < dimensions.length; i++) {
    let ft_name = dimensions[i];
    value = r_scales[i](data_point[ft_name]);
    coordinate = coordinates.push({
      x: radarX(value, i),
      y: radarY(value, i),
    });
  }
  coordinates.push(coordinates[0]);
  return coordinates;
}

// clear visualizations before loading a new file
function clear() {
  scatter.selectAll("*").remove();
  radar.selectAll("*").remove();
  dataTable.selectAll("*").remove();
  d3.select("#legend_content").selectAll("*").remove();
  for (let key in selected_points) {
    selected_points[key] = null;
  }
}

function updateScatterPlot(rows) {
  // Update Y
  let y_dimension = readMenu("scatterY");
  let min_y = _get_min_value_from_data(rows, y_dimension);
  let max_y = _get_max_value_from_data(rows, y_dimension);

  // Update y-scale
  y.domain([min_y, max_y]);

  // Animate y-axis
  yAxis.transition().duration(1000).call(d3.axisLeft(y));

  // Update y-axis label
  yAxisLabel.text(y_dimension);

  //* update X
  let x_dimension = readMenu("scatterX");
  let min_x = _get_min_value_from_data(rows, x_dimension);
  let max_x = _get_max_value_from_data(rows, x_dimension);

  // Update x-scale
  x.domain([min_x, max_x]);

  // Animate x-axis
  xAxis.transition().duration(1000).call(d3.axisBottom(x));

  // Update x-axis label
  xAxisLabel.text(x_dimension);

  // * Update Size
  let size_dim = readMenu("size");
  let min_size = _get_min_value_from_data(rows, size_dim);
  let max_size = _get_max_value_from_data(rows, size_dim);

  // Animate circles
  scatter
    .selectAll("circle")
    .data(rows)
    .transition()
    .duration(1000)
    .attr("cy", (d) => y(d[y_dimension]))
    .attr("cx", (d) => x(d[x_dimension]))
    .attr("r", function (d) {
      // Normalize size from 0.05 -> 1.05
      let radius_percent =
        (d[size_dim] - min_size) / (max_size - min_size) + 0.05;
      return radius_percent * (width / 45);
    });
}

function renderScatterplot(columns, rows) {
  // clear scatter before rendering new plot

  scatter.selectAll("*").remove();

  // X axis
  let x_dimension = readMenu("scatterX");
  let min_x = _get_min_value_from_data(rows, x_dimension);
  let max_x = _get_max_value_from_data(rows, x_dimension);

  x = d3
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

  y = d3
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
    .style("cursor", "pointer")
    .style("fill", function (d) {
      for (let key in selected_points) {
        let value = selected_points[key];
        if (_.isEqual(value, d)) {
          return key;
        }
      }
      return "#000000";
    })
    .style("opacity", "0.6")
    .on("click", function (event, d) {
      // Loop over all prev selected values
      for (let key in selected_points) {
        let value = selected_points[key];
        // if value was already selected remove it & return
        if (_.isEqual(value, d)) {
          selected_points[key] = null;
          d3.select(this).transition().duration(250).style("fill", "#000000");
          render_legend();
          return;
        }
      }
      // add value to dict if it did was not previously selected & return
      for (let key in selected_points) {
        let value = selected_points[key];
        if (!value) {
          selected_points[key] = d;
          d3.select(this).transition().duration(250).style("fill", key);
          render_legend();
          return;
        }
      }
    });
}

function render_legend() {
  const colors = Object.keys(selected_points);
  // create a list of keys
  let keys = colors
    .map((color) => selected_points[color])
    .filter((i) => i != null)
    .map((selectedPoint) => selectedPoint[textColumnName]);

  var Svg = d3.select("#legend_content");
  Svg.selectAll("*").remove();

  // Add one dot in the legend for each name.
  Svg.selectAll("mydots")
    .data(keys)
    .enter()
    .append("circle")
    .attr("cx", 100)
    .attr("cy", function (d, i) {
      return 20 + i * 25;
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", function (d) {
      for (let key in selected_points) {
        let value = selected_points[key];
        if (value && value[textColumnName] == d) {
          return key;
        }
      }
      return "#000000";
    })
    .attr("opacity", "0.6");

  // Add one dot in the legend for each name.
  Svg.selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", 120)
    .attr("y", function (d, i) {
      return 20 + i * 25;
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", "black")
    .text(function (d) {
      return d;
    })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");

  Svg.selectAll(".legend-button")
    .data(keys)
    .enter()
    .append("g")
    .attr("class", ".legend-button")
    .attr("transform", (d, i) => `translate(${600 - 30}, ${10 + i * 25})`)
    .on("click", function (event, d) {
      // Loop over all prev selected values
      for (let key in selected_points) {
        let value = selected_points[key];
        // if value was already selected remove it & return
        if (value && value[textColumnName] == d) {
          selected_points[key] = null;
          renderScatterplot(null, rows_global);
          render_legend();
          return;
        }
      }
    })
    .each(function (d, i) {
      const g = d3.select(this);

      // Draw the button rectangle
      // Draw white rectangle with black border
      g.append("rect")
        .attr("width", 19)
        .attr("height", 15)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("rx", 5)
        .attr("ry", 5)
        .style("cursor", "pointer");

      // Add red 'X' in top-right corner of the rectangle
      g.append("text")
        .attr("x", 8)
        .attr("y", 12)
        .text("×") // Unicode multiplication sign
        .style("fill", "red")
        .style("font-weight", "bold")
        .style("font-size", "14px")
        .style("cursor", "pointer");
    });
  renderRadarChart(rows_global);
}
// Helper function to define the domain for the axis
function _get_min_value_from_data(rows, dimension) {
  return Math.min(...rows.map((row) => row[dimension]));
}

function _get_max_value_from_data(rows, dimension) {
  return Math.max(...rows.map((row) => row[dimension]));
}

function renderRadarChart(rows) {
  radar.selectAll("*").remove();

  // radar chart axes
  radarAxesAngle = (Math.PI * 2) / dimensions.length;
  let axisRadius = d3.scaleLinear().range([0, radius]);
  let maxAxisRadius = 0.75,
    textRadius = 0.8;
  gridRadius = 0.1;

  // radar axes
  r_scales = dimensions.map((dimension) =>
    d3
      .scaleLinear()
      .domain([
        _get_min_value_from_data(rows, dimension),
        _get_max_value_from_data(rows, dimension),
      ])
      .range([0, maxAxisRadius * radius])
  );
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

  let ticks = [2, 4, 6, 8, 10];
  ticks = ticks.map((t) => {
    tObject = {};
    for (let dimension of dimensions) {
      tObject[dimension] = t;
    }
    return tObject;
  });
  radar
    .selectAll("gridLines")
    .data(ticks)
    .join((enter) =>
      enter
        .append("path")
        .datum((d) => _getGridlinesCordinates(d))
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "gray")
    );

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
    .text((d) => d);

  // selected points plotting
  const colors = Object.keys(selected_points);
  // create a list of keys
  let keys = colors
    .map((color) => selected_points[color])
    .filter((i) => i != null);
  // Plot path
  radar
    .selectAll("radarLines")
    .data(keys)
    .enter()
    .append("path")
    .style("stroke", function (d) {
      for (let key in selected_points) {
        let value = selected_points[key];
        if (_.isEqual(value, d)) {
          return key;
        }
      }
      return "#000000";
    })
    .style("fill", "none")
    .style("stroke-width", "7")
    .style("opacity", "0.6")

    .datum((d) => _getPathCoordinates(d))
    .attr("d", line);

  // Plot points
  radar
    .selectAll(".radar-point-group")
    .data(keys)
    .enter()
    .append("g")
    .attr("class", "radar-point-group")
    .attr("fill", function (d) {
      for (let key in selected_points) {
        let value = selected_points[key];
        if (_.isEqual(value, d)) {
          return key;
        }
      }
      return "#000000";
    })
    .each(function (d) {
      const coordinates = _getPathCoordinates(d); // get points for this line

      // Append a circle for each coordinate
      d3.select(this)
        .selectAll("circle")
        .data(coordinates)
        .enter()
        .append("circle")
        .attr("cx", (c) => c.x)
        .attr("cy", (c) => c.y)
        .attr("r", 4)
        .attr("stroke", function () {
          for (let key in selected_points) {
            if (_.isEqual(selected_points[key], d)) return key;
          }
          return "#000";
        })
        .attr("stroke-width", 2);
    });

  radar
    .selectAll(".radar-point-group")
    .data(keys)
    .enter()
    .append("g")
    .attr("class", "radar-point-group")
    .each(function (d) {
      const coordinates = _getPathCoordinates(d); // get points for this line

      // Append a circle for each coordinate
      d3.select(this)
        .selectAll("circle")
        .data(coordinates)
        .enter()
        .append("circle")
        .attr("cx", (c) => c.x)
        .attr("cy", (c) => c.y)
        .attr("r", 4)
        .attr("fill", "red")
        .attr("stroke", function () {
          for (let key in selected_points) {
            if (_.isEqual(selected_points[key], d)) return key;
          }
          return "#000";
        })
        .attr("stroke-width", 2);
    });
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
      updateScatterPlot(rows);
      // renderScatterplot(dimensions, rows, true);
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

function _setTextColumnName(rows) {
  for (let row of rows) {
    for (let key in row) {
      let value = row[key];
      if (!Number(value)) {
        textColumnName = key;
        return;
      }
    }
  }
}

function _filterNumericAttributes(rows) {
  let numericAttributes = [];
  for (let key in rows[0]) {
    let value = rows[0][key];
    if (Number(value)) {
      numericAttributes.push(key);
    }
  }

  return numericAttributes;
}
