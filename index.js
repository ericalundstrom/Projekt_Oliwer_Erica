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

CreateButtons();

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
let hSvg = 800;
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
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    let radius = 50;

    // Append circle
    gViz
      .append("circle")
      .attr("r", radius)
      .style("fill", "none")
      .style("stroke", "black");

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
      );
  });
}

function Randomize() {
  let x = [10, 20, 30, 40, 50, 60];
  let y = [50, 10, 40, 70, 60, 30, 20];

  // Randomly select an index for array x
  let randomIndexX = Math.floor(Math.random() * x.length);
  // Randomly select an index for array y
  let randomIndexY = Math.floor(Math.random() * y.length);

  // Return an array with the randomly selected values from x and y
  return [x[randomIndexX], y[randomIndexY]];
}
