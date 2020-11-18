function init() {

    d3.csv("../DetailedSummary-Earth_Modified.csv").then(function (data) {
        dataset = data;
        let debrisCount = prepareData();
        console.log(debrisCount);
        choropleth(debrisCount);
    }).catch(function (error) {
        alert(error.message);
    });

    function choropleth(countryCount) {
        const w = 900;
        const h = 600;

        let allValues = [];
        for (let i = 0; i < countryCount.length; i++) {
            allValues.push(countryCount[i].country);
        }

        var color = d3.scaleQuantize()
            .domain([0, 12000])
            .range(d3.schemeGreens[5]);

        var projection = d3.geoMercator()
            .translate([w / 2, h / 2])
            .scale(w / 2 / Math.PI);

        var path = d3.geoPath()
            .projection(projection);

        var svg = d3.select("#chart")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("fill", "grey");

        var url = "http://enjalot.github.io/wwsd/data/world/world-110m.geojson";
        d3.json(url).then(function(json) {
            for (var i = 0; i < countryCount.length; i++) {
                var dataCountry = countryCount[i].country;
                var dataValue = countryCount[i].value;

                for (var j = 0; j < json.features.length; j++) {
                    var jsonCountry = json.features[j].properties.name;

                    if (dataCountry === jsonCountry) {
                        json.features[j].properties.value = dataValue;
                        break;
                    }
                }
            }

            svg.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", function (d, i) {
                    if (d.properties.value === undefined) {
                        // console.log(d.properties.name);
                        return "lightgrey";
                    }
                    // console.log(d.properties.name);
                    return color(d.properties.value);
                });

        });


    }

}

function prepareData() {
    let countryCount = [];
    let allKeys = [];

    for (let i = 0; i < dataset.length - 1; i++) {
        let country = dataset[i]['Country']
        if (country === 'United States') {
            country = "USA";
        }
        if (allKeys.includes(country)) {
            for (let j = 0; j < countryCount.length; j++) {
                if (country === countryCount[j].country) {
                    countryCount[j].value += 1;
                    break;
                }
            }
        } else {
            let jsonData = {};
            jsonData['country'] = country;
            jsonData['value'] = 1;

            countryCount.push(jsonData);

            allKeys = [];
            for (let i = 0; i < countryCount.length; i++) {
                allKeys.push(countryCount[i].country);
            }
        }
    }
    return countryCount;
}

let dataset;

window.onload = init;
