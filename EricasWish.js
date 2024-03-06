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

    let activeButton = null;

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

            if (activeButton) {
                activeButton.classList.remove("active");
            }
            // Add active class to the clicked button
            ButtonDom.classList.add("active");
            // Update activeButton to the current button
            activeButton = ButtonDom;
            filterDataViz(e, d);
            console.log(d);
        });
    });
}

let currentFilterKey; // Track the currently applied filter key
function isSvgEmpty() {
    let svg = document.querySelector("svg");
    if (!svg) {
        createSvg();
        return true;
    }
    return false;
}

async function filterDataViz(e, key) {

    let div = document.querySelector(".chosenFilter");
    let text = key.replace(/_/g, " ");
    if (text.charAt(0) !== text.charAt(0).toUpperCase()) {
        text = text.charAt(0).toUpperCase() + text.slice(1);
    }

    if (div === null) {

        let divDom = document.createElement("div");
        divDom.classList.add("info");
        document.querySelector("#wrapper").append(divDom);
        divDom.innerHTML = `
            <h2 class="chosenFilter"> ${text} </h2>
            <h3 class="range"></h3>
        `;
    } else {
        document.querySelector(".chosenFilter").textContent = text;
    }

    // Check if a different button is clicked, not the currently applied one
    if (key !== currentFilterKey) {
        currentFilterKey = key;
        if (!isSvgEmpty()) {
            CreateBubbles(key, false);
        } else {
            CreateBubbles(key, true);
        }
    }
}


function createSvg() {
    let svg = d3
        .select("#wrapper")
        .append("svg")
        .attr("height", hSvg)
        .attr("width", wSvg);
}

let wSvg = 1200;
let hSvg = 1500;

let hViz = 0.9 * hSvg;
let wViz = 0.9 * wSvg;
let wPadding = (wSvg - wViz) / 2;
let hPadding = (hSvg - hViz) / 2;
let margin = 1;

let gViz;
let view;


let n_cols = 7;
let w = Math.floor(wViz / n_cols + wPadding) + 40;
console.log(w);
let h = Math.floor(hViz / n_cols) - 20;



async function CreateBubbles(key, value) {

    const bigDataset = await fetching();
    let svg = d3.select("svg");


    let maxValue = 0;
    let minValue = Infinity;
    bigDataset.forEach(d => {

        if (d[key] == "NA") {
            return;
        }
        maxValue = Math.max(maxValue, d[key]);
        minValue = Math.min(minValue, d[key]);
    });


    let range = d3.select(".range");

    // Update the text content with a transition effect
    range.transition()
        .duration(500) // Adjust the duration as needed
        .tween("text", function () {
            // Interpolate between the current text content and the new content
            const interpolate = d3.interpolate(this.textContent, `Min: ${minValue} Max: ${maxValue}`);

            // Return a function that updates the text content gradually
            return function (t) {
                this.textContent = interpolate(t);
            };
        });


    function grid_coords(index) {
        let xaxis = (index % n_cols) * w;
        let yaxis = Math.floor(index / n_cols) * h;

        // let yPad = (w / 2) + y
        // let xPad = (h / 2) + x

        let x = (h / 2) + xaxis;
        let y = (w / 2) + yaxis
        // console.log(xPad, Pad);
        return { x, y };
    }

    const processedData = bigDataset.map((d) => {
        const value = parseFloat(d[key]);
        return {
            ...d,
            [key]: isNaN(value) ? "NaN" : value, // Replace NaN with 0 or any default value
        };
    });


    let sizeScale = d3.scaleLinear()
        .domain([0, d3.max(processedData, (d) => d[key])])
        .range([60, 0.8 * w]);


    if (value) {



        let gViz = svg
            .selectAll(".bubble")
            .data(processedData)
            .enter()
            .append("g")
            .attr("class", "bubble")
            .attr("transform", (d, i) => {
                const { x, y } = grid_coords(i);
                return `translate(${x},${y})`; // Use grid_coords for positioning
            })
            .on("click", (event, d) => {
                event.preventDefault()
                zoom(event)
            });

        gViz
            .append("foreignObject")
            .attr("width", (d, i) => {
                // Check for NaN values and assign the minimum size if NaN
                const size = isNaN(sizeScale(d[key])) ? sizeScale.range()[0] : sizeScale(d[key]); return size;
            })
            .attr("height", (d, i) => {
                // Check for NaN values and assign the minimum size if NaN
                const size = isNaN(sizeScale(d[key])) ? sizeScale.range()[0] : sizeScale(d[key]); return size;
            })
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", "translate(0,0)")
            .html(
                (d) =>
                    `   
                    <div class="flag-image" style="background-image: url(${d.flag})"></div>
                        <div id="info" style="opacity: 0">
                            <p id="title"> ${d.City} </p>
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
                    `
            )
            .on("mouseover", function (event, d) {
                // Show tooltip on hover
                tooltip.style("opacity", 0.9);
            })
            .on("mousemove", function divInfo(event, d) {
                // Move tooltip to follow the mouse
                let text = key.replace(/_/g, " ");

                tooltip
                    .html(`<b>${d.City}</b>, ${text}: ${d[key]}`)
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
            })
            .attr("transform", "translate(0,0)"); // Add this line to ensure foreign object position

        // Create a tooltip
        let tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .on("mouseover", function (event, d) {
                // Show tooltip on hover
                tooltip.style("opacity", 0.9);
            });


        // svg.on("click", zoom);
        // svg.call(d3.zoom().on("click", zoom));

        function zoom(event, d) {

            // let radie = event.target.clientHeight;
            // let x = event.clientX
            // let y = event.clientY

            // console.log(event.clientX);
            // console.log(radie, y, x);

            // let scale = 1;
            // let transitionDuration = 500;

            // // Determine if zoom in or zoom out
            // if (event.deltaY < 0) {
            //     // Zoom in
            //     scale = 1.2; // Increase the scale
            // } else {
            //     // Zoom out
            //     scale = 0.8; // Decrease the scale
            // }

            // // Apply the zoom effect to SVG elements
            // svg.selectAll(".bubble")
            //     .transition()
            //     .duration(transitionDuration)
            //     .attr("transform", `translate(${x},${y}) scale(${scale})`);
            let chosen = event.target.offsetParent.childNodes[3];
            console.log(event.target.offsetParent.childNodes[3]);
            // console.log(event.target.closest(".info"));

            chosen.classList.toggle("chosen");

            chosen.style.opacity = chosen.classList.contains("chosen") ? "1" : "0";

        }


    } else {


        svg.selectAll("g").data(processedData).transition().duration(500);

        let tooltip = d3.select(".tooltip");

        svg
            .selectAll("foreignObject")
            .data(processedData)
            .transition()
            .duration(500)
            .attr("width", d => sizeScale(d[key] / 4))
            .attr("height", d => sizeScale(d[key] / 4))
        console.log(key)

        let fore = d3.selectAll("foreignObject")
            .on("mousemove", function divInfo(event, d) {
                // Move tooltip to follow the mouse
                let text = key.replace(/_/g, " ");

                tooltip
                    .html(`<b>${d.City}</b>, ${text}: ${d[key]}`)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 28 + "px");
            })


    }
}

CreateButtons();
