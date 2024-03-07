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
    <br>
    <div id="city_div">
        <p>HEJ</p>
    </div>`;

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

let h = Math.floor(hViz / n_cols) + 20;

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

  range
    .transition()
    .duration(300)
    .tween("text", function () {
      const interpolate = d3.interpolate(
        this.textContent,
        `Min value: <br> ${minValue}<br> <br>Max value: <br> ${maxValue}`
      );

      return function (t) {
        this.innerHTML = interpolate(t);
      };
    });

  function grid_coords(index) {
    let xaxis = (index % n_cols) * w;
    let yaxis = Math.floor(index / n_cols) * h;

    // let yPad = (w / 2) + y
    // let xPad = (h / 2) + x

    let x = h / 2 + xaxis;
    let y = w / 2 + yaxis;
    // console.log(xPad, Pad);

    // let x = (index % n_cols) * w;
    // let y = Math.floor(index / n_cols) * h;
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
    .range([60, 0.8 * w]);

  //   var linearSize = d3.scaleLinear().domain([0, maxValue]).range([10, 30]);

  //   svg
  //     .append("g")
  //     .attr("class", "legendSize")
  //     .attr("transform", `translate(${(wViz - wPadding) / 2}, 20)`);

  //   var legendSize = d3
  //     .legendSize()
  //     .scale(linearSize)
  //     .shape("circle")
  //     .shapePadding(15)
  //     .labelOffset(20)
  //     .orient("horizontal");

  //   svg.select(".legendSize").call(legendSize).transition();

  if (value) {
    console.log("We are in the if");

    let gViz = svg
      .selectAll(".bubble")
      .data(processedData)
      .enter()
      // .attr("translate", `transform(0, ${hPadding})`)
      .append("g")
      .attr("class", "bubble")
      .attr("transform", (d, i) => {
        const { x, y } = grid_coords(i);
        return `translate(${x},${y})`; // Use grid_coords for positioning
      })
      .on("click", (event, d) => {
        event.preventDefault();
        zoom(event);
      });

    gViz
      .append("foreignObject")
      .attr("width", (d, i) => {
        // Check for NaN values and assign the minimum size if NaN
        const size = isNaN(sizeScale(d[key]))
          ? sizeScale.range()[0]
          : sizeScale(d[key]);
        return size;
      })
      .attr("height", (d, i) => {
        // Check for NaN values and assign the minimum size if NaN
        const size = isNaN(sizeScale(d[key]))
          ? sizeScale.range()[0]
          : sizeScale(d[key]);
        return size;
      })
      .classed("nan-value", (d) => (isNaN(d[key]) ? true : false))
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
    console.log("We are in the else");

    // svg.select(".legendSize").call(legendSize.scale(linearSize)).transition();

    svg.selectAll("g").data(processedData).transition().duration(500);

    let tooltip = d3.select(".tooltip");

    svg
      .selectAll("foreignObject")
      .data(processedData)
      .transition()
      .duration(500)
      .attr("width", (d, i) => {
        // Check for NaN values and assign the minimum size if NaN
        const size = isNaN(sizeScale(d[key]))
          ? sizeScale.range()[0]
          : sizeScale(d[key]);
        return size;
      })
      .attr("height", (d, i) => {
        // Check for NaN values and assign the minimum size if NaN
        const size = isNaN(sizeScale(d[key]))
          ? sizeScale.range()[0]
          : sizeScale(d[key]);
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
  }
}

basicLayout();
