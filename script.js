const width = 960;
const height = 600;

const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoAlbersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

const colorScale = d3.scaleSequential(d3.interpolateReds)
    .domain([0, 10000000]); // Adjust the domain based on your data range

// Load the US map data
d3.json("https://d3js.org/us-10m.v1.json").then(us => {
    const states = topojson.feature(us, us.objects.states).features;

    // Load the COVID-19 data
    d3.csv("data.csv").then(data => {
        const covidData = {};
        data.forEach(d => {
            const year = d.Date.split('-')[0];
            if (!covidData[year]) {
                covidData[year] = {};
            }
            covidData[year][d.Province_State] = +d.Confirmed;
        });

        // Function to update the map based on the selected year
        function updateMap(year) {
            svg.selectAll("path").remove();

            svg.append("g")
                .selectAll("path")
                .data(states)
                .enter().append("path")
                .attr("d", path)
                .attr("fill", d => {
                    const stateName = d.properties.name;
                    const cases = covidData[year][stateName] || 0;
                    return colorScale(cases);
                })
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5)
                .on("mouseover", function(event, d) {
                    const stateName = d.properties.name;
                    const cases = covidData[year][stateName] || 0;
                    d3.select(this)
                        .attr("stroke", "black")
                        .attr("stroke-width", 3);
                    showTooltip(event, `${stateName}: ${cases} cases`);
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 1.5);
                    hideTooltip();
                });
        }

        // Initial map update
        updateMap("2020");

        // Event listener for the dropdown
        d3.select("#year-select").on("change", function() {
            const selectedYear = d3.select(this).property("value");
            updateMap(selectedYear);
        });
    });

    function showTooltip(event, text) {
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px")
            .text(text);
    }

    function hideTooltip() {
        d3.select(".tooltip").remove();
    }
});
