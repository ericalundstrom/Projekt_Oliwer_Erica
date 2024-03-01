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

let wSvg = 1000;
let hSvg = 1000;
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
        .size([wViz - margin * 4, hViz - margin * 4])
        .padding(3);

    const bigDataset = await fetching();

    const root = pack(d3.hierarchy({ children: bigDataset }).sum((d) => d[key])); // Use the selected property for sizing

    fetching().then((data) => {
        // Extract keys from the JSON object
        let keys = Object.keys(data);
        let gViz = svg
            .append("g")
            .selectAll()
            .data(root.leaves())
            .enter()
            .append("g")
            .attr("transform", (d) => `translate(${d.x},${d.y})`)


        let radius = 50;

        // Append circle
        gViz
            .append("circle")
            .attr("r", radius)
            .style("fill", "none")
            .style("stroke", "black")

        // Append foreignObject with the same size as the circle
        gViz
            .append("foreignObject")
            .attr("width", 100) // Adjust the width based on your requirements
            .attr("height", 100) // Adjust the height based on your requirements
            .attr("x", -50) // Adjust the position based on your requirements
            .attr("y", -50)
            .html(
                (d) =>
                    `<div class="flag-image" style="background-image: url(${d.data.flag});"></div>`
            )
            .on("mouseenter", function (event, d) {
                hoverFunction(d, d3.select(this), true); // Pass the D3 selection of the circle
            })
            .on("mouseleave", function (event, d) {
                hoverFunction(d, d3.select(this), false); // Pass the D3 selection of the circle
            });

    });
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
        console.log(d.r);
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