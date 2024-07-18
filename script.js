// Set up the dimensions and margins of the graph
const margin = {top: 20, right: 30, bottom: 50, left: 70},
      width = 800 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create a tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load the data
d3.csv("covid_data.csv").then(data => {
    // Convert data to appropriate types
    data.forEach(d => {
        d.Confirmed = +d.Confirmed;
        d.year = +d.year;
    });

    // Get the unique years
    const years = Array.from(new Set(data.map(d => d.year)));

    // Create a dropdown menu for year selection
    d3.select("body").append("select")
        .attr("id", "yearSelect")
        .selectAll("option")
        .data(years)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    // Function to update the chart based on the selected year
    function updateChart(year) {
        // Filter data by the selected year
        const filteredData = data.filter(d => d.year === +year);

        // Set up scales
        const x = d3.scaleBand()
            .domain(filteredData.map(d => d.Province_State))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.Confirmed)])
            .nice()
            .range([height, 0]);

        // Clear the previous chart
        svg.selectAll("*").remove();

        // Add bars
        svg.selectAll("rect")
            .data(filteredData)
            .enter()
            .append("rect")
            .attr("x", d => x(d.Province_State))
            .attr("y", d => y(d.Confirmed))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.Confirmed))
            .attr("fill", "steelblue")
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`State: ${d.Province_State}<br>Confirmed: ${d.Confirmed}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Add x-axis
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Add y-axis
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        // Add x-axis label
        svg.append("text")
            .attr("transform", `translate(${width / 2},${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .text("State");

        // Add y-axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 10)
            .attr("x", 0 - (height / 2))
            .style("text-anchor", "middle")
            .text("Confirmed Cases");
    }

    // Initialize chart with the first year
    updateChart(years[0]);

    // Update chart when a new year is selected
    d3.select("#yearSelect").on("change", function() {
        const selectedYear = this.value;
        updateChart(selectedYear);
    });
});
