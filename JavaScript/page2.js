function init() {

    d3.csv("../DetailedSummary-Earth_Modified.csv").then(function (data) {
        dataset = data;
        let debrisCount = prepareData();
        choropleth(debrisCount);
    }).catch(function (error) {
        alert(error.message);
    });

    function choropleth(countryCount) {
        const w = 1000;
        const h = 600;

        let allKeys = [];
        let allValues = [];
        for (let i = 0; i < countryCount.length; i++) {
            allKeys.push(countryCount[i].country);
            allValues.push(countryCount[i].value);
        }

        var color = d3.scaleQuantize()
            .domain([0, d3.max(allValues)])
            .range(d3.schemeGreens[5]);

        var projection = d3.geoNaturalEarth1()
            .translate([w / 2, h / 2])
            .center([0, 5 ])
            .scale(w / 2 / Math.PI);

        var path = d3.geoPath()
            .projection(projection);

        var svg = d3.select("#chart")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("fill", "grey");

        const tooltip = d3.select('#chart')
            .append('div')
            .style("opacity", 0)
            .attr('class', 'tooltip')
            .attr("id", "svgTooltip");
        tooltip.append('div')
            .attr('class', 'label');

        tooltip.append('div')
            .attr('class', 'total');

        var url = "http://enjalot.github.io/wwsd/data/world/world-110m.geojson";
        d3.json(url).then(function (json) {
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
                        return "white";
                    }
                    return color(d.properties.value);
                })
                .on('mouseover', function (d) {
                    tooltip.transition().duration(100).style("opacity", 1);
                    tooltip.select('.label').html(d.properties.name);
                    tooltip.select('.total').html(function () {
                        if (d.properties.value !== undefined) {
                            return d.properties.value + ' clean-ups';
                        } else {
                            return 'No records';
                        }
                    });

                    d3.select(this).transition().duration(100)
                        .attr('stroke', 'red')
                        .attr('stroke-width', '1px')
                        .attr('opacity', '.85');
                })
                .on('mousemove', function (d) {
                    tooltip.style("left", (d3.mouse(this)[0] - 200) + "px")
                        .style("top", (d3.mouse(this)[1] - 80) + "px");
                })
                .on('mouseout', function () {
                    tooltip.transition().duration(100).style("opacity", 0);
                    d3.select(this).transition().duration(100)
                        .attr('stroke-width', '0px')
                        .attr('opacity', '1');
                });

            // Legend
            const x = d3.scaleLinear()
                .domain([0, d3.max(allValues)])
                .range([700, 900]);

            const g = svg.append("g")
                .attr("class", "key")
                .attr("transform", "translate(0, 40)");

            g.selectAll("rect")
                .data(color.range().map(d => {
                    d = color.invertExtent(d);
                    if (d[0] == null) d[0] = x.domain()[0];
                    if (d[1] == null) d[1] = x.domain()[1];
                    return d;
                }))
                .enter().append("rect")
                .attr("height", 8)
                .attr("x", d => x(d[0]))
                .attr("width", d => {
                    return x(d[1]) - x(d[0]);
                })
                .attr("fill", d => color(d[0]));

            g.append("text")
                .attr("class", "caption")
                .attr("x", x.range()[0])
                .attr("y", -6)
                .attr("fill", "white")
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text("Total Clean-ups held");

            g.call(d3.axisBottom(x)
                .tickSize(13)
                .tickFormat((x, i) => i ? x : x)
                .tickValues(color.domain()))
                .select(".domain")
                .remove();
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
