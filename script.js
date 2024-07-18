// Set the dimensions and margins of the graph
const margin = {top: 20, right: 30, bottom: 40, left: 90},
      width = 960 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load the data
d3.csv("merged_covid_data_proj.csv").then(data => {
  console.log("COVID-19 data loaded:", data); // Debugging step

  // Process the COVID-19 data
  const covidData = {};
  data.forEach(d => {
    const year = d.Date.split('-')[0];
    if (!covidData[year]) {
      covidData[year] = {};
    }
    if (!covidData[year][d.Province_State]) {
      covidData[year][d.Province_State] = 0;
    }
    covidData[year][d.Province_State] += +d.Confirmed;
  });

  console.log("Parsed COVID-19 data:", covidData); // Debugging step

  // Function to update the bar chart based on the selected year
  function updateChart(year) {
    const yearData = covidData[year];

    // Convert the data into an array format suitable for D3
    const stateData = Object.entries(yearData).map(([state, cases]) => ({state, cases}));

    // Sort the data by cases
    stateData.sort((a, b) => d3.descending(a.cases, b.cases));

    // X axis
    const x = d3.scaleLinear()
      .domain([0, d3.max(stateData, d => d.cases)])
      .range([0, width]);

    svg.selectAll(".x-axis").remove();
    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Y axis
    const y = d3.scaleBand()
      .range([0, height])
      .domain(stateData.map(d => d.state))
      .padding(0.1);

    svg.selectAll(".y-axis").remove();
    svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y));

    // Bars
    const bars = svg.selectAll("rect")
      .data(stateData);

    bars.enter()
      .append("rect")
      .merge(bars)
      .transition()
      .duration(1000)
      .attr("x", x(0))
      .attr("y", d => y(d.state))
      .attr("width", d => x(d.cases))
      .attr("height", y.bandwidth())
      .attr("fill", "#69b3a2");

    bars.exit().remove();

    // Annotate the total number of cases
    const totalCases = stateData.reduce((acc, d) => acc + d.cases, 0);
    d3.select("#total-cases")
      .text(`Total confirmed cases in ${year}: ${totalCases}`);
  }

  // Initial chart update
  updateChart("2020");

  // Event listener for the dropdown
  d3.select("#year-select").on("change", function() {
    const selectedYear = d3.select(this).property("value");
    updateChart(selectedYear);
  });
}).catch(error => {
  console.error("Error loading COVID-19 data:", error);
});
