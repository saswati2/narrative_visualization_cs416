const margin = { top: 20, right: 30, bottom: 70, left: 90 },
      width = 960 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

let covidData = {};

d3.csv("data.csv").then(data => {
  data.forEach(d => {
    const year = d.Date.split('-')[0];
    if (!covidData[year]) {
      covidData[year] = [];
    }
    covidData[year].push({ state: d.Province_State, cases: +d.Confirmed });
  });

  function updateChart(year) {
    const yearData = covidData[year];

    const x = d3.scaleBand()
      .domain(yearData.map(d => d.state))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(yearData, d => d.cases)])
      .nice()
      .range([height, 0]);

    svg.selectAll(".bar").remove();
    svg.selectAll(".axis").remove();

    svg.selectAll(".bar")
      .data(yearData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.state))
      .attr("y", d => y(d.cases))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.cases))
      .attr("fill", "steelblue");

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y));

    svg.selectAll(".label").remove();

    svg.selectAll(".label")
      .data(yearData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => x(d.state) + x.bandwidth() / 2)
      .attr("y", d => y(d.cases) - 5)
      .attr("text-anchor", "middle")
      .text(d => d.cases.toLocaleString());
  }

  d3.select("#year-select").on("change", function() {
    const selectedYear = d3.select(this).property("value");
    updateChart(selectedYear);
  });

  updateChart("2020");
});
