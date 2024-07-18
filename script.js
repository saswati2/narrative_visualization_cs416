// Set up the SVG canvas dimensions
const margin = {top: 30, right: 20, bottom: 70, left: 60},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

let data;  // Global variable to store data

// Load the data
d3.csv("covid_data.csv").then(loadedData => {
    // Parse the data
    data = loadedData.map(d => {
        d.Confirmed = +d.Confirmed;
        d.year = +d.year;
        return d;
    });

    // Define the years to show in the dropdown
    const years = [2020, 2021, 2022];

    // Populate the dropdown with the specified years
    const yearSelect = d3.select("#year-select");
    yearSelect.selectAll("option")
        .data(years)
        .enter().append("option")
        .attr("value", d => d)
        .text(d => d);

    // Initial chart rendering for the first year
    updateChart(years[0]);

    // Handle dropdown change
    yearSelect.on("change", function() {
        updateChart(+this.value);
    });

    function updateChart(selectedYear) {
        // Filter data for the selected year
        const filteredData = data.filter(d => d.year === selectedYear);

        // Get unique states for the x-axis
        const states = [...new Set(filteredData.map(d => d.Province_State))];

        // Create scales
        const x0 = d3.scaleBand()
            .domain(states)
            .rangeRound([0, width])
            .padding(0.1);

        const x1 = d3.scaleBand()
            .domain([selectedYear])
            .rangeRound([0, x0.bandwidth()])
            .padding(0.05);

        const y = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.Confirmed)])
            .nice()
            .rangeRound([height, 0]);

        // Clear previous chart
        svg.selectAll("*").remove();

        // Draw bars
        svg.selectAll("g")
            .data(states)
            .enter().append("g")
            .attr("transform", d => `translate(${x0(d)},0)`)
          .selectAll("rect")
          .data(d => filteredData.filter(dd => dd.Province_State === d))
          .enter().append("rect")
            .attr("x", x1(selectedYear))
            .attr("y", d => y(d.Confirmed))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.Confirmed))
            .attr("class", "bar");

        // Add X and Y axes
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x0))
          .append("text")
            .attr("x", width)
            .attr("y", margin.bottom - 10)
            .attr("text-anchor", "end")
            .attr("fill", "#000")
            .text("State");

        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y))
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left)
            .attr("dy", ".71em")
            .attr("text-anchor", "end")
            .attr("fill", "#000")
            .text("Confirmed Cases");
    }
});
