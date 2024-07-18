const stateURL = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';

const margin = {top: 20, right: 30, bottom: 40, left: 90},
      width = 960 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("#tooltip");

let covidData = {};

d3.csv("merged_covid_data_proj.csv").then(data => {
  data.forEach(d => {
    const year = d.Date.split('-')[0];
    if (!covidData[year]) {
      covidData[year] = {};
    }
    covidData[year][d.Province_State] = +d.Confirmed;
  });

  d3.json(stateURL).then(us => {
    const states = topojson.feature(us, us.objects.states).features;

    const projection = d3.geoAlbersUsa()
                         .translate([width / 2, height / 2])
                         .scale(1000);

    const path = d3.geoPath()
                   .projection(projection);

    const colorScale = d3.scaleThreshold()
                         .domain([1000, 10000, 50000, 100000, 500000, 1000000])
                         .range(d3.schemeReds[7]);

    function updateMap(year) {
      const yearData = covidData[year];

      svg.selectAll("path")
         .data(states)
         .join("path")
         .attr("d", path)
         .attr("class", "state")
         .attr("fill", d => {
           const stateName = d.properties.name;
           const cases = yearData[stateName] || 0;
           return colorScale(cases);
         })
         .on("mouseover", function(event, d) {
           const stateName = d.properties.name;
           const cases = yearData[stateName] || 0;
           tooltip.style("visibility", "visible")
                  .text(`${stateName}: ${cases} confirmed cases`)
                  .style("left", (event.pageX + 10) + "px")
                  .style("top", (event.pageY - 28) + "px");
         })
         .on("mouseout", function() {
           tooltip.style("visibility", "hidden");
         });
    }

    d3.select("#year-select").on("change", function() {
      const selectedYear = d3.select(this).property("value");
      updateMap(selectedYear);
    });

    updateMap("2020");
  });
});
