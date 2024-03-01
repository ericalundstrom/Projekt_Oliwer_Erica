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
    keys.forEach(d => {
        let ButtonDom = document.createElement("button")
        ButtonDom.classList.add("button");
        let text = d.replace("_", " ");
        ButtonDom.textContent = text;
        ButtonWrapper.append(ButtonDom);
        ButtonDom.addEventListener("click", (e) => {
            filterDataViz(e)
        })
    })
}

CreateButtons()


function filterDataViz(e) {
    console.log(e.target.textContent);
}