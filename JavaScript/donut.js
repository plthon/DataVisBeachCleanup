function init() {
    d3.csv("../Assets/DetailedSummary-Earth_Modified.csv").then(function (data) {
        dataset = data;
        prepareData();
        let debrisCount = allCountriesData();
        donutChart(debrisCount, 'All Countries');
    }).catch(function (error) {
        alert(error.message);
    });

}

function donutChart(debrisCount, countryName) {
    const w = 900;
    const h = 600;
    const margin = 40;

    var radius = Math.min(w, h) / 2 - margin;

    function topTenOther() {
        function compare(a, b) {
            if (a.value < b.value) {
                return 1;
            }
            if (a.value > b.value) {
                return -1;
            }
            return 0;
        }

        debrisCount.sort(compare);

        let topTenCount = debrisCount.slice(0, 10);

        let total = 0;
        for (let j = 10; j < debrisCount.length; j++) {
            total += debrisCount[j].value;
        }

        let jsonData = {};
        jsonData['debris'] = 'Other Debris';
        jsonData['value'] = total;

        topTenCount.push(jsonData);

        for (let j = 0; j < debrisCount.length; j++) {
            if (debrisCount[j].value === 0) {
                return topTenCount.slice(0, j);
            }
        }

        return topTenCount;
    }

    let topTenCount = topTenOther();

    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("id", "svgChart")
        .append("g")
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

    // set the color scale
    var color = d3.scaleOrdinal()
        .domain(topTenCount)
        .range(["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab", "#e41a1c"]);

    // Compute the position of each group on the pie:
    var pie = d3.pie()
        .sort(null)
        .value(function (d) {
            return d.value.value;
        })

    var data_ready = pie(d3.entries(topTenCount));

    const arc = d3.arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.8);

    const outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    const tooltip = d3.select('#chart')
        .append('div')
        .style("opacity", 0)
        .attr('class', 'tooltip')
        .attr("id", "svgTooltip");

    tooltip.append('div')
        .attr('class', 'label');

    tooltip.append('div')
        .attr('class', 'count');

    tooltip.append('div')
        .attr('class', 'percent');

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg.selectAll('myPie')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', 'white')
        .on('mouseover', function (d) {
            tooltip.transition().duration(100).style("opacity", 1);
            const total = d3.sum(topTenCount.map(function (d) {
                return d.value;
            }));
            const percent = Math.round(1000 * d.value / total) / 10;
            tooltip.select('.label').html(d.data.value.debris.replace('_', ' '));
            tooltip.select('.count').html(d.data.value.value + ' pieces');
            tooltip.select('.percent').html(percent + '%');

            d3.select(this).transition().duration(100)
                .attr('opacity', '.85')
        })
        .on('mousemove', function (d) {
            tooltip.style("left", 305 + "px")
                .style("top", 260 + "px");
        })
        .on('mouseout', function () {
            tooltip.transition().duration(100).style("opacity", 0);
            d3.select(this).transition().duration(100)
                .attr('opacity', '1')
        })
        .transition()
        .delay(function (d, i) {
            return i * 300;
        })
        .attr('fill', function (d) {
            return (color(d.data.key))
        })
        .attrTween('d', function (d) {
            var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
            return function (t) {
                d.endAngle = i(t);
                return arc(d);
            }
        });


    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 0)  // space legend
        .attr("y", -280)
        .attr("class", "legend")    // style the legend
        .style("fill", 'black')
        .attr("font-weight", 700)
        .text(countryName);

    // Add the polylines between chart and labels:
    svg.selectAll('allPolylines')
        .data(data_ready)
        .enter()
        .append('polyline')
        .attr("stroke", "black")
        .style("fill", "none")
        .attr("stroke-width", 1)
        .transition()
        .delay(function (d, i) {
            return i * 300;
        })
        .attr('points', function (d) {
            var posA = arc.centroid(d) // line insertion in the slice
            var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
            var posC = outerArc.centroid(d); // Label position = almost the same as posB
            var migAngle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
            posC[0] = radius * 0.95 * (migAngle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
            return [posA, posB, posC];
        });

    // Add the polylines between chart and labels:
    svg.selectAll('allLabels')
        .data(data_ready)
        .enter()
        .append('text')
        .transition()
        .delay(function (d, i) {
            return i * 300;
        })
        .text(function (d) {
            return d.data.value.debris.replace('_', ' ');
        })
        .style('font-size', '12px')
        .attr('transform', function (d) {
            var pos = outerArc.centroid(d);
            var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
            pos[0] = radius * 0.99 * (midAngle < Math.PI ? 1 : -1);
            return 'translate(' + pos + ')';
        })
        .style('text-anchor', function (d) {
            var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midAngle < Math.PI ? 'start' : 'end')
        });
}

function populateDropdownSelect(allDataCount) {
    let allKeys = [];
    for (let i = 0; i < allDataCount.length; i++) {
        allKeys.push(allDataCount[i].country);
    }

    allKeys.sort();

    const wrapper = document.getElementById('wrapper');
    const select = document.createElement("select");
    const label = document.createElement("label");
    select.className = 'form-control';
    select.id = 'selectCountries';
    label.htmlFor = "selectCountries";

    select.addEventListener(
        'change',
        function () {
            const x = document.getElementById("selectCountries").value;
            for (let i = 0; i < allDataCount.length; i++) {
                if (x === allDataCount[i].country) {
                    const svgObj = document.getElementById("svgChart");
                    const svgTooltip = document.getElementById("svgChart");
                    if (svgObj) {
                        svgObj.remove();
                        svgTooltip.remove();
                    }
                    donutChart(allDataCount[i].value, allDataCount[i].country);
                    break;
                }
            }
        },
        false
    );

    wrapper.appendChild(label);
    wrapper.appendChild(select);

    const option = document.createElement("option");
    option.value = "All Countries";
    option.innerHTML = "All Countries";
    select.appendChild(option);

    const blankLine = document.createElement("hr");
    select.appendChild(blankLine);

    // Creation of the input with radio type and the labels
    for (let i = 0; i < allKeys.length; i++) {
        if (allKeys[i] !== "All Countries") {
            const option = document.createElement("option");

            option.value = allKeys[i];
            option.innerHTML = allKeys[i];

            select.appendChild(option);
        }
    }
}

function allCountriesData() {
    let debrisCount = [
        {debris: "Cigarette_Butts", value: 0},
        {debris: "Food_Wrappers", value: 0},
        {debris: "Take_Out/Away_Containers_(Plastic)", value: 0},
        {debris: "Take_Out/Away_Containers_(Foam)", value: 0},
        {debris: "Bottle_Caps_(Plastic)", value: 0},
        {debris: "Bottle_Caps_(Metal)", value: 0},
        {debris: "Lids_(Plastic)", value: 0},
        {debris: "Straws_Stirrers", value: 0},
        {debris: "Forks_Knives_Spoons", value: 0},
        {debris: "Beverage_Bottles_(Plastic)", value: 0},
        {debris: "Beverage_Bottles_(Glass)", value: 0},
        {debris: "Beverage_Cans", value: 0},
        {debris: "Grocery_Bags_(Plastic)", value: 0},
        {debris: "Other_Plastic_Bags", value: 0},
        {debris: "Paper_Bags", value: 0},
        {debris: "Cups_Plates_(Paper)", value: 0},
        {debris: "Cups_Plates_(Plastic)", value: 0},
        {debris: "Cups_Plates_(Foam)", value: 0},
        {debris: "Fishing_Buoys_Pots_&_Traps", value: 0},
        {debris: "Fishing_Net_&_Pieces", value: 0},
        {debris: "Fishing_Line", value: 0},
        {debris: "Rope", value: 0},
        {debris: "Fishing_Gear", value: 0},
        {debris: "6-Pack_Holders", value: 0},
        {debris: "Other_Plastic/Foam_Packaging", value: 0},
        {debris: "Other_Plastic_Bottles", value: 0},
        {debris: "Strapping_Bands", value: 0},
        {debris: "Tobacco_Packaging/Wrap", value: 0},
        {debris: "Other_Packaging", value: 0},
        {debris: "Beverages_Sachets", value: 0},
        {debris: "Appliances", value: 0},
        {debris: "Balloons", value: 0},
        {debris: "Cigar_Tips", value: 0},
        {debris: "Cigarette_Lighters", value: 0},
        {debris: "Construction_Materials", value: 0},
        {debris: "Fireworks", value: 0},
        {debris: "Tires", value: 0},
        {debris: "Toys", value: 0},
        {debris: "Other_Trash", value: 0},
        {debris: "E-cigarettes", value: 0},
        {debris: "Other_tobacco", value: 0},
        {debris: "Condoms", value: 0},
        {debris: "Diapers", value: 0},
        {debris: "Syringes", value: 0},
        {debris: "Tampons/Tampon_Applicators", value: 0},
        {debris: "Personal_Hygiens", value: 0},
        {debris: "Gloves_&_Masks_(PPE)", value: 0},
        // {debris: "Foam_Pieces", value: 0},
        // {debris: "Glass_Pieces", value: 0},
        // {debris: "Plastic_Pieces", value: 0},
    ];

    for (let i = 0; i < dataset.length - 1; i++) {
        for (let key in dataset[i]) if (dataset[i].hasOwnProperty(key)) {
            for (let j = 0; j < debrisCount.length; j++) {
                if (key === debrisCount[j].debris) {
                    debrisCount[j].value += parseFloat(dataset[i][key]);
                    break;
                }
            }
        }
    }

    return debrisCount;
}

function prepareData() {
    let allDataCount = [];
    let allCountriesCount = allCountriesData();
    let jsonData = {};
    jsonData['country'] = 'All Countries';
    jsonData['value'] = allCountriesCount;

    allDataCount.push(jsonData);

    let debrisCount = [
        {debris: "Cigarette_Butts", value: 0},
        {debris: "Food_Wrappers", value: 0},
        {debris: "Take_Out/Away_Containers_(Plastic)", value: 0},
        {debris: "Take_Out/Away_Containers_(Foam)", value: 0},
        {debris: "Bottle_Caps_(Plastic)", value: 0},
        {debris: "Bottle_Caps_(Metal)", value: 0},
        {debris: "Lids_(Plastic)", value: 0},
        {debris: "Straws_Stirrers", value: 0},
        {debris: "Forks_Knives_Spoons", value: 0},
        {debris: "Beverage_Bottles_(Plastic)", value: 0},
        {debris: "Beverage_Bottles_(Glass)", value: 0},
        {debris: "Beverage_Cans", value: 0},
        {debris: "Grocery_Bags_(Plastic)", value: 0},
        {debris: "Other_Plastic_Bags", value: 0},
        {debris: "Paper_Bags", value: 0},
        {debris: "Cups_Plates_(Paper)", value: 0},
        {debris: "Cups_Plates_(Plastic)", value: 0},
        {debris: "Cups_Plates_(Foam)", value: 0},
        {debris: "Fishing_Buoys_Pots_&_Traps", value: 0},
        {debris: "Fishing_Net_&_Pieces", value: 0},
        {debris: "Fishing_Line", value: 0},
        {debris: "Rope", value: 0},
        {debris: "Fishing_Gear", value: 0},
        {debris: "6-Pack_Holders", value: 0},
        {debris: "Other_Plastic/Foam_Packaging", value: 0},
        {debris: "Other_Plastic_Bottles", value: 0},
        {debris: "Strapping_Bands", value: 0},
        {debris: "Tobacco_Packaging/Wrap", value: 0},
        {debris: "Other_Packaging", value: 0},
        {debris: "Beverages_Sachets", value: 0},
        {debris: "Appliances", value: 0},
        {debris: "Balloons", value: 0},
        {debris: "Cigar_Tips", value: 0},
        {debris: "Cigarette_Lighters", value: 0},
        {debris: "Construction_Materials", value: 0},
        {debris: "Fireworks", value: 0},
        {debris: "Tires", value: 0},
        {debris: "Toys", value: 0},
        {debris: "Other_Trash", value: 0},
        {debris: "E-cigarettes", value: 0},
        {debris: "Other_tobacco", value: 0},
        {debris: "Condoms", value: 0},
        {debris: "Diapers", value: 0},
        {debris: "Syringes", value: 0},
        {debris: "Tampons/Tampon_Applicators", value: 0},
        {debris: "Personal_Hygiens", value: 0},
        {debris: "Gloves_&_Masks_(PPE)", value: 0},
        // {debris: "Foam_Pieces", value: 0},
        // {debris: "Glass_Pieces", value: 0},
        // {debris: "Plastic_Pieces", value: 0},
    ];

    let allKeys = [];

    for (let i = 0; i < dataset.length - 1; i++) {
        for (let key in dataset[i]) if (dataset[i].hasOwnProperty(key)) {
            for (let j = 0; j < debrisCount.length; j++) {
                if (key === debrisCount[j].debris) {
                    debrisCount[j].value += parseFloat(dataset[i][key]);
                    break;
                }
            }
        }
    }

    for (let i = 0; i < dataset.length - 1; i++) {
        let country = dataset[i]['Country']

        if (allKeys.includes(country)) {
            for (let j = 0; j < allDataCount.length; j++) {
                if (country === allDataCount[j].country) {
                    let cDebrisCount = allDataCount[j].value;
                    for (let key in dataset[i]) if (dataset[i].hasOwnProperty(key)) {
                        for (let j = 0; j < cDebrisCount.length; j++) {
                            if (key === cDebrisCount[j].debris) {
                                cDebrisCount[j].value += parseFloat(dataset[i][key]);
                                break;
                            }
                        }
                    }
                    break;
                }
            }
        } else {
            let jsonData = {};
            jsonData['country'] = country;

            debrisCount = [
                {debris: "Cigarette_Butts", value: 0},
                {debris: "Food_Wrappers", value: 0},
                {debris: "Take_Out/Away_Containers_(Plastic)", value: 0},
                {debris: "Take_Out/Away_Containers_(Foam)", value: 0},
                {debris: "Bottle_Caps_(Plastic)", value: 0},
                {debris: "Bottle_Caps_(Metal)", value: 0},
                {debris: "Lids_(Plastic)", value: 0},
                {debris: "Straws_Stirrers", value: 0},
                {debris: "Forks_Knives_Spoons", value: 0},
                {debris: "Beverage_Bottles_(Plastic)", value: 0},
                {debris: "Beverage_Bottles_(Glass)", value: 0},
                {debris: "Beverage_Cans", value: 0},
                {debris: "Grocery_Bags_(Plastic)", value: 0},
                {debris: "Other_Plastic_Bags", value: 0},
                {debris: "Paper_Bags", value: 0},
                {debris: "Cups_Plates_(Paper)", value: 0},
                {debris: "Cups_Plates_(Plastic)", value: 0},
                {debris: "Cups_Plates_(Foam)", value: 0},
                {debris: "Fishing_Buoys_Pots_&_Traps", value: 0},
                {debris: "Fishing_Net_&_Pieces", value: 0},
                {debris: "Fishing_Line", value: 0},
                {debris: "Rope", value: 0},
                {debris: "Fishing_Gear", value: 0},
                {debris: "6-Pack_Holders", value: 0},
                {debris: "Other_Plastic/Foam_Packaging", value: 0},
                {debris: "Other_Plastic_Bottles", value: 0},
                {debris: "Strapping_Bands", value: 0},
                {debris: "Tobacco_Packaging/Wrap", value: 0},
                {debris: "Other_Packaging", value: 0},
                {debris: "Beverages_Sachets", value: 0},
                {debris: "Appliances", value: 0},
                {debris: "Balloons", value: 0},
                {debris: "Cigar_Tips", value: 0},
                {debris: "Cigarette_Lighters", value: 0},
                {debris: "Construction_Materials", value: 0},
                {debris: "Fireworks", value: 0},
                {debris: "Tires", value: 0},
                {debris: "Toys", value: 0},
                {debris: "Other_Trash", value: 0},
                {debris: "E-cigarettes", value: 0},
                {debris: "Other_tobacco", value: 0},
                {debris: "Condoms", value: 0},
                {debris: "Diapers", value: 0},
                {debris: "Syringes", value: 0},
                {debris: "Tampons/Tampon_Applicators", value: 0},
                {debris: "Personal_Hygiens", value: 0},
                {debris: "Gloves_&_Masks_(PPE)", value: 0},
                // {debris: "Foam_Pieces", value: 0},
                // {debris: "Glass_Pieces", value: 0},
                // {debris: "Plastic_Pieces", value: 0},
            ];

            for (let key in dataset[i]) if (dataset[i].hasOwnProperty(key)) {
                for (let j = 0; j < debrisCount.length; j++) {
                    if (key === debrisCount[j].debris) {
                        debrisCount[j].value += parseFloat(dataset[i][key]);
                        break;
                    }
                }
            }

            jsonData['value'] = debrisCount;
            allDataCount.push(jsonData);

            allKeys = [];
            for (let i = 0; i < allDataCount.length; i++) {
                allKeys.push(allDataCount[i].country);
            }
        }
    }

    populateDropdownSelect(allDataCount);

    return allDataCount;
}

let dataset;

window.onload = init;
