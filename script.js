// Set the dimensions of the SVG container
const width = 960;
const height = 600;

// Create the SVG element
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Define the projection and path generator for the map
const projection = d3.geoAlbersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

// Define the color scale
const colorScale = d3.scaleSequential(d3.interpolateReds)
    .domain([0, 10000000]); // Adjust domain based on your data range

// Load the US map data
d3.json("https://d3js.org/us-10m.v1.json").then(us => {
    console.log("US map data loaded:", us); // Debugging step

    const states = topojson.feature(us, us.objects.states).features;

    // Load the COVID-19 data
    d3.csv("merged_covid_data_proj.csv").then(data => {
        console.log("COVID-19 data loaded:", data); // Debugging step

        // Process the COVID-19 data
        const covidData = {};
        data.forEach(d => {
            const year = d.Date.split('-')[0];
            if (!covidData[year]) {
                covidData[year] = {};
            }
            covidData[year][d.Province_State] = +d.Confirmed;
        });

        console.log("Parsed COVID-19 data:", covidData); // Debugging step

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

    // Tooltip functions
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
}).catch(error => {
    console.error("Error loading US map data:", error);
});
