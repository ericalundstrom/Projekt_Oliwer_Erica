async function fetching() {
    const data = await d3.json("dataset/healthy_lifestyle_city_2021.json");
    return data;
}

async function CreateButtons() {
    let keys = [];
    let bigDataset = await fetching();

    let firstData = bigDataset[0];

    for (const key in firstData) {
        if (key === "City" || key === "flag" || key === "Rank") {
        } else {
            keys.push(key);
        }
    }
    let ButtonWrapper = document.createElement("div");
    ButtonWrapper.classList.add("ButtonBox");
    document.querySelector("#wrapper").append(ButtonWrapper);
    keys.forEach((d) => {
        let ButtonDom = document.createElement("button");
        ButtonDom.classList.add("button");
        let text = d.replace(/_/g, " ");
        ButtonDom.textContent = text;
        ButtonWrapper.append(ButtonDom);
        ButtonDom.addEventListener("click", (e) => {
            filterDataViz(e, d);
        });
    });
}

function isSvgEmpty() {
    let svg = document.querySelector("svg");
    if (svg) {

        return false
    } else {
        createSvg()
        return true
    }
}

async function filterDataViz(e, key) {
    if (isSvgEmpty()) {
        CreateBubbles(key, true);
    } else {
        CreateBubbles(key, false);
    }
}


let wSvg = 1200;
let hSvg = 800;

let hViz = 0.9 * hSvg;
let wViz = 0.9 * wSvg;
let wPadding = (wSvg - wViz) / 2;
let hPadding = (hSvg - hViz) / 2;
let margin = 1;

let gViz;
let view;

function createSvg() {

    let svg = d3
        .select("#wrapper")
        .append("svg")
        .attr("height", hSvg)
        .attr("width", wSvg);

}

async function CreateBubbles(key, value) {

    const bigDataset = await fetching();

    let svg = d3.select("svg");

    let chosenData = bigDataset.map(d => ({
        city: d.City,
        filter: d[key],
        filterName: key,
        Rank: d.Rank,
        Sunshine_hours: d.Sunshine_hours,
        bottle_water_cost: d.bottle_water_cost,
        Obesity: d.Obesity,
        Life_expectancy: d.Life_expectancy,
        Pollution: d.Pollution,
        hours_worked: d.hours_worked,
        Happiness: d.Happiness,
        Outdoor_activities: d.Outdoor_activities,
        take_out_places: d.take_out_places,
        gym_cost: d.gym_cost,
        flag: d.flag
    }));


    // Sort the chosenData array based on the filter value
    let sortedData = chosenData.sort((a, b) => a.filter - b.filter);

    let maxValue = Math.max(...chosenData.map(d => d.filter));
    let minValue = Math.min(...chosenData.map(d => d.filter));

    // maxValue * 1.2
    let xScale = d3.scaleLinear()
        .domain([0, sortedData.length - 1])
        .range([0, wViz]);



    let radiusScale = d3.scaleLinear()
        .domain([0, sortedData.length - 1]) // Define the domain based on the number of elements
        .range([4, 40]); // Adjust the range of radius values as needed

    if (value) {


        let gViz = svg.selectAll("circle")
            .data(sortedData)
            .enter()
            .append("g")  // Create a group for each circle and foreignObject
            .attr("transform", (d, i) => `translate(${xScale(i) + wPadding},${hSvg / 2})`) // Position each group
            .on("click", (event, d) => zoom(event, d, radiusScale));


        gViz.append("circle")
            .attr("r", (d, i) => radiusScale(i)) // Assign the radius based on the index
            .attr("cx", 0) // Position circles at the center of their respective group
            .attr("cy", 0);

        gViz.append("foreignObject")
            .attr("width", (d, i) => radiusScale(i) * 2) // Set the width based on the radius of the circle
            .attr("height", (d, i) => radiusScale(i) * 2) // Set the height based on the radius of the circle
            .attr("x", (d, i) => -radiusScale(i)) // Adjust x-position to center the foreignObject
            .attr("y", (d, i) => -radiusScale(i))// Offset y-position to center the foreignObject
            .html(
                (d) =>
                    `        <div class="flag-image" style="background-image: url(${d.flag})">
                    <div id="info" style="opacity: 0">
                       <p id="title"> ${d.city} </p>
                        <div class="infodivs" id="Rank"> 
                            <p class="key">Rank: </p> 
                            <p id="value">${d.Rank} </p>
                        </div>
                        <div class="infodivs" id="Sunshine_hours"> 
                            <p class="key"> Sunshine hours: </p> 
                            <p id="value">${d.Sunshine_hours} </p>
                        </div>
                        <div class="infodivs" id="bottle_water_cost"> 
                            <p class="key"> Bottle water cost: </p> 
                            <p id="value">${d.bottle_water_cost} </p>
                        </div>
                        <div class="infodivs" id="Obesity"> 
                            <p class="Obesity"> Obesity: </p> 
                            <p id="value">${d.Obesity} </p>
                        </div>
                        <div class="infodivs" id="Life_expectancy"> 
                            <p class="key"> Life expectancy: </p> 
                            <p id="value">${d.Life_expectancy} </p>
                        </div>
                        <div  class="infodivs" id="Pollution"> 
                            <p class="key"> Pollution: </p> 
                            <p id="value">${d.Pollution} </p>
                        </div>
                        <div  class="infodivs" id="hours_worked"> 
                            <p class="key"> Hours worked: </p> 
                            <p id="value">${d.hours_worked} </p>
                        </div>
                        <div  class="infodivs"id="raHappinessnk"> 
                            <p class="key"> Happiness: </p> 
                            <p id="value">${d.Happiness} </p>
                        </div>
                        <div class="infodivs" id="Outdoor_activities"> 
                            <p class="key"> Outdoor activities: </p> 
                            <p id="value">${d.Outdoor_activities} </p>
                        </div>
                        <div class="infodivs" id="take_out_places"> 
                            <p class="key"> Take out places: </p> 
                            <p id="value">${d.take_out_places} </p>
                        </div>
                        <div class="infodivs" id="gym_cost"> 
                            <p class="key"> Gym cost: </p> 
                            <p id="value">${d.gym_cost} </p>
                        </div>

                    </div>
                </div>
                `)
            .on("mouseover", function (event, d) {
                // Show tooltip on hover
                tooltip.style("opacity", 0.9);
            })
            .on("mousemove", function (event, d) {
                // Move tooltip to follow the mouse
                let text = key.replace(/_/g, " ");

                tooltip
                    .html(` <b>${d.city}</b>, ${text}: ${d[key]}`)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 28 + "px");
            })
            .on("mouseout", function (event, d) {
                // Hide tooltip on mouseout
                tooltip.style("opacity", 0);
            })
            .on("mouseenter", function (event, d) {
                let foreign = d3.select(this);
                foreign.transition().style("transform", "scale(1.5)");

                let flagImage = d3.select(this);
                flagImage
                    .style("display", "flex")
                    .style("justify-content", "center")
                    .style("align-items", "center");
                // .style("z-index", 1)
            })
            .on("mouseleave", function (event, d) {
                let foreign = d3.select(this);
                foreign.transition().style("transform", "scale(1)");
                d3.select(this).select(".flag-image");
            });

        // Create a tooltip
        let tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


        let zoomBehavior = d3.zoom()
            .scaleExtent([1, 8]);

        svg.call(zoomBehavior);

        function zoom(event, d, radiusScale) {
            let [x, y, r] = [xScale(sortedData.indexOf(d)) + wPadding, hSvg / 2, radiusScale(sortedData.indexOf(d))];
            let k = 2.5; // Zoom level

            svg.transition()
                .duration(750)
                .call(zoomBehavior.transform, d3.zoomIdentity
                    .translate(wSvg / 2 - k * x, hSvg / 2 - k * y)
                    .scale(k));

            let chosen = event.target.offsetParent.children[0].children[0];
            chosen.classList.toggle("chosen");

            chosen.style.opacity = chosen.classList.contains("chosen") ? "1" : "0";
        }

    } else {
        console.log(key);
        console.log(value);

        let sortedData = chosenData.sort((a, b) => a.filter - b.filter);

        console.log(sortedData);

        svg.selectAll("g")
            .data(sortedData)
            .transition()
            .duration(400)
            .attr("transform", (d, i) => `translate(${xScale(i) + wPadding},${hSvg / 2})`)

        let gViz = svg.selectAll("circle")
            .data(sortedData)
            .transition()
            .duration(400)
            .attr("transform", (d, i) => `translate(${xScale(i) + wPadding},${hSvg / 2})`)

        svg.selectAll("foreignObject")
            .data(sortedData)
            .transition()
            .duration(400)
            .attr("transform", (d, i) => `translate(${xScale(i) + wPadding},${hSvg / 2})`)

        console.log(gViz);


    }



}



CreateButtons();
