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
            filterDataViz(e);
        });
    });
}

CreateButtons();

function filterDataViz(e) {
    console.log(e.target.textContent);
}

let wSvg = 1000;
let hSvg = 800;
let hViz = 0.9 * hSvg;
let wViz = 0.9 * wSvg;
let wPadding = (wSvg - wViz) / 2;
let hPadding = (hSvg - hViz) / 2;

let svg = d3
    .select("body")
    .append("svg")
    .attr("height", hSvg)
    .attr("width", wSvg);




fetching().then(data => {
    // Extract keys from the JSON object
    let keys = Object.keys(data);
    let gViz = svg.append("g")
        .selectAll()
        .data(keys)
        .enter()
        .append("circle")

    console.log(gViz);
});