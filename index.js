
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
            console.log("blå");
        } else {
            keys.push(key);
        }
    }
    let ButtonWrapper = document.createElement("div");
    ButtonWrapper.classList.add("ButtonBox");
    document.querySelector("body").append(ButtonWrapper);
    console.log(keys);
    keys.forEach((d) => {
        let ButtonDom = document.createElement("button");
        ButtonDom.classList.add("button");
        let text = d.replace("_", " ");
        ButtonDom.textContent = text;
        ButtonWrapper.append(ButtonDom);
        ButtonDom.addEventListener("click", (e) => {
            filterDataViz(e, d);
        });
    });
}

function filterDataViz(e, key) {
    console.log(e);
    console.log(key);
    let svg = document.querySelector("svg");
    if (svg) {
        svg.remove();
        CreateBubbles(key);
    } else {
        CreateBubbles(key);
    }
}


let wSvg = 1100;
let hSvg = 1100;
let hViz = 0.9 * hSvg;
let wViz = 0.9 * wSvg;
let wPadding = (wSvg - wViz) / 2;
let hPadding = (hSvg - hViz) / 2;
let margin = 1;

async function CreateBubbles(key) {
    const svg = d3
        .select("body")
        .append("svg")
        .attr("height", hSvg)
        .attr("width", wSvg);


    const pack = d3
        .pack()
        .size([wViz - margin * 2, hViz - margin * 2])
        .padding(100); // Increase padding to add more space between circles

    const bigDataset = await fetching();

    const root = pack(d3.hierarchy({ children: bigDataset }).sum((d) => d[key]));

    // Create a scale for the radius
    const radiusScale = d3
        .scaleLinear()
        .domain([
            d3.min(root.leaves(), (d) => d.r),
            d3.max(root.leaves(), (d) => d.r),
        ])
        .range([20, 70]);

    let gViz = svg
        .append("g")
        .selectAll()
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

    // Append circle with dynamic radius
    gViz
        .append("circle")
        .attr("r", (d) => radiusScale(d.r))
        .style("fill", "none")

    // Append foreignObject with the same size as the circle and hover effect
    gViz
        .append("foreignObject")
        .attr("width", (d) => radiusScale(d.r) * 2)
        .attr("height", (d) => radiusScale(d.r) * 2)
        .attr("x", (d) => -radiusScale(d.r))
        .attr("y", (d) => -radiusScale(d.r))
        .html(
            (d) =>
                `<div class="flag-image" style="background-image: url(${d.data.flag});"></div>`
        )
        .on("mouseover", function (event, d) {
            // Show tooltip on hover
            tooltip.style("opacity", 0.9);
        })
        .on("mousemove", function (event, d) {
            // Move tooltip to follow the mouse
            tooltip
                .html(`${key}: ${d.data[key]}`)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function (event, d) {
            // Hide tooltip on mouseout
            tooltip.style("opacity", 0);
        })
        .on("mouseenter", function (event, d) {
            let foreign = d3.select(this);
            foreign.transition()
                .style("transform", "scale(2.5)")

            let flagImage = d3.select(this).select(".flag-image").html(`<p>${d.data.City}</p>`);
            flagImage.style("display", "flex")
                .style("justify-content", "center")
                .style("align-items", "center")
                .style("z-index", 1);
        })
        .on("mouseleave", function (event, d) {
            let foreign = d3.select(this);
            foreign.transition().style("transform", "scale(1)")
            d3.select(this)
                .select(".flag-image")
                .html(``)
            // console.log(svg._groups[0][0]);
        })
        // .on("click", (event, d) => ZoomFunction(event, d))
        .on("click", (event, d) => zoom(event, d));


    // Create a tooltip
    let tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    let focus = root;
    let view;

    // svg.on("click", (event) => zoom(event, root));


    function zoomTo(v) {
        const k = wSvg / v[2];

        view = v;
        console.log(v);

        gViz.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        gViz.select("circle").attr("r", d => radiusScale(d.r) * k);
        gViz.select("foreignObject")
            .attr("width", (d) => radiusScale(d.r) * 2 * k)
            .attr("height", (d) => radiusScale(d.r) * 2 * k)
            .attr("x", (d) => -radiusScale(d.r) * k)
            .attr("y", (d) => -radiusScale(d.r) * k);
    }

    function zoom(event, d) {
        const focus0 = focus;
        focus = d;
        console.log(svg); // Log the SVG element passed as an argument
        console.log(focus.r, focus.x, focus.y);

        const transition = svg.transition() // Use the passed SVG element directly
            .duration(event.altKey ? 7500 : 750)
            .tween("zoom", () => {
                const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                return t => zoomTo(i(t));
            });
    }





    // svg.on("click", (event) => zoom(svg, event, root));
}



CreateButtons();


// function ZoomFunction(e, d) {
//     // console.log(e, d);
//     // let labelText = d3.select(".flag-image > p")
//     // console.log(labelText.html);
//     let svg = d3.select("svg")
//     let focus0 = focus;

//     focus = d;

//     let transition = svg.transition()
//         .duration(e.altKey ? 7500 : 750)
//         .tween("zoom", d => {
//             const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
//             return t => zoomTo(i(t));
//         });
// }