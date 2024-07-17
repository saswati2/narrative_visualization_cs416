let currentSlide = 0;
const slides = [];

// Function to create scenes
function createSlides(data) {
    slides.push(() => {
        // Slide 1: Overview of Confirmed Cases
        const svg = d3.select("#visualization").html("").append("svg")
            .attr("width", 800)
            .attr("height", 600);

        // Your D3 code for slide 1
        // Example: Bar chart for confirmed cases by state
        const x = d3.scaleBand()
            .range([0, 800])
            .padding(0.1)
            .domain(data.map(d => d.Province_State));
        const y = d3.scaleLinear()
            .range([600, 0])
            .domain([0, d3.max(data, d => +d.Confirmed)]);

        svg.append("g")
            .attr("transform", "translate(0,600)")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.Province_State))
            .attr("y", d => y(+d.Confirmed))
            .attr("width", x.bandwidth())
            .attr("height", d => 600 - y(+d.Confirmed))
            .attr("fill", "steelblue");
    });

    slides.push(() => {
        // Slide 2: Overview of Deaths
        const svg = d3.select("#visualization").html("").append("svg")
            .attr("width", 800)
            .attr("height", 600);

        // Your D3 code for slide 2
        // Example: Bar chart for deaths by state
        const x = d3.scaleBand()
            .range([0, 800])
            .padding(0.1)
            .domain(data.map(d => d.Province_State));
        const y = d3.scaleLinear()
            .range([600, 0])
            .domain([0, d3.max(data, d => +d.Deaths)]);

        svg.append("g")
            .attr("transform", "translate(0,600)")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.Province_State))
            .attr("y", d => y(+d.Deaths))
            .attr("width", x.bandwidth())
            .attr("height", d => 600 - y(+d.Deaths))
            .attr("fill", "red");
    });

    // Add more slides as needed
}

// Function to show slide
function showSlide(index) {
    if (index >= 0 && index < slides.length) {
        slides[index]();
    }
}

// Event listeners for navigation
document.getElementById("prev").addEventListener("click", () => {
    if (currentSlide > 0) {
        currentSlide--;
        showSlide(currentSlide);
    }
});

document.getElementById("next").addEventListener("click", () => {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        showSlide(currentSlide);
    }
});

// Load the data and create slides
d3.csv("merged_covid_data_proj.csv").then(data => {
    createSlides(data);
    showSlide(currentSlide);
});
