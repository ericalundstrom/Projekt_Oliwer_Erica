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

let wSvg = 1200;
let hSvg = 1500;

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
let tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

async function CreateBubbles(key, value) {
  const bigDataset = await fetching();
  let svg = d3.select("svg");

  const processedData = bigDataset.map((d) => {
    const value = parseFloat(d[key]);
    return {
      ...d,
      [key]: isNaN(value) ? "NaN" : value, // Replace NaN with 0 or any default value
    };
  });

  let n_cols = 7;
  let w = Math.floor(wViz / n_cols + wPadding);
  let h = Math.floor(hViz / n_cols - 20);

  function grid_coords(index) {
    let x = (index % n_cols) * w;
    let y = Math.floor(index / n_cols) * h;
    return { x, y };
  }

  let sizeScale = d3
    .scaleLinear()
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
      .on("click", (event, d) => zoom(event, d, sizeScale));

    gViz
      .append("foreignObject")
      .attr("width", (d, i) => {
        const size = isNaN(sizeScale(d[key]))
          ? sizeScale.range()[0]
          : sizeScale(d[key]);
        return size;
      })
      .attr("height", (d, i) => {
        const size = isNaN(sizeScale(d[key]))
          ? sizeScale.range()[0]
          : sizeScale(d[key]);
        return size;
      })
      .html(
        (d) =>
          `<div class="flag-image" style="background-image: url(${d.flag})"></div>`
      )
      .on("mouseover", handleMouseOver)
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut)
      .on("mouseenter", handleMouseEnter)
      .on("mouseleave", handleMouseLeave);
  } else {
    let gViz = svg.selectAll(".bubble").data(processedData);

    gViz
      .selectAll("foreignObject")
      .transition()
      .duration(500)
      .attr("width", (d, i) => {
        const size = isNaN(sizeScale(d[key]))
          ? sizeScale.range()[0]
          : sizeScale(d[key]);
        return size;
      })
      .attr("height", (d, i) => {
        const size = isNaN(sizeScale(d[key]))
          ? sizeScale.range()[0]
          : sizeScale(d[key]);
        return size;
      });

    // Handle interactions for existing bubbles
    gViz
      .on("click", (event, d) => zoom(event, d, sizeScale))
      .on("mouseover", handleMouseOver)
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut);
    //   .on("mouseenter", handleMouseEnter)
    //   .on("mouseleave", handleMouseLeave);

    console.log(svg);
  }

  function handleMouseOver(event, d) {
    // Show tooltip on hover
    tooltip.style("opacity", 0.9);
  }

  function handleMouseMove(event, d) {
    // Move tooltip to follow the mouse
    let text = key.replace(/_/g, " ");
    tooltip
      .html(`<b>${d.City}</b>, ${text}: ${d[key]}`)
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 28 + "px");
  }

  function handleMouseOut(event, d) {
    // Hide tooltip on mouseout
    tooltip.style("opacity", 0);
  }

  function handleMouseEnter(event, d) {
    let foreign = d3.select(this);
    foreign.transition().style("transform", "scale(1.2)");

    let flagImage = d3.select(this);
    flagImage
      .style("display", "flex")
      .style("justify-content", "center")
      .style("align-items", "center");
  }

  function handleMouseLeave(event, d) {
    let foreign = d3.select(this);
    foreign.transition().style("transform", "scale(1)");
    d3.select(this).select(".flag-image");
  }
}

CreateButtons();
