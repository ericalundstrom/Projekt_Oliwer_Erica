async function fetching() {
  const data = await d3.json("dataset/healthy_lifestyle_city_2021.json");
  return data;
}

function basicLayout() {
  let wrapper = document.querySelector("#wrapper");
  wrapper.innerHTML = `
  <div class="text" id="info">
    <h1> Healthy lifestyle around the globe </h1>
    <p> Lenstore's extensive analysis of 44 global cities, examining diverse metrics such as obesity levels and pollution rates, aims to identify places conducive to a comprehensive, healthy lifestyle. Our visualization, utilizing Lenstore's data, becomes a crucial tool for individuals aligning resolutions with broader well-being. It caters to a diverse audience, providing insights into the overall health scenario of different cities. Addressing multifaceted health aspects beyond fitness and diet, the visualization aids informed decisions on living environments. This fosters increased efficiency in pursuing a healthier lifestyle, empowering individuals to make holistic choices aligned with well-being goals. </p>
    <p> As two students at Malmö Universitet, we were intrigued by Lenstore's analysis and decided to delve deeper into the data. Our goal is to create a visualization that provides users with valuable insights into the factors that contribute to a healthy lifestyle in different urban environments. </p>
    <p> By combining our passion for data analysis with our commitment to promoting health and well-being, we aim to empower individuals to make informed decisions about their living arrangements and lifestyle choices. Join us on this journey as we explore the pathways to a healthier and more fulfilling life. </p>
    <p id="finalQuote"> One question remains, do <b> you</b> live in the best city for healthy living? </p>
    <br>
    <div id="line"></div>
  </div>
  <div id="Viz"></div>
  <div id="Bottomline"></div>
  <div class="text" id="moreInfo">
    <h2> Working with the data </h2>
    <p>Our initial step involved converting our data from CSV to JSON format. Leveraging a CSV converter within VSCode, we seamlessly transitioned our data into JSON. With this task accomplished, we commenced our data analysis and visualization endeavors.To achieve the desired visualization, we introduced a new key into our database called 'flag,' containing the corresponding country flags. Our objective was to craft an interactive visualization that not only presents data but also engages our audience. </p>
    <p>Some of the keys were found to have NaN values, yet it was imperative to visualize them to facilitate a comprehensive understanding of the distinctions among cities. To accomplish this, we assigned NaN a placeholder value. We opted for a default value of 40, representing the minimum value within the range. Additionally, to signify the absence of data for these keys, we employed a gray opacity for the corresponding circles. These visualizations serve to transparently communicate the lack of available data while maintaining their significance in facilitating city-to-city comparisons for the user. </p>
    
    <br>

    <h2> The quality of the data </h2>
    <p>We first stumbled upon this data when we were looking on Kaggle.com. This website has thousands and thousands of databases from all over the world. We think that our database is trustworthy because the research and data is gathered from several big companies, such as World Wappiness, Our World In Data, and Tripadvisor. The data was gathered from a total of ten metrics. Each of these metrics were awarded a weighted score and these were combined to give each city a total score out of 100. This score was then used to rank the 44 cities to determine which were best for healthy living. </p>

    <br>
    <h2> The learning curve </h2>
    <p> Lenstore's extensive analysis of 44 global cities, examining diverse metrics such as obesity levels and pollution rates, aims to identify places conducive to a comprehensive, healthy lifestyle. Our visualization, utilizing Lenstore's data, becomes a crucial tool for individuals aligning resolutions with broader well-being. It caters to a diverse audience, providing insights into the overall health scenario of different cities. Addressing multifaceted health aspects beyond fitness and diet, the visualization aids informed decisions on living environments. This fosters increased efficiency in pursuing a healthier lifestyle, empowering individuals to make holistic choices aligned with well-being goals.</p>

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
  document.querySelector("#Viz").append(ButtonWrapper);
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
    document.querySelector("#Viz").append(divDom);
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
    .select("#Viz")
    .append("svg")
    .attr("height", hSvg)
    .attr("width", wSvg);
}

let wSvg = 1600;
let hSvg = 1000;

let hViz = 0.9 * hSvg;
let wViz = 0.9 * wSvg;
let margin = 1;
let n_cols = 7;
let w = 100;
let h = 60;

async function CreateBubbles(key, value) {

  function grid_coords(index) {
    // let xaxis = (index % n_cols) * w;
    // let yaxis = Math.floor(index / n_cols) * h;

    // let x = h / 3 + xaxis;
    // let y = w / 2 + yaxis + 20;
    let x = (index % n_cols) * w + 60;
    let y = Math.floor(index / n_cols) * h + 10

    return { x, y };
  }
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
      console.log(key);

      // switch ([key]) {
      //   case "Gym_cost":

      //    { minValue = `${minValue}£`;
      //     maxValue = `${maxValue}£`;}

      //   case "Bottle_water_cost":
      //     minValue = `${minValue}£`;
      //     maxValue = `${maxValue}£`;

      //   case "Obesity":
      //     minValue = `${minValue * 100}£`;
      //     maxValue = `${maxValue * 100}£`;
      // }

      if (key === "Gym_cost" || key === "Bottle_water_cost") {
        minValue = `${minValue}£`;
        maxValue = `${maxValue}£`;
      }
      if (key === "Obesity") {
        minValue = `${minValue * 100}%`;
        maxValue = `${maxValue * 100}%`;
      }

      if (key === "Sunshine_hours") {
        minValue = `${minValue} hours`;
        maxValue = `${maxValue} hours`;
      }
      if (key === "Life_expectancy") {
        minValue = `${minValue} years`;
        maxValue = `${maxValue} years`;
      }
      if (key === "Pollution") {
        minValue = `${minValue} index`;
        maxValue = `${maxValue}index`;
      }
      if (key === "Hours_worked") {
        minValue = `${minValue} hours`;
        maxValue = `${maxValue} hours`;
      }


      const interpolate = d3.interpolate(
        this.textContent,
        `Min value: ${minValue} Max value: ${maxValue}`
      );

      return function (t) {
        this.innerHTML = interpolate(t);
      };
    });

  const processedData = bigDataset.map((d) => {
    const value = parseFloat(d[key]);
    return {
      ...d,
      [key]: isNaN(value) ? NaN : value, // Replace NaN with 0 or any default value
    };
  });

  if (value) {
    let sizeScale = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => +d[key])]) // Convert values to numbers using +d
      .range([40, 0.8 * w]);


    let gViz = svg
      .attr("x", 0)
      .attr("y", 0)
      .selectAll(".bubble")
      .data(processedData)
      .enter()
      .append("g")
      .attr("class", "bubble")
      .attr("transform", (d, i) => {
        const { x, y } = grid_coords(i);
        const deltaSize = isNaN(sizeScale(d[key]))
          ? sizeScale.range()[0]
          : sizeScale(d[key] / 4);
        return `translate(${x + w / 2 - deltaSize / 2},${y})`;
      });

    let deltaWidth = (d) => {
      return isNaN(sizeScale(d[key]))
        ? sizeScale.range()[0]
        : sizeScale(d[key] / 4);
    };

    let deltaHeight = (d) => {
      return isNaN(sizeScale(d[key]))
        ? sizeScale.range()[0]
        : sizeScale(d[key] / 4);
    };
    let deltaMax = (d) => {
      const result = isNaN(sizeScale(d[key]))
        ? sizeScale.range()[0]
        : sizeScale(maxValue / 4);

      return result;
    };

    let deltaMin = (d) => {
      return isNaN(sizeScale(d[key]))
        ? sizeScale.range()[0]
        : sizeScale(minValue / 4);
    };

    gViz
      .append("rect")
      .attr("class", "maxScale")
      .attr("rx", 50) // Set horizontal radius for rounded corners
      .attr("ry", 50)
      .style("fill", "lightgray")
      .attr("width", deltaMax)
      .attr("height", deltaMax)
      .attr("x", function (d, i) {
        const { x, y } = grid_coords(i);
        return x + w / 2 - deltaMax(d) / 2;
      })
      .attr("y", function (d, i) {
        const { x, y } = grid_coords(i);
        return y + h / 2 - deltaMax(d) / 2;
      });
    gViz
      .append("foreignObject")
      .attr("width", deltaWidth)
      .attr("height", deltaHeight)
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
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");

        if (key === "Gym_cost" || key === "Bottle_water_cost") {
          tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]}£`)
        } else {
          tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]}`)
        }
        if (key === "Obesity") {
          tooltip.html(`<b>${d.City}</b>, ${text}: ${Math.round(d[key] * 100)}% `)
        }
        if (key === "Sunshine_hours") {
          tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} hours `)
        }
        if (key === "Life_expectancy") {
          tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} years  `)
        }
        if (key === "Pollution") {
          tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} index score `)
        }
        if (key === "Hours_worked") {
          tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} hours `)
        }

        console.log(key)
        // switch ([key]) {
        //   case "Gym_cost":
        //     tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]}£`)
        //     break;

        //   case "Obesity":
        //     console.log(key);
        //     tooltip.html(`<b>${d.City}</b>, ${text}: ${Math.round(d[key] * 100)}% `)
        //     break;

        //   case "Sunshine_hours":
        //     minValue = `${minValue * 100} hours`;
        //     maxValue = `${maxValue * 100} hours`;
        //     break;
        //   case "Life_expectancy":
        //     minValue = `${minValue * 100} years`;
        //     maxValue = `${maxValue * 100} years`;
        //     break;
        //   case "Pollution":
        //     minValue = `${minValue * 100} index score`;
        //     maxValue = `${maxValue * 100}index score`;
        //     break;
        //   case "Hours_worked":
        //     minValue = `${minValue * 100} hours`;
        //     maxValue = `${maxValue * 100} hours`;
        //     break;
        // }

      })
      .on("mouseout", function (event, d) {
        tooltip.style("opacity", 0);
      })
      .attr("x", function (d, i) {
        const { x, y } = grid_coords(i);
        return x + w / 2 - deltaWidth(d) / 1.9;
      })
      .attr("y", function (d, i) {
        const { x, y } = grid_coords(i);
        return y + h / 2 - deltaHeight(d) / 1.9;
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
      .append("rect")
      .attr("class", "minScale")
      .style("stroke", "black") // Set the color of the border
      .style("stroke-width", "1px")
      .attr("rx", 50) // Set horizontal radius for rounded corners
      .attr("ry", 50)
      .style("fill", "none")
      .attr("width", deltaMin)
      .attr("height", deltaMin)
      .attr("x", function (d, i) {
        const { x, y } = grid_coords(i);
        return x + w / 2 - deltaMin(d) / 2;
      })
      .attr("y", function (d, i) {
        const { x, y } = grid_coords(i);
        return y + h / 2 - deltaMin(d) / 2;
      })
      .attr("border", "1px solid black");


    let legendGroup = svg
      .append("g")
      .attr("class", "legendOrdinal")
      .attr("transform", `translate(${wSvg / 3 + 90},${hViz - 40})`);

    let ordinal = d3
      .scaleOrdinal()
      .domain(["Nan, no data", "Existing data", "Max Value", "Min Value"])
      .range(["lightgray", "none"]);

    let legendOrdinal = d3
      .legendColor()
      .shape("circle")
      .orient("horizontal")
      .shapePadding(100)
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

          d3.select(this.parentNode).classed("data", true);
        }

        if (d === "Min Value") {
          d3.select(this)
            .style("stroke", "black") // Set the color of the border
            .style("stroke-width", "1px")
            .attr("fill", "white");
          d3.select(this.parentNode).select("foreignObject").remove();
        }

        if (d === "Max Value") {
          d3.select(this).style("fill", "lightgray");
          d3.select(this.parentNode).select("foreignObject").remove();
        }
      });

  } else {
    let sizeScale = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => +d[key])]) // Convert values to numbers using +d
      .range([40, 0.8 * w]);
    let tooltip = d3.select(".tooltip");

    let legi = d3.selectAll(".cell circle");

    svg.selectAll("g").data(processedData).transition().duration(500);

    legi.each(function (d) {
      if (d !== "Existing data") {
        let foreignObject = d3.select(this.parentNode).select("foreignObject");
        foreignObject.classed("nan-value", false);
      } else {
        console.log(d3.select(this.parentNode).select("foreignObject"));
        let foreignObject = d3.select(this.parentNode).select("foreignObject");
        foreignObject.classed("nan-value", false);
      }
    });

    const categoryScale = d3.scaleLinear().range([40, 0.8 * w]);

    let deltaMax = (d) => {
      const result = isNaN(sizeScale(d[key]))
        ? sizeScale.range()[0]
        : sizeScale(maxValue / 4);

      // console.log("deltaMin result:", result);

      return result;
    };

    let deltaMin = (d) => {
      const result = isNaN(sizeScale(d[key]))
        ? sizeScale.range()[0]
        : sizeScale(minValue / 4);

      // console.log("deltaMin result:", result);

      return result;
    };

    let deltaWidth = (d) => {
      return isNaN(sizeScale(d[key]))
        ? sizeScale.range()[0]
        : sizeScale(d[key] / 4);
    };

    let deltaHeight = (d) => {
      return isNaN(sizeScale(d[key]))
        ? sizeScale.range()[0]
        : sizeScale(d[key] / 4);
    };

    svg
      .selectAll(".maxScale")
      .data(processedData)
      .transition()
      .duration(700)
      .attr("width", deltaMax)
      .attr("height", deltaMax)
      .attr("x", (d, i) => grid_coords(i).x + w / 2 - deltaMax(d) / 2)
      .attr("y", (d, i) => grid_coords(i).y + h / 2 - deltaMax(d) / 2);

    // Update minScale elements
    svg
      .selectAll(".minScale")
      .data(processedData)
      .transition()
      .duration(700)
      .attr("width", deltaMin)
      .attr("height", deltaMin)
      .attr("x", (d, i) => grid_coords(i).x + w / 2 - deltaMin(d) / 2)
      .attr("y", (d, i) => grid_coords(i).y + h / 2 - deltaMin(d) / 2);

    // Update bubble foreignObject elements
    svg
      .selectAll(".bubble foreignObject")
      .data(processedData)
      .join("foreignObject")
      .transition()
      .duration(700)
      .attr("width", deltaWidth)
      .attr("height", deltaHeight)
      .attr("x", (d, i) => grid_coords(i).x + w / 2 - deltaWidth(d) / 1.9)
      .attr("y", (d, i) => grid_coords(i).y + h / 2 - deltaHeight(d) / 1.9);

    d3.selectAll("foreignObject")
      .on("mousemove", function divInfo(event, d) {
        // Move tooltip to follow the mouse
        let text = key.replace(/_/g, " ");
        // if (key === "Gym_cost" || key === "Bottle_water_cost") {
        //   tooltip
        //     .html(`<b>${d.City}</b>, ${text}: ${d[key]}£`)
        //     .style("left", event.pageX + 10 + "px")
        //     .style("top", event.pageY - 28 + "px");

        // } else {
        //   tooltip
        //     .html(`<b>${d.City}</b>, ${text}: ${d[key]}`)
        //     .style("left", event.pageX + 10 + "px")
        //     .style("top", event.pageY - 28 + "px");
        // }
        // if (key === "Obesity") {
        //   tooltip
        //     .html(`<b>${d.City}</b>, ${text}: ${Math.round(d[key] * 100)}% `)
        //     .style("left", event.pageX + 10 + "px")
        //     .style("top", event.pageY - 28 + "px")
        // }


        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");

        if (key === "Gym_cost" || key === "Bottle_water_cost") {
          tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]}£`)
        } else {
          tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]}`)
        }
        if (key === "Obesity") {
          tooltip.html(`<b>${d.City}</b>, ${text}: ${Math.round(d[key] * 100)}% `)
        }
        if (key === "Sunshine_hours") {
          tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} hours `)
        }
        if (key === "Life_expectancy") {
          tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} years  `)
        }
        if (key === "Pollution") {
          tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} index score `)
        }
        if (key === "Hours_worked") {
          tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} hours `)
        }


      })
      .classed("nan-value", (d) => (isNaN(d[key]) ? true : false));
  }
}

basicLayout();