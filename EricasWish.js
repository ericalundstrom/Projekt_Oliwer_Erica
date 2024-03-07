async function fetching() {
    const data = await d3.json("dataset/healthy_lifestyle_city_2021.json");
    return data;
}

function basicLayout() {
    let wrapper = document.querySelector("#wrapper");
    wrapper.innerHTML = `
  
      <div id="background">
          <h1> Healthy lifestyle around the globe </h1>
  
          <p>According to a study by YouGov, almost half of Brits stated improving fitness (47%), losing weight (44%), and improving diet (41%) were among their most important New Year’s resolutions for 2020. It’s no surprise that millions of people worldwide enter each New Year with the hope of taking better care of themselves, whether that’s signing up for the gym or eating healthier.</p>
          <p> However, fitness and diet are not the only measurements of healthiness - although they do play a big part. Sometimes it’s about our surrounding environment, as well as lifestyle choices.</p>
          <p> The team at Lenstore has analyzed 44 cities across the globe to uncover where it’s easier to lead a well-rounded, healthy lifestyle. From obesity levels to pollution rates, each city has been scored across 10 healthy living metrics.</p>
          <p> By analyzing factors such as obesity levels, pollution rates, access to outdoor activities, and more, we aim to provide users with a comprehensive view of what it means to live healthily in different urban environments. This data-driven approach allows individuals to make more informed decisions about where they live and how they can improve their quality of life.  </p>
          <p> The team at Lenstore is dedicated to promoting health and well-being, and we believe that by shedding light on these important metrics, we can empower individuals to make positive changes for themselves and their communities. </p>
          <p> As two students at Malmö Universitet, we were intrigued by Lenstore's analysis and decided to delve deeper into the data. Our goal is to create a visualization that provides users with valuable insights into the factors that contribute to a healthy lifestyle in different urban environments. </p>
          <p> By combining our passion for data analysis with our commitment to promoting health and well-being, we aim to empower individuals to make informed decisions about their living arrangements and lifestyle choices. Join us on this journey as we explore the pathways to a healthier and more fulfilling life. </p>
          <br>
          <p id="finalQuote"> One question remains, do <b> you</b> live in the best city for healthy living? </p>
          <br>
  
      </div>
     `;

    document.querySelector("footer").textContent =
        "© This data is provided by Kaggle.com. Made my Oliwer Löfgren and Erica Lundström ©";
    CreateButtons();
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
        });
    });
}

let currentFilterKey;
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
let hSvg = 1200;

let hViz = 0.9 * hSvg;
let wViz = 0.9 * wSvg;
let wPadding = (wSvg - wViz) / 2;
let hPadding = (hSvg - hViz) / 2;
let margin = 1;

let gViz;
let view;

let n_cols = 9;

async function CreateBubbles(key, value) {
    const bigDataset = await fetching();
    let svg = d3.select("svg");

    let maxValue = 0;
    let minValue = Infinity;
    bigDataset.forEach((d) => {
        if (d[key] == "NA") {
            return;
        }
        maxValue = Math.max(maxValue, d[key]);
        minValue = Math.min(minValue, d[key]);
    });

    let range = d3.select(".range");

    let w = 200;
    let h = 100;

    range
        .transition()
        .duration(300)
        .tween("text", function () {
            const interpolate = d3.interpolate(
                this.textContent,
                `Min value: ${minValue} Max value: ${maxValue}`
            );

            return function (t) {
                this.innerHTML = interpolate(t);
            };
        });

    function grid_coords(index) {
        let xaxis = (index % n_cols) * w;
        let yaxis = Math.floor(index / n_cols) * h;

        let x = h / 3 + xaxis;
        let y = w / 2 + yaxis;

        return { x, y };
    }

    const processedData = bigDataset.map((d) => {
        const value = parseFloat(d[key]);
        return {
            ...d,
            [key]: isNaN(value) ? "NaN" : value, // Replace NaN with 0 or any default value
        };
    });

    let sizeScale = d3
        .scaleLinear()
        .domain([0, d3.max(processedData, (d) => d[key])])
        .range([40, 0.8 * w]);

    if (value) {
        var legendGroup = svg
            .append("g")
            .attr("class", "legendOrdinal")
            .attr("transform", `translate(${wPadding},20)`);

        var ordinal = d3
            .scaleOrdinal()
            .domain(["Nan, no data", "Existing data"])
            .range(["lightgray", "none"]);

        var legendOrdinal = d3
            .legendColor()
            .shape("circle")
            .shapePadding(10)
            .cellFilter(function (d) {
                return d.label !== "e";
            })
            .scale(ordinal);

        legendGroup.call(legendOrdinal);

        legendGroup
            .selectAll(".cell circle")
            .style("stroke", "none")
            .attr("r", 10)
            .each(function (d) {
                // Append an image pattern to each legend circle
                d3.select(this.parentNode)
                    .append("foreignObject")
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("x", -10)
                    .attr("y", -10)
                    .html(
                        `<div class="flag-image" style="background-image: url(images/sweden-flag.jpg)"></div>`
                    );

                if (d !== "Existing data") {
                    d3.select(this.parentNode).classed("nan-value", true);
                } else {
                    d3.select(this.parentNode).classed("data", true);
                }
            });

        let gViz = svg
            .selectAll(".bubble")
            .data(processedData)
            .enter()
            .append("g")
            .attr("class", "bubble")
            .attr("transform", (d, i) => {
                const { x, y } = grid_coords(i);
                return `translate(${x},${y})`;
            })
            .on("click", (event, d) => {
                event.preventDefault();
                zoom(event);
            });

        gViz
            .append("circle")
            .attr("class", "max")
            .attr("r", (d) => {
                console.log(maxValue);
                let radius = maxValue / 2;
                const size = isNaN(sizeScale(d[key]))

                    ? sizeScale.range()[0]
                    : sizeScale(radius / 4);
                console.log(size);
                return size;
            })
            .attr("fill", "lightgray")
            .attr("cx", maxValue / 4)
            .attr("cy", maxValue / 4)

        gViz
            .append("foreignObject")
            .attr("width", (d, i) => {
                const size = isNaN(sizeScale(d[key]))
                    ? sizeScale.range()[0]
                    : sizeScale(d[key] / 4);
                return size;
            })
            .attr("height", (d, i) => {
                const size = isNaN(sizeScale(d[key]) / 4)
                    ? sizeScale.range()[0]
                    : sizeScale(d[key] / 4);
                return size;
            })
            .classed("nan-value", (d) => (isNaN(d[key]) ? true : false))
            .html(
                (d) =>
                    `<div class="flag-image" style="background-image: url(${d.flag})"></div>`
            )
            .on("mouseover", function (event, d) {
                tooltip.style("opacity", 0.9);
            })
            .on("mousemove", function divInfo(event, d) {
                let text = key.replace(/_/g, " ");

                tooltip
                    .html(`<b>${d.City}</b>, ${text}: ${d[key]}`)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 28 + "px");
            })
            .on("mouseout", function (event, d) {
                tooltip.style("opacity", 0);
            });

        let tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .on("mouseover", function (event, d) {
                tooltip.style("opacity", 0.9);
            });


        gViz
            .append("circle")
            .attr("class", "min")
            .attr("r", (d) => {
                console.log(minValue);
                let radius = minValue / 2;
                const size = isNaN(sizeScale(d[key]))

                    ? sizeScale.range()[0]
                    : sizeScale(radius / 4);
                console.log(size);
                return size;
            })
            .attr("fill", "blue")
            .attr("cx", minValue / 4)
            .attr("cy", minValue / 4)
            .style("border", "1px solid black")

    } else {
        let tooltip = d3.select(".tooltip");

        let legi = d3.selectAll(".cell circle");
        console.log(legi);

        legi.each(function (d) {
            if (d == "Existing data") {
                let foreignObject = d3.select(this.parentNode).select("foreignObject");
                foreignObject.classed("nan-value", false);
            } else {
                let foreignObject = d3.select(this.parentNode).select("foreignObject");
                foreignObject.classed("nan-value", false);
            }
        });


        svg
            .selectAll("class", "min")
            .data(processedData)
            .transition()
            .duration(700)
            .attr("r", (d) => {
                console.log(minValue);
                let radius = minValue / 2;
                const size = isNaN(sizeScale(d[key]))

                    ? sizeScale.range()[0]
                    : sizeScale(radius / 4);
                console.log(size);
                return size;
            })

        svg
            .selectAll(".bubble foreignObject")
            .data(processedData)
            .transition()
            .duration(700)
            .attr("width", (d, i) => {
                // Check for NaN values and assign the minimum size if NaN
                const size = isNaN(sizeScale(d[key]))
                    ? sizeScale.range()[0]
                    : sizeScale(d[key] / 4);
                return size;
            })
            .attr("height", (d, i) => {
                // Check for NaN values and assign the minimum size if NaN
                const size = isNaN(sizeScale(d[key]))
                    ? sizeScale.range()[0]
                    : sizeScale(d[key] / 4);
                return size;
            });

        d3.selectAll("foreignObject")
            .on("mousemove", function divInfo(event, d) {
                // Move tooltip to follow the mouse
                let text = key.replace(/_/g, " ");

                tooltip
                    .html(`<b>${d.City}</b>, ${text}: ${d[key]}`)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 28 + "px");
            })
            .classed("nan-value", (d) => (isNaN(d[key]) ? true : false));


        svg
            .selectAll("class", "max")
            .data(processedData)
            .transition()
            .duration(700)
            .attr("r", (d) => {
                console.log(maxValue);
                let radius = maxValue / 2;
                const size = isNaN(sizeScale(d[key]))

                    ? sizeScale.range()[0]
                    : sizeScale(radius / 4);
                console.log(size);
                return size;
            })


        legi =
            d3.selectAll(".cell circle")
                .each(function (d) {

                    if (d !== "Existing data") {
                        d3.select(this.parentNode).classed("nan-value", true);
                    } else {
                        d3.select(this.parentNode).classed("nan-value", false);
                    }
                });

    }
}

basicLayout();