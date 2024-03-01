async function fetching() {
    const data = await d3.json("dataset/healthy_lifestyle_city_2021.json");
    return data;
}

async function CreateButtons() {
    let keys = [];
    let bigDataset = await fetching();

    let firstData = bigDataset[0];

    for (const key in firstData) {
        if (key === "City" || key === "flag") {
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
    let svg = d3
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
        .style("stroke", "black");

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
            // Update width and height attributes using the D3 selection
            foreign.style("transform", "scale(2)");
            // d3.select(this)
            //     .select(".flag-image") // Select the child element with class flag-image
            //     .style("transform", "scale(2)"); // Double the size using CSS
        })
        .on("mouseleave", function (event, d) {
            let foreign = d3.select(this);
            // Update width and height attributes using the D3 selection
            foreign.style("transform", "scale(1)");
            // d3.select(this)
            //     .select(".flag-image") // Select the child element with class flag-image
            //     .style("transform", "scale(1)"); // Revert back to original size using CSS
        });



    // Create a tooltip
    let tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


}


function hoverFunction(d, e, va) {
    if (va) {
        // Double the radius when hovered over
        d.r = d.r * 2;
        // Apply the change to the circle element
        e.attr("r", d.r);
        console.log(d.r);
    } else {
        // Return to original size when not hovered
        d.r = d.r / 2;
        // Apply the change to the circle element
        e.attr("r", d.r);
        // console.log(d.r);
    }
}

// function hoverFunction(d, e, va) {
//     if (va) {
//         console.log(e.r);
//         // console.log(d.target.children.length);

//         for (let i = 0; i < d.target.children.length; i++) {
//             let currentChild = d.target.children[i].tagName
//             let CurrentChildRadius = d.target.children[i].__data__.r

//             // console.log(currentChild);
//             if (currentChild === "circle") {
//                 // console.log(e);
//                 d.target.children[i].__data__.r = d.target.children[i].__data__.r * 3
//                 console.log(d.target.children[i]);
//                 console.log(e.r);
//             } else {
//                 console.log("inte");
//                 // e.r = e.r * 3
//                 d.target.children[i].__data__.r = d.target.children[i].__data__.r * 3
//                 // console.log(d.target.children[i].__data__.r);
//                 console.log(e.r);
//                 // console.log(d.target.children[i]);
//             }
//         }
//     } else {
//         e.r = e.r / 3;
//         console.log(d.target.children);
//     }

// }

CreateButtons();