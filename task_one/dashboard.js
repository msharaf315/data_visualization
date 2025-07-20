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

const ageLabels = [
  "Less than a year old",
  "One year old",
  "Two years old",
  "Three years old",
  "Four years old",
  "Between 5 and 9 years old",
  "Between 10 and 14 years old",
  "Between 15 and 19 years old",
];

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
  initPictorialChart(data["pictorial_chart_data"]);
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

function initPictorialChart(data) {
  // define color scheme for causes
  const causes = [...new Set(data.map((d) => d.cause))];
  const colorScale = d3
    .scaleOrdinal()
    .domain(causes)
    .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]);
  const margin = { top: 10, right: 30, bottom: 30, left: 70 },
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
  // append the svg object to the body of the page
  svg = d3
    .select("#pictorialChart")
    .append("svg")
    .attr("width", 900)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add Y axis
  const yScale = d3.scaleBand().domain(ageLabels).range([height, 0]);

  // Add Y axis
  const yAxis = d3.axisLeft(yScale);

  svg
    .append("g")
    .attr("transform", `translate( ${margin.left},` + "0)")
    .call(yAxis);

  // X axis
  var xScale = d3.scaleLinear().domain([0, 10]).range([0, width]);

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},` + height + ")")
    .call(d3.axisBottom(xScale));

  // --- 5. TOOLTIP ---
  const tooltip = d3.select(".tooltip");

  const mouseover = (event, d) => {
    tooltip.style("opacity", 1);
  };
  const mousemove = (event, d) => {
    tooltip
      .html(`<b>Cause:</b> ${d.cause}<br><b>Icons:</b> ${d.icon_count}`)
      .style("left", event.pageX + 15 + "px")
      .style("top", event.pageY - 28 + "px");
  };
  const mouseleave = (event, d) => {
    tooltip.style("opacity", 0);
  };

  const svg_string = `
<g> <path id="_x36__3_" d="M173.7,171.4c-2.1,0.8-3.7,2.9-3.7,5.2l-0.2,2.3c-1,10.6-19.1,18.5-41.8,18.5s-40.8-7.9-41.8-18.5l-0.2-2.1   c-0.2-2.3-1.5-4.4-3.9-5.2c0,0,0,0-0.2,0c-4.4-1.7-9.1,1.5-8.7,6.2l1.3,19.3c0.8,10,19.3,25.6,53.4,25.6   c33.1,0,52.6-15.6,53.4-25.6l1.3-19.5C182.9,173,178.3,169.7,173.7,171.4C174,171.4,174,171.4,173.7,171.4z"/>
  <path id="_x35__3_" d="M191.2,56.4c-10.6-16.2-30.2-27-61.8-27c-0.6,0-1,0-1.3,0c-0.6,0-0.8,0-1.3,0c-31.6,0-51.2,10.8-61.8,27   c-9.4,14.6-11.6,33.3-8.7,52.8c4,26.4,4,47.2,33.7,55.7l1,10.2c0.6,5.2,13.3,12.9,35.6,12.9c0.6,0,1.3,0,1.7,0c0.6,0,1,0,1.7,0   c22.2,0,35.3-7.7,35.6-12.9l1-10.2c29.1-8.5,29.1-29.3,33.1-55.7C202.9,90,200.6,71.1,191.2,56.4z M117,125.6   c0,8.3-6.7,14.8-14.8,14.8H89.1c-5.4,0-10-4.4-10-10v-9.8c0-10,8.3-18.3,18.3-18.3h9.8c5.4,0,10,4.4,10,10v13.3   C117.2,125.6,117,125.6,117,125.6z M134.2,161.2h-12.5c-3.3,0-6-3.1-4.6-6.2l6.2-14.1c1.5-3.7,7.5-3.7,9.1,0l6.2,14.1   C140.1,158,137.8,161.2,134.2,161.2z M177.1,130.6c0,5.4-4.4,10-10,10H154c-8.3,0-14.8-6.7-14.8-14.8v-13.3c0-5.4,4.4-10,10-10h9.8   c10,0,18.3,8.3,18.3,18.3v9.8H177.1z"/>
  <path id="_x34__10_" d="M197.5,43.7c1.5,2.1,3.1,3.9,4.4,6c3.7,5.4,6.2,11.4,8.3,17.5l19.5-19.5c5.6,5.6,15.4,4.8,19.8-2.3   c2.5-3.9,2.5-9.2,0-13.1c-4.4-7.1-14.1-7.9-19.8-2.3c5.6-5.6,4.8-15.4-2.3-19.8c-3.9-2.5-9.2-2.5-13.1,0   c-7.1,4.4-7.9,14.1-2.3,19.8L197.5,43.7z"/>
  <path id="_x33__7_" d="M229.7,208.2L195,173.8c0.2,1.5,0.6,3.1,0.2,4.8l-1.3,19.5c-0.2,2.9-1,5.4-2.3,8.3l20,20   c-4.8,4.8-4.8,13.1,0,17.9c4.8,4.8,13.1,4.8,17.9,0c4.8-4.8,4.8-13.1,0-17.9c4.8,4.8,13.1,4.8,17.9,0c4.8-4.8,4.8-13.1,0-17.9   C242.4,203.2,234.5,203.2,229.7,208.2z"/>
  <path id="_x34__11_" d="M58.5,43.7c-1.5,2.1-3.1,3.9-4.4,6c-3.7,5.4-6.2,11.4-8.3,17.5L26.3,47.8c-5.6,5.6-15.4,4.8-19.8-2.3   C4,41.6,4,36.3,6.5,32.4c4.4-7.1,14.1-7.9,19.8-2.3c-5.6-5.6-4.8-15.4,2.3-19.8c3.9-2.5,9.2-2.5,13.1,0c7.1,4.4,7.9,14.1,2.3,19.8   L58.5,43.7z"/>
  <path id="_x33__8_" d="M26.3,208.2L61,173.6c-0.2,1.5-0.6,3.1-0.2,4.8l1.3,19.5c0.2,2.9,1,5.4,2.3,8.3l-20,20   c4.8,4.8,4.8,13.1,0,17.9c-4.8,4.8-13.1,4.8-17.9,0s-4.8-13.1,0-17.9c-4.8,4.8-13.1,4.8-17.9,0s-4.8-13.1,0-17.9   C13.6,203.2,21.5,203.2,26.3,208.2z"/>
</g>`;

  // --- 6. DRAWING THE ICONS (PICTORIAL CHART) ---
  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 10)`)
    .selectAll("g.icon-group") // Select a class to avoid conflicts
    .data(data)
    .enter()
    .append("g") // Append a 'g' element for each icon
    .attr("class", "icon-group") // Add a class for styling/selection
    .html(svg_string) // Insert the SVG content
    .style("cursor", "pointer")
    .attr("transform", (d) => {
      const translateX = xScale(d.x_location); // Position based on x_location, centered
      const translateY = yScale(d.category); // Position based on x_location, centered

      return `translate(${translateX}, ${translateY}) scale(0.1)`;
    })

    .attr("fill", (d) => {
      return colorScale(d.cause);
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
