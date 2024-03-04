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

let wSvg = 1000;
let hSvg = 1000;
let hViz = 0.9 * hSvg;
let wViz = 0.9 * wSvg;
let wPadding = (wSvg - wViz) / 2;
let hPadding = (hSvg - hViz) / 2;
let margin = 1;

async function CreateBubbles(key) {
  const bigDataset = await fetching();
  console.log(bigDataset);

  let svg = d3
    .select("body")
    .append("svg")
    .attr("height", hSvg)
    .attr("width", wSvg);

  const pack = d3
    .pack()
    .size([wViz - margin * 2, hViz - margin * 2])
    .padding(10);

  const root = pack(
    d3
      .hierarchy({ children: bigDataset })
      .sum((d) => (!isNaN(d[key]) ? d[key] : 1))
  );
  console.log(root);

  const radiusScale = d3
    .scaleLinear()
    .domain([
      d3.min(root.leaves(), (d) => d.r),
      d3.max(root.leaves(), (d) => d.r),
    ])
    .range([10, 50]);

  let gViz = svg
    .append("g")
    .selectAll()
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${d.x},${d.y})`);

  gViz
    .append("circle")
    .attr("r", (d) => radiusScale(d.r))
    .style("fill", "none");

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
      tooltip.style("opacity", 0.9);
    })
    .on("mousemove", function (event, d) {
      tooltip
        .html(`${key}: ${d.data[key]}`)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (event, d) {
      tooltip.style("opacity", 0);
    })
    .on("mouseenter", function (event, d) {
      let foreign = d3.select(this);
      foreign.transition().style("transform", "scale(1.5)");

      let flagImage = d3
        .select(this)
        .select(".flag-image")
        .html(`<p>${d.data.City}</p>`);
      flagImage
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "center")
        .style("z-index", 1);
    })
    .on("mouseleave", function (event, d) {
      let foreign = d3.select(this);
      foreign.transition().style("transform", "scale(1)");
      d3.select(this).select(".flag-image").html(``);
    });

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

CreateButtons();
