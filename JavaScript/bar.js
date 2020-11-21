function init() {
    d3.csv("../Assets/DetailedSummary-Earth_Modified.csv").then(function (data) {
        dataset = data;
        let countryCount = prepareData();
        // let dataset2 = [];
        // dataset2.push(monthCount[0]); // All Countries
        barChartSelectedAverage(countryCount, 'averageWeight');
    }).catch(function (error) {
        alert(error.message);
    });
}

function barChartSelectedAverage(countryCount, selected) {
    const w = 900;
    const h = 600;

    const xPadding = 150;
    const yPadding = 70;

    function topTenCountries() {
        function compare(a, b) {
            if (a[selected] < b[selected]) {
                return 1;
            }
            if (a[selected] > b[selected]) {
                return -1;
            }
            return 0;
        }

        countryCount.sort(compare);

        return countryCount.slice(0, 10);
    }

    let topTenCount = topTenCountries();

    let allKeys = [];
    let allValues = [];

    for (let j = 0; j < topTenCount.length; j++) {
        allKeys.push(topTenCount[j].country);
        allValues.push(topTenCount[j][selected]);
    }

    const formatKeys = function (d) {
        return allKeys[d % 50];
    };

    const xScale = d3.scaleBand()
        .domain(d3.range(topTenCount.length))
        .rangeRound([yPadding, w - yPadding])
        .paddingInner(0.02);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(allValues, function (d) {
            return d + Math.floor(d / 20);
        })])
        .range([h - xPadding, 20]);

    var xAxis = d3.axisBottom()
        .tickFormat(formatKeys)
        .scale(xScale);

    var yAxis = d3.axisLeft()
        .ticks(5)
        .scale(yScale);

    const svg = d3.select("#chart")
        .append("svg")
        .attr("id", "svgChart")
        .attr("width", w)
        .attr("height", h);

    const tooltip = d3.select('#chart')
        .append('div')
        .style("opacity", 0)
        .attr('class', 'tooltip')
        .attr("id", "svgTooltip");

    tooltip.append('div')
        .attr('class', 'average');

    tooltip.append('div')
        .attr('class', 'totalWeight');

    tooltip.append('div')
        .attr('class', 'totalCleanup');

    const rect = svg.selectAll("rect")
        .data(topTenCount)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return xScale(i);
        })
        .attr("y", function (d, i) {
            return yScale(0);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function (d, i) {
            return h - xPadding - yScale(0);
        })
        .attr("fill", "#e15759")
        .on('mouseover', function (d) {
            tooltip.transition().duration(100).style("opacity", 1);
            if (selected === 'averageWeight') {
                tooltip.select('.average').html('Average: ' + Math.round(d.averageWeight) + ' kg');
                tooltip.select('.totalWeight').html(Math.round(d.weight) + ' kg' + ' in');
            } else if (selected === 'averageDistance') {
                tooltip.select('.average').html('Average: ' + Math.round(d.averageDistance) + ' km');
                tooltip.select('.totalWeight').html(Math.round(d.distance) + ' km' + ' in');
            } else if (selected === 'averageNumberOfParticipants') {
                tooltip.select('.average').html('Average: ' + Math.round(d.averageNumberOfParticipants) + ' peoples');
                tooltip.select('.totalWeight').html(Math.round(d.people) + ' peoples' + ' in');
            }
            tooltip.select('.totalCleanup').html(d.totalCleanup + ' clean-ups');

            d3.select(this).transition().duration(100)
                .attr("fill", "#4e79a7");
        })
        .on('mousemove', function (d) {
            tooltip
                .style("left", (d3.mouse(this)[0] - 155) + "px")
                .style("top", (d3.mouse(this)[1] - 100) + "px");
        })
        .on('mouseout', function () {
            tooltip.transition().duration(100).style("opacity", 0);
            d3.select(this).transition().duration(100)
                .attr("fill", "#e15759");
        });

    svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", function (d) {
            return yScale(d[selected]);
        })
        .attr("height", function (d) {
            return h - xPadding - yScale(d[selected]);
        })
        .delay(function (d, i) {
            return (i * 200)
        })

    svg.append("g")
        .attr("transform", "translate(" + (0) + ", " + (h - xPadding) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    svg.append("g")
        .attr("transform", "translate(" + (yPadding) + ", " + (0) + ")")
        .call(yAxis);

    // Add X axis label:
    svg.append("text")
        .attr("class", "AxisTitle")
        .attr("text-anchor", "end")
        .attr("x", w - yPadding)
        .attr("y", h - xPadding + 70)
        .text("Countries");

    // Y axis label:
    svg.append("text")
        .attr("class", "AxisTitle")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", -20)
        .text(function () {
            if (selected === 'averageWeight') {
                return 'Average Weight (kg)';
            } else if (selected === 'averageDistance') {
                return 'Average Distance (km)';
            } else if (selected === 'averageNumberOfParticipants') {
                return 'Average Number of Participants';
            }
        })

}

function prepareData() {
    let countryCount = [];
    let allKeys = [];

    for (let i = 0; i < dataset.length - 1; i++) {
        let country = dataset[i]['Country'];
        let weight = parseFloat(dataset[i]['KGs']);
        let distance = parseFloat(dataset[i]['KM']);
        let people = parseFloat(dataset[i]['People']);
        if (allKeys.includes(country)) {
            for (let j = 0; j < countryCount.length; j++) {
                if (country === countryCount[j].country) {
                    countryCount[j].totalCleanup += 1;
                    countryCount[j].weight += weight;
                    countryCount[j].distance += distance;
                    countryCount[j].people += people;
                    break;
                }
            }
        } else {
            let jsonData = {};
            jsonData['country'] = country;
            jsonData['totalCleanup'] = 1;
            jsonData['weight'] = weight;
            jsonData['distance'] = distance;
            jsonData['people'] = people;

            countryCount.push(jsonData);

            allKeys = [];
            for (let i = 0; i < countryCount.length; i++) {
                allKeys.push(countryCount[i].country);
            }
        }
    }

    for (let i = 0; i < countryCount.length; i++) {
        countryCount[i]['averageWeight'] = countryCount[i].weight / countryCount[i].totalCleanup;
        countryCount[i]['averageDistance'] = countryCount[i].distance / countryCount[i].totalCleanup;
        countryCount[i]['averageNumberOfParticipants'] = countryCount[i].people / countryCount[i].totalCleanup;
    }

    return countryCount;
}

function updateChart() {
    let countryCount = prepareData();
    const x = document.getElementById("selectVariable").value;
    const svgObj = document.getElementById("svgChart");
    const heading = document.getElementById("heading");
    if (svgObj) {
        svgObj.remove();
    }
    if (x === 'averageWeight') {
        heading.innerHTML = 'Bar chart of Top 10 Countries in Average Weight of Debris Collected per Clean-up';
    } else if (x === 'averageDistance') {
        heading.innerText = 'Bar chart of Top 10 Countries in Average Distance Covered per Clean-up';
    } else if (x === 'averageNumberOfParticipants') {
        heading.innerText = 'Bar chart of Top 10 Countries in Average Number of Participants per Clean-up';
    }
    barChartSelectedAverage(countryCount, x);
}

let dataset;

window.onload = init;
