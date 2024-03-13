async function fetching() {
  const data = await d3.json("dataset/healthy_lifestyle_city_2021.json");
  return data;
}

function basicLayout() {
  let wrapper = document.querySelector("#wrapper");
  wrapper.innerHTML = `
  <div class="text" id="info">
    <h1> En hälsosam livsstil runt om i världen </h1>
    <p> Lenstores omfattande analys av 44 globala städer, där olika värden som övervikt  och förorening granskas, syftar till att identifiera platser som främjar en omfattande, hälsosam livsstil. Vår visualisering, som använder Lenstores data, blir ett avgörande verktyg för individer som vill leva ett bra liv med en bredare välbefinnande. Den riktar sig till en mångsidig publik och ger insikter i den övergripande hälsosituationen i olika städer. Genom att adressera mångfacetterade hälsoaspekter bortom träning och kost, hjälper visualiseringen till att fatta informerade beslut om livsmiljöer. Detta främjar ökad effektivitet när det gäller att sträva efter en hälsosammare livsstil och ger individer möjlighet att göra holistiska val som är i linje med välbefinnandemål. </p>

    <p> Som två studenter blev vi fascinerade av Lenstores analys och beslutade att gräva djupare i datan. Vårt mål är att skapa en visualisering som ger användarna värdefulla insikter om faktorer som bidrar till en hälsosam livsstil i olika urbana miljöer. </p>
    <p> Genom att kombinera vår passion för dataanalys med vårt engagemang för att främja hälsa och välbefinnande, strävar vi efter att ge individer möjlighet att fatta informerade beslut om sina boende- och livsstilsval. Följ med oss på denna resa när vi utforskar vägarna till ett friskare och mer tillfredsställande liv. </p>
    <p id="finalQuote"> En fråga återstår, bor du i den bästa staden för en hälsosam livsstil? </p>

    <br>
    <div id="line"></div>
  </div>
  <div id="Viz"></div>
  <div id="Bottomline"></div>
  <div class="text" id="moreInfo">
    <h2> Att arbeta med datan </h2>
    <p> Vårt första steg innebar att konvertera vår data från CSV till JSON-format. Genom att utnyttja en CSV-omvandlare inom VSCode övergick vi smidigt vår data till JSON. Med denna uppgift genomförd påbörjade vi våra dataanalys- och visualiseringssträvanden. För att uppnå den önskade visualiseringen införde vi en ny nyckel i vår databas som heter 'flagga', som innehåller motsvarande landsflaggor. Vårt mål var att skapa en interaktiv visualisering som inte bara presenterar data utan också engagerar vår publik.</p>
    <p> Vissa av nycklarna visade sig ha NaN-värden, ändå var det viktigt att visualisera dem för att underlätta en omfattande förståelse av skillnaderna mellan städerna. För att åstadkomma detta tilldelade vi NaN ett platshållarvärde. Vi valde ett standardvärde på 10. Dessutom, för att signalera frånvaron av data för dessa nycklar, använde vi en grå opacitet för de motsvarande cirklarna. Dessa visualiseringar syftar till att tydligt kommunicera bristen på tillgängliga data samtidigt som de behåller sin betydelse för att underlätta jämförelser mellan städer för användaren.</p>
    
    <br>

    <h2> Kvaliteten på datan</h2>
    <p> Vi stötte först på denna data när vi letade på Kaggle.com. Den här webbplatsen har tusentals databaser från hela världen. Vi anser att vår databas är pålitlig eftersom forskningen och datan samlades in från flera stora företag, som World Happiness, Our World In Data och Tripadvisor. Datan samlades in från sammanlagt tio mätvärden. Varje av dessa mätvärden tilldelades en viktad poäng och dessa kombinerades för att ge varje stad en total poäng av 100. Denna poäng användes sedan för att rangordna de 44 städerna för att avgöra vilka som var bäst för hälsosamt liv.</p>

    <br>
    <h2> Lärdomar </h2>
    <p> I vår första visualisering behövde vi undersöka användningen av d3.hierarchy och d3.pack för att positionera data inom en sammanlänkad cirkel. Därefter, i vår andra visualisering, tog vi oss an uppgiften att arrangera data i en grid, vilket innebar ett betydande avsteg från tillvägagångssättet i den första visualiseringen. Genom att adressera båda metoderna för dataplacering vann vi värdefulla insikter.

    Att fastställa det mest effektiva sättet att visualisera vår data utgjorde en betydande utmaning. Medan vår inspiration ledde oss till att välja cirklar tidigt, visade det sig vara en utmanande uppgift att anpassa dessa cirklar för att passa vår specifika data, vilket vi lyckades navigera framgångsrikt genom hela processen.
    </p>

  </div>
  `;

  document.querySelector("footer").textContent =
    "© Datan är från av Kaggle.com. Skapad av Oliwer Löfgren och Erica Lundström.©";
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

      ButtonDom.classList.add("active");

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
    divDom.classList.add("info_filter");
    document.querySelector("#Viz").append(divDom);
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
    .select("#Viz")
    .append("svg")
    .attr("height", hSvg)
    .attr("width", wSvg);
}

let wSvg = 1400;
let hSvg = 600;

let hViz = 0.9 * hSvg;
let wViz = 0.5 * wSvg;
let gap = 5;
let n_cols = 10;
let w = wViz / n_cols;
let h = w;
let constantSize = 10;

async function CreateBubbles(key, value) {
  function grid_coords(index) {
    let x = (index % n_cols) * w + gap;
    let y = Math.floor(index / n_cols) * h + 10;

    return { x, y };
  }
  const bigDataset = await fetching();
  let svg = d3.select("svg").attr("viewBox", `0 0 1400 600`);

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
      switch (key) {
        case "Gym_cost":
        case "Bottle_water_cost":
          minValue = `${minValue}£`;
          maxValue = `${maxValue}£`;
          break;
        case "Obesity":
          minValue = `${minValue * 100}%`;
          maxValue = `${maxValue * 100}%`;
          break;
        case "Sunshine_hours":
          minValue = `${minValue} hours`;
          maxValue = `${maxValue} hours`;
          break;
        case "Life_expectancy":
          minValue = `${minValue} years`;
          maxValue = `${maxValue} years`;
          break;
        case "Pollution":
          minValue = `${minValue} index`;
          maxValue = `${maxValue} index`;
          break;
        case "Hours_worked":
          minValue = `${minValue} hours`;
          maxValue = `${maxValue} hours`;
          break;
        case "Happiness":
          minValue = `${minValue} level score`;
          maxValue = `${maxValue} level score`;
          break;
      }

      const interpolate = d3.interpolate(
        this.textContent,
        `Min value: ${minValue}, Max value: ${maxValue}`
      );

      return function (t) {
        this.innerHTML = interpolate(t);
      };
    });

  let processedData = bigDataset.map((d) => {
    const value = parseFloat(d[key]);
    return {
      ...d,
      [key]: isNaN(value) ? NaN : value,
    };
  });

  if (value) {
    let sizeScale = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => d[key])])
      .range([0, w - gap]);

    let gViz = svg
      .selectAll(".bubble")
      .data(processedData)
      .enter()
      .append("g")
      .attr("class", "bubble")
      .attr("transform", (d, i) => {
        const { x, y } = grid_coords(i);
        const deltaSize = isNaN(d[key]) ? constantSize : sizeScale(d[key] / 4);
        return `translate(${x + w / 2 - deltaSize / 2},${y})`;
      });

    let deltaWidth = (d) => {
      return isNaN(d[key]) ? constantSize : sizeScale(d[key]);
    };

    let deltaHeight = (d) => {
      return isNaN(d[key]) ? constantSize : sizeScale(d[key]);
    };
    let deltaMax = (d) => {
      return isNaN(d[key]) ? constantSize : sizeScale(maxValue);
    };

    let deltaMin = (d) => {
      return isNaN(d[key]) ? constantSize : sizeScale(minValue);
    };

    gViz
      .append("rect")
      .attr("class", "maxScale")
      .attr("rx", 50)
      .attr("ry", 50)
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
        switch (key) {
          case "Gym_cost":
          case "Bottle_water_cost":
            tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]}£`);
            break;
          case "Obesity":
            tooltip.html(`<b>${d.City}</b>, ${text}: ${Math.round(d[key] * 100)}%`);
            break;
          case "Sunshine_hours":
            tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} hours`);
            break;
          case "Life_expectancy":
            tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} years`);
            break;
          case "Pollution":
            tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} index score`);
            break;
          case "Hours_worked":
            tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} hours`);
            break;
          case "Happiness":
            tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} level score`);
            break;
          default:
            tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]}`);
            break;
        }

      })

      .on("click", (e) => {
        let clickedElement = d3.select(e.target.offsetParent);
        let isSelected = clickedElement.classed("selected");
        let radius = parseInt(e.target.offsetParent.attributes[0].nodeValue);
        let viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight;

        if (!isSelected) {
          svg.transition();
          clickedElement.classed("selected", true);
          let y = e.clientY;
          let x = e.clientX;

          switch (true) {
            case (radius < 10 && radius > 0):
              viewBoxX = x - (w * 2);
              viewBoxY = y - (w * 3) - 80;
              viewBoxWidth = 3 * w;
              viewBoxHeight = 3 * w;
              break;
            case (radius < 15 && radius > 10):
              viewBoxX = x - (w * 4) + 120;
              viewBoxY = y - (w * 4);
              viewBoxWidth = 3 * w;
              viewBoxHeight = 3 * w;
              break;
            case (radius < 25 && radius > 15):
              viewBoxX = x - (w * 4) + 120;
              viewBoxY = y - (w * 4);
              viewBoxWidth = 3 * w;
              viewBoxHeight = 3 * w;
              break;
            case (radius > 25 && radius < 30):
              viewBoxX = x - (w * 4) + 60;
              viewBoxY = y - (w * 4) - 20;
              viewBoxWidth = 3 * w;
              viewBoxHeight = 3 * w;
              break;
            case (radius > 30 && radius < 35):
              viewBoxX = x - (w * 2.5) + 20;
              viewBoxY = y - (w * 3) - 60;
              viewBoxWidth = 3 * w;
              viewBoxHeight = 3 * w;
              break;
            case (radius > 35 && radius < 45):
              viewBoxX = x - (w * 2) + 20;
              viewBoxY = y - (w * 2) - 50;
              viewBoxWidth = 3 * w;
              viewBoxHeight = 3 * w;
              break;
            case (radius > 45 && radius < 35):
              viewBoxX = x - (w * 2) + 20;
              viewBoxY = y - (w * 2) - 20;
              viewBoxWidth = 3 * w;
              viewBoxHeight = 3 * w;
              break;
            case (radius > 55 && radius < 45):
              viewBoxX = x - (w * 2) + 20;
              viewBoxY = y - (w * 2) - 60;
              viewBoxWidth = 3 * w;
              viewBoxHeight = 3 * w;
              break;
            case (radius > 55):
              viewBoxX = x - (w * 4) + 150;
              viewBoxY = y - (w * 4);
              viewBoxWidth = 3 * w;
              viewBoxHeight = 3 * w;
              break;
            default:
              viewBoxX = x - (w * 4) + 150;
              viewBoxY = y - (w * 4) - 50;
              viewBoxWidth = 3 * w;
              viewBoxHeight = 3 * w;
              break;
          }

          svg.transition()
            .duration(2000)
            .attr("viewBox", `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
        } else {
          clickedElement.classed("selected", false);
          svg.transition()
            .duration(2000)
            .attr("viewBox", `0 0 1400 600`);
        }
      })
      .on("mouseout", function (event, d) {
        tooltip.style("opacity", 0);
      })
      .attr("x", function (d, i) {
        const { x, y } = grid_coords(i);
        return x + w / 2 - deltaWidth(d) / 2;
      })
      .attr("y", function (d, i) {
        const { x, y } = grid_coords(i);
        return y + h / 2 - deltaHeight(d) / 2;
      })
      .transition();

    let tooltip = d3
      .select("#Viz")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", "0")
      .on("mouseover", function (event, d) {
        tooltip.style("opacity", 0.9);
      });

    gViz
      .append("rect")
      .attr("class", "minScale")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .attr("rx", 50)
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
      });

    let legendGroup = svg
      .append("g")
      .attr("class", "legendOrdinal")
      .attr("transform", `translate(${wSvg / 3 + 50},${hViz + 27})`);

    let ordinal = d3
      .scaleOrdinal()
      .domain(["Nan, no data", "Existing data", "Max Value", "Min Value"])
      .range(["none"]);

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
        d3.select(this.parentNode)
          .append("foreignObject")
          .attr("width", 20)
          .attr("height", 20)
          .attr("x", -10)
          .attr("y", -10)
          .html(
            `<div class="flag-image" style="background-image: url(images/sweden-flag.jpg)"></div>`
          );

        if (d === "Nan, no data") {
          d3.select(this.parentNode).classed("nan-value", true);
          d3.select(this.parentNode).classed("data", true);
        }

        if (d === "Min Value") {
          d3.select(this)
            .style("stroke", "black")
            .style("fill", "rgba(255, 255, 255, 0.182)");

          d3.select(this.parentNode).select("foreignObject").remove();
        }

        if (d === "Max Value") {
          d3.select(this).style("stroke", "#3700ff").style("fill", "#3700ff2d");
          d3.select(this.parentNode).select("foreignObject").remove();
        }
      });
  } else {
    let sizeScale = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => d[key])])
      .range([0, w + gap]);
    let tooltip = d3.select(".tooltip");

    let legi = d3.selectAll(".cell circle");

    svg.selectAll("g").data(processedData).transition().duration(500);

    legi.each(function (d) {
      if (d !== "Existing data") {
        let foreignObject = d3.select(this.parentNode).select("foreignObject");
        foreignObject.classed("nan-value", false);
      } else {
        let foreignObject = d3.select(this.parentNode).select("foreignObject");
        foreignObject.classed("nan-value", false);
      }
    });

    let deltaMax = (d) => {
      return isNaN(d[key]) ? constantSize : sizeScale(maxValue);
    };

    let deltaMin = (d) => {
      return isNaN(d[key]) ? constantSize : sizeScale(minValue);
    };

    let deltaWidth = (d) => {
      return isNaN(d[key]) ? constantSize : sizeScale(d[key]);
    };

    let deltaHeight = (d) => {
      return isNaN(d[key]) ? constantSize : sizeScale(d[key]);
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

    svg
      .selectAll(".minScale")
      .data(processedData)
      .transition()
      .duration(700)
      .attr("width", deltaMin)
      .attr("height", deltaMin)
      .attr("x", (d, i) => grid_coords(i).x + w / 2 - deltaMin(d) / 2)
      .attr("y", (d, i) => grid_coords(i).y + h / 2 - deltaMin(d) / 2);

    svg
      .selectAll(".bubble foreignObject")
      .data(processedData)
      .join("foreignObject")
      .transition()
      .duration(700)
      .attr("width", deltaWidth)
      .attr("height", deltaHeight)
      .attr("x", (d, i) => grid_coords(i).x + w / 2 - deltaWidth(d) / 2)
      .attr("y", (d, i) => grid_coords(i).y + h / 2 - deltaHeight(d) / 2);

    d3.selectAll(".bubble foreignObject")
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

        switch (key) {
          case "Gym_cost":
          case "Bottle_water_cost":
            tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]}£`);
            break;
          case "Obesity":
            tooltip.html(`<b>${d.City}</b>, ${text}: ${Math.round(d[key] * 100)}%`);
            break;
          case "Sunshine_hours":
            tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} hours`);
            break;
          case "Life_expectancy":
            tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} years`);
            break;
          case "Pollution":
            tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} index score`);
            break;
          case "Hours_worked":
            tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} hours`);
            break;
          case "Happiness":
            tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]} level score`);
            break;
          default:
            tooltip.html(`<b>${d.City}</b>, ${text}: ${d[key]}`);
            break;
        }
      })
      .classed("nan-value", (d) => (isNaN(d[key]) ? true : false));
  }
}

basicLayout();
