document.addEventListener("DOMContentLoaded", function() {
  const svg = d3.select("svg"),
        margin = {top: 20, right: 20, bottom: 50, left: 50},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const parseDate = d3.timeParse("%Y-%m-%d");
  const formatTime = d3.timeFormat("%B %d, %Y");

  const x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]);

  const line = d3.line()
                 .x(d => x(d.Date))
                 .y(d => y(d.Confirmed));

  const tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

  d3.csv("detailed_covid_data.csv").then(data => {
    data.forEach(d => {
      d.Date = parseDate(d.date_1);
      d.Confirmed = +d.Confirmed;
    });

    const states = Array.from(new Set(data.map(d => d.Province_State))).sort();
    const stateSelect = document.getElementById("stateSelect");

    states.forEach(state => {
      const option = document.createElement("option");
      option.value = state;
      option.text = state;
      stateSelect.add(option);
    });

    stateSelect.addEventListener("change", updateChart);
    updateChart();

    function updateChart() {
      const selectedState = stateSelect.value || "All States";

      const filteredData = selectedState === "All States"
        ? data
        : data.filter(d => d.Province_State === selectedState);

      const nestedData = d3.groups(filteredData, d => d3.timeQuarter(d.Date));

      const quarterlyData = nestedData.map(([quarter, values]) => ({
        Date: d3.timeQuarter.offset(quarter, -1),  // Centering the quarter
        Confirmed: d3.sum(values, d => d.Confirmed)
      }));

      x.domain(d3.extent(quarterlyData, d => d.Date));
      y.domain([0, d3.max(quarterlyData, d => d.Confirmed)]);

      g.selectAll("*").remove();

      g.append("g")
       .attr("transform", `translate(0,${height})`)
       .call(d3.axisBottom(x));

      g.append("g")
       .call(d3.axisLeft(y));

      g.append("path")
       .datum(quarterlyData)
       .attr("fill", "none")
       .attr("stroke", "steelblue")
       .attr("stroke-width", 1.5)
       .attr("d", line);

      g.selectAll(".dot")
       .data(quarterlyData)
       .enter().append("circle")
       .attr("class", "dot")
       .attr("cx", d => x(d.Date))
       .attr("cy", d => y(d.Confirmed))
       .attr("r", 5)
       .on("mouseover", function(event, d) {
         tooltip.transition().duration(200).style("opacity", .9);
         tooltip.html(`Date: ${formatTime(d.Date)}<br>Confirmed: ${d.Confirmed}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
       })
       .on("mouseout", function(d) {
         tooltip.transition().duration(500).style("opacity", 0);
       });
    }
  });
});
