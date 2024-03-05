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

function filterDataViz(e, key) {
    let svg = document.querySelector("svg");
    if (svg) {
        svg.remove();
        CreateBubbles(key);
    } else {
        CreateBubbles(key);
    }
}

let wSvg = 800;
let hSvg = 800;

let hViz = 0.9 * hSvg;
let wViz = 0.9 * wSvg;
let wPadding = (wSvg - wViz) / 2;
let hPadding = (hSvg - hViz) / 2;
let margin = 1;

let gViz;
let view;

async function CreateBubbles(key) {
    const bigDataset = await fetching();

    let svg = d3
        .select("#wrapper")
        .append("svg")
        .attr("height", hSvg)
        .attr("width", wSvg);

    const pack = d3
        .pack()
        .size([wViz - margin * 2, hViz - margin * 2])
        .padding(3);

    const root = pack(
        d3
            .hierarchy({ children: bigDataset })
            .sum((d) => (!isNaN(d[key]) ? d[key] : 1))
    );

    const radiusScale = d3
        .scaleLinear()
        .domain([
            d3.min(root.leaves(), (d) => d.r),
            d3.max(root.leaves(), (d) => d.r),
        ])
        .range([10, 40]);

    gViz = svg // Assign gViz here
        .append("g")
        .selectAll()
        .data(root.leaves().filter((d) => !isNaN(d.data[key])))
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${d.x},${d.y})`)
        .on(
            "click",
            (event, d) => focus !== d && (zoom(event, d), event.stopPropagation())
        );

    // Append circle with dynamic radius
    gViz
        .append("circle")
        .attr("r", (d) => radiusScale(d.r))
        .style("fill", "none");

    // Append foreignObject with the same size as the circle and hover effect
    gViz
        .append("foreignObject")
        .attr("width", (d) => radiusScale(d.r) * 1.3)
        .attr("height", (d) => radiusScale(d.r) * 1.3)
        .attr("x", (d) => -radiusScale(d.r))
        .attr("y", (d) => -radiusScale(d.r))
        .html(
            (d) =>
                `        <div class="flag-image" style="background-image: url(${d.data.flag})">
                    <div id="info" style="opacity: 0">
                       <p id="title"> ${d.data.City} </p>
                        <div class="infodivs" id="Rank"> 
                            <p class="key">Rank: </p> 
                            <p id="value">${d.data.Rank} </p>
                        </div>
                        <div class="infodivs" id="Sunshine_hours"> 
                            <p class="key"> Sunshine hours: </p> 
                            <p id="value">${d.data.Sunshine_hours} </p>
                        </div>
                        <div class="infodivs" id="bottle_water_cost"> 
                            <p class="key"> Bottle water cost: </p> 
                            <p id="value">${d.data.bottle_water_cost} </p>
                        </div>
                        <div class="infodivs" id="Obesity"> 
                            <p class="Obesity"> Obesity: </p> 
                            <p id="value">${d.data.Obesity} </p>
                        </div>
                        <div class="infodivs" id="Life_expectancy"> 
                            <p class="key"> Life expectancy: </p> 
                            <p id="value">${d.data.Life_expectancy} </p>
                        </div>
                        <div  class="infodivs" id="Pollution"> 
                            <p class="key"> Pollution: </p> 
                            <p id="value">${d.data.Pollution} </p>
                        </div>
                        <div  class="infodivs" id="hours_worked"> 
                            <p class="key"> Hours worked: </p> 
                            <p id="value">${d.data.hours_worked} </p>
                        </div>
                        <div  class="infodivs"id="raHappinessnk"> 
                            <p class="key"> Happiness: </p> 
                            <p id="value">${d.data.Happiness} </p>
                        </div>
                        <div class="infodivs" id="Outdoor_activities"> 
                            <p class="key"> Outdoor activities: </p> 
                            <p id="value">${d.data.Outdoor_activities} </p>
                        </div>
                        <div class="infodivs" id="take_out_places"> 
                            <p class="key"> Take out places: </p> 
                            <p id="value">${d.data.take_out_places} </p>
                        </div>
                        <div class="infodivs" id="gym_cost"> 
                            <p class="key"> Gym cost: </p> 
                            <p id="value">${d.data.gym_cost} </p>
                        </div>

                    </div>
                </div>
                `
        )
        // .select("flag-image > p").style("opacity", 0)
        .on("mouseover", function (event, d) {
            // Show tooltip on hover
            tooltip.style("opacity", 0.9);
        })
        .on("mousemove", function (event, d) {
            // Move tooltip to follow the mouse
            let text = key.replace(/_/g, " ");

            tooltip
                .html(` <b>${d.data.City}</b>, ${text}: ${d.data[key]}`)
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

    let focus = root;
    let view;

    svg.on("click", (event) => {
        zoom(event, root);
    });

    zoomTo([focus.x, focus.y, focus.r * 2]);

    function zoomTo(v, e) {
        const k = wSvg / v[2];

        const centerX = wSvg / 2;
        const centerY = hSvg / 2 - 30;
        view = v;

        gViz.attr(
            "transform",
            (d) =>
                `translate(${(d.x - v[0]) * k + centerX},${(d.y - v[1]) * k + centerY})`
        );
        gViz.select("circle").attr("r", (d) => radiusScale(d.r) * k);
        gViz
            .select("foreignObject")
            .attr("width", (d) => radiusScale(d.r) * 2 * k)
            .attr("height", (d) => radiusScale(d.r) * 2 * k)
            .attr("x", (d) => -radiusScale(d.r) * k)
            .attr("y", (d) => -radiusScale(d.r) * k);
    }

    function zoom(event, d) {
        focus = d;
        (d) => (!isNaN(d[key]) ? d[key] : 1);

        const transition = svg
            .transition() // Use the passed SVG element directly
            .duration(event.altKey ? 7500 : 750)
            .tween("zoom", () => {
                const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2.5]);
                return (t) => zoomTo(i(t), d);
            });

        let chosen = event.target.offsetParent.children[0].children[0];
        chosen.classList.toggle("chosen");

        chosen.style.opacity = chosen.classList.contains("chosen") ? "1" : "0";
    }
}

CreateButtons();
