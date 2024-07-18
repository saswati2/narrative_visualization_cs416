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

// Load the data
d3.csv("covid_data.csv").then(data => {
    // Parse the data
    data.forEach(d => {
        d.Confirmed = +d.Confirmed;
        d.year = +d.year;
    });

    // Create a list of unique states and years
    const states = [...new Set(data.map(d => d.Province_State))];
    const years = [...new Set(data.map(d => d.year))];

    // Set up scales
    const x0 = d3.scaleBand()
        .domain(states)
        .rangeRound([0, width])
        .padding(0.1);

    const x1 = d3.scaleBand()
        .domain(years)
        .rangeRound([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Confirmed)])
        .nice()
        .rangeRound([height, 0]);

    // Create axes
    svg.append("g")
        .selectAll("g")
        .data(states)
        .enter().append("g")
        .attr("transform", d => `translate(${x0(d)},0)`)
      .selectAll("rect")
      .data(d => years.map(y => ({year: y, data: data.find(dd => dd.Province_State === d && dd.year === y)})))
      .enter().append("rect")
        .attr("x", d => x1(d.year))
        .attr("y", d => y(d.data ? d.data.Confirmed : 0))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.data ? d.data.Confirmed : 0))
        .attr("class", "bar");

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
});
