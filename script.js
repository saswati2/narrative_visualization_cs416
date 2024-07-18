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

d3.csv("merged_covid_data_proj.csv").then(data => {
    const covidData = {};
    data.forEach(d => {
        covidData[d.Province_State] = +d.Confirmed;
    });

    d3.json("https://d3js.org/us-10m.v1.json").then(us => {
        svg.append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", d => {
                const stateName = d.properties.name;
                const cases = covidData[stateName] || 0;
                return colorScale(cases);
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .on("mouseover", function(event, d) {
                const stateName = d.properties.name;
                const cases = covidData[stateName] || 0;
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
    });

    function showTooltip(event, text) {
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "10px")
            .style("pointer-events", "none")
            .text(text);

        tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    function hideTooltip() {
        d3.select(".tooltip").remove();
    }
});
