function init() {
    d3.csv("../DetailedSummary-Earth_Modified.csv").then(function (data) {
        dataset = data;
        let monthCount = prepareData();
        let dataset2 = [];
        dataset2.push(monthCount[0]); // All Countries
        lineChartSelectedCountries(dataset2);
    }).catch(function (error) {
        alert(error.message);
    });
}

function lineChartSelectedCountries(selectedMonthCount) {
    const w = 900;
    const h = 600;

    const axisPadding = 55;

    let allGroups = [];
    for (let i = 0; i < selectedMonthCount.length; i++) {
        allGroups.push(selectedMonthCount[i].country);
    }

    const myColor = d3.scaleOrdinal()
        .domain(allGroups)
        .range(d3.schemeSet1);

    let allKeys = ['October 19', 'November 19', 'December 19', 'January 20', 'February 20',
        'March 20', 'April 20', 'May 20', 'June 20', 'July 20', 'August 20', 'September 20'];

    let dataset2 = [];
    for (let i = 0; i < selectedMonthCount.length; i++) {
        for (let j = 0; j < selectedMonthCount[i].value.length; j++) {
            let jsonData = {};
            jsonData['month'] = selectedMonthCount[i].value[j].month;
            jsonData['value'] = selectedMonthCount[i].value[j].value;
            jsonData['country'] = selectedMonthCount[i].country;
            dataset2.push(jsonData);
        }
    }

    const xScale = d3.scaleLinear()
        .domain([-0.5, 12])
        .range([axisPadding, w - axisPadding]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset2, function (d) {
            return d.value + Math.floor(d.value / 10);
        })])
        .range([h - axisPadding, axisPadding]);

    const line = d3.line()
        .x(function (d, i) {
            return xScale(i);
        })
        .y(function (d) {
            return yScale(d.value);
        })
        .curve(d3.curveMonotoneX);

    const formatKeys = function (d) {
        return allKeys[d % 50];
    };

    const xAxis = d3.axisBottom(xScale)
        .tickFormat(formatKeys);

    const yAxis = d3.axisLeft(yScale)
        .ticks(5);

    const svg = d3.select("#chart")
        .append("svg")
        .attr("id", "svgChart")
        .attr("width", w)
        .attr("height", h);

    svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(" + (0) + ", " + (h - axisPadding) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("transform", "translate(" + (axisPadding) + ", " + (0) + ")")
        .call(yAxis);

    // Add X axis label:
    svg.append("text")
        .attr("class", "AxisTitle")
        .attr("text-anchor", "end")
        .attr("x", w - axisPadding)
        .attr("y", h - 15)
        .text("Period");

    // Y axis label:
    svg.append("text")
        .attr("class", "AxisTitle")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("x", -axisPadding)
        .text("Total Clean-ups")

    svg.selectAll("myLines")
        .data(selectedMonthCount)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("id", function (d, i) {
            return "line" + i.toString();
        })
        .attr("d", function (d) {
            return line(d.value);
        })
        .attr("stroke", function (d) {
            return myColor(d.country);
        });

    const legendSpace = w / selectedMonthCount.length;

    svg.selectAll("myLegend")
        .data(selectedMonthCount)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("x", function (d, i) {
            return (legendSpace / 2) + i * legendSpace;
        })  // space legend
        .attr("y", axisPadding - 30)
        .attr("class", "legend")    // style the legend
        .style("fill", function (d, i) { // Add the colours dynamically
            return myColor(d.country);
        })
        .attr("font-weight", 700)
        .text(function (d) {
            return d.country;
        });

    for (let i = 0; i < selectedMonthCount.length; i++) {
        const id = "#line" + i.toString();

        const pathLength = svg.select(id).node().getTotalLength();

        svg.selectAll(id)
            .attr("stroke-dasharray", pathLength + " " + pathLength)
            .attr("stroke-dashoffset", pathLength)
            .transition() // Call Transition Method
            .duration(5000) // Set Duration timing (ms)
            .ease(d3.easeLinear) // Set Easing option
            .attr("stroke-dashoffset", 0);
    }

    const dots = svg.selectAll("myDots")
        .data(selectedMonthCount)
        .enter()
        .append('g')
        .style("fill", function (d) {
            return myColor(d.country);
        })
        // Second we need to enter in the 'values' part of this group
        .selectAll("myPoints")
        .data(function (d) {
            let dataList = [];
            for (let i = 0; i < d.value.length; i++) {
                let jsonData = {};
                jsonData['month'] = d.value[i].month;
                jsonData['value'] = d.value[i].value;
                jsonData['country'] = d.country;
                dataList.push(jsonData);
            }
            return dataList;
        })
        .enter()
        .append("circle")
        .attr("cx", function (d, i) {
            return xScale(i);
        })
        .attr("cy", function (d) {
            return yScale(d.value);
        })
        .attr("r", 5);

    // create a tooltip
    const tooltip = d3.select("#chart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .attr("text-anchor", "middle");

    dots
        .on("mouseover", function (d, i) {
            tooltip.transition().duration(100).style("opacity", 1);
            d3.select(this).transition().duration(100)
                .style("fill", "white")
                .style("stroke", myColor(d.country))
                .style("stroke-width", "5")
                .attr("r", 7);
        })
        .on("mousemove", function (d) {
            tooltip
                .html("Total Clean-ups: " + d.value)
                .style("left", (d3.mouse(this)[0] - 140) + "px")
                .style("top", (d3.mouse(this)[1] - 50) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition().duration(100).style("opacity", 0);
            d3.select(this).transition().duration(100)
                .style("fill", myColor(d.country))
                .style("stroke-width", "0")
                .attr("r", 5);
            // svg_aline.style("display", "None")
        });

    dots.style("opacity", 0)
        .transition()
        .delay(function (d, i) {
            return i * (5000 / 11);
        })
        .style("opacity", 1);

}

function populateRadioList(allDataCount) {
    let allKeys = [];
    for (let i = 0; i < allDataCount.length; i++) {
        allKeys.push(allDataCount[i].country);
    }

    allKeys.sort();

    const wrapper = document.getElementById('wrapper');

    // Creation of the input with radio type and the labels
    for (let i = 0; i < allKeys.length; i++) {
        if (allKeys[i] !== "All Countries") {
            const formCheck = document.createElement("div");
            formCheck.className = "form-check";

            wrapper.appendChild(formCheck);

            const checkBox = document.createElement("input");
            const label = document.createElement("label");
            checkBox.type = "checkbox";
            checkBox.className = "form-check-input";
            checkBox.id = allKeys[i].replace(" ", "_");
            checkBox.value = allKeys[i];
            checkBox.setAttribute("name", "country[]");

            label.className = "form-check-label";
            label.htmlFor = allKeys[i].replace(" ", "_");

            formCheck.appendChild(checkBox);
            formCheck.appendChild(label);
            label.appendChild(document.createTextNode(allKeys[i]));
        }
    }

    let checkedValue = [];
    let filteredDataset = [];

    let ele = document.getElementById('filterForm');
    ele.addEventListener("submit", function (e) {
        e.preventDefault();
        checkedValue = [];
        const inputElements = document.getElementsByClassName('form-check-input');
        for (let i = 0; i < inputElements.length; i++) {
            if (inputElements[i].checked) {
                checkedValue.push(inputElements[i].value);
            }
        }

        filteredDataset = [];
        for (let i = 0; i < allDataCount.length; i++) {
            if (checkedValue.includes(allDataCount[i].country)) {
                filteredDataset.push(allDataCount[i]);
            }
        }

        bridge(filteredDataset);
    }, false);
}

function bridge(filteredDataset) {
    const svgObj = document.getElementById("svgChart");
    if (svgObj) {
        svgObj.remove();
    }
    lineChartSelectedCountries(filteredDataset);
}

function prepareData() {
    let allDataCount = [];
    let allCountriesCount = allCountriesData();
    let jsonData = {};
    jsonData['country'] = 'All Countries';
    jsonData['value'] = allCountriesCount;

    allDataCount.push(jsonData);

    let monthCount = [
        {month: "October", value: 0},
        {month: "November", value: 0},
        {month: "December", value: 0},
        {month: "January", value: 0},
        {month: "February", value: 0},
        {month: "March", value: 0},
        {month: "April", value: 0},
        {month: "May", value: 0},
        {month: "June", value: 0},
        {month: "July", value: 0},
        {month: "August", value: 0},
        {month: "September", value: 0},
    ];

    let allKeys = [];

    for (let i = 0; i < dataset.length - 1; i++) {
        let country = dataset[i]['Country']
        let date = dataset[i]['Cleanup_Date'];
        let month = date.split("/")[1];
        month = intToMonth(month);

        if (allKeys.includes(country)) {
            for (let j = 0; j < allDataCount.length; j++) {
                if (country === allDataCount[j].country) {
                    let cMonthCount = allDataCount[j].value;
                    for (let j = 0; j < cMonthCount.length; j++) {
                        if (month === cMonthCount[j].month) {
                            cMonthCount[j].value += 1;
                            break;
                        }
                    }
                    break;
                }
            }
        } else {
            let jsonData = {};
            jsonData['country'] = country;

            monthCount = [
                {month: "October", value: 0},
                {month: "November", value: 0},
                {month: "December", value: 0},
                {month: "January", value: 0},
                {month: "February", value: 0},
                {month: "March", value: 0},
                {month: "April", value: 0},
                {month: "May", value: 0},
                {month: "June", value: 0},
                {month: "July", value: 0},
                {month: "August", value: 0},
                {month: "September", value: 0},
            ];

            for (let j = 0; j < monthCount.length; j++) {
                if (month === monthCount[j].month) {
                    monthCount[j].value += 1;
                    break;
                }
            }

            jsonData['value'] = monthCount;
            allDataCount.push(jsonData);

            allKeys = [];
            for (let i = 0; i < allDataCount.length; i++) {
                allKeys.push(allDataCount[i].country);
            }
        }
    }

    populateRadioList(allDataCount);

    return allDataCount;
}

function allCountriesData() {
    let monthCount = [
        {month: "October", value: 0},
        {month: "November", value: 0},
        {month: "December", value: 0},
        {month: "January", value: 0},
        {month: "February", value: 0},
        {month: "March", value: 0},
        {month: "April", value: 0},
        {month: "May", value: 0},
        {month: "June", value: 0},
        {month: "July", value: 0},
        {month: "August", value: 0},
        {month: "September", value: 0},
    ];

    let allKeys = [];
    for (let i = 0; i < monthCount.length; i++) {
        allKeys.push(monthCount[i].month);
    }

    for (let i = 0; i < dataset.length - 1; i++) {

        let date = dataset[i]['Cleanup_Date'];
        let month = date.split("/")[1];
        month = intToMonth(month);

        if (allKeys.includes(month)) {
            for (let j = 0; j < monthCount.length; j++) {
                if (month === monthCount[j].month) {
                    monthCount[j].value += 1;
                    break;
                }
            }
        }
    }

    return monthCount;
}

function intToMonth(int) {
    let month = '';
    if (int === '1') {
        month = 'January';
    } else if (int === '2') {
        month = 'February';
    } else if (int === '3') {
        month = 'March';
    } else if (int === '4') {
        month = 'April';
    } else if (int === '5') {
        month = 'May';
    } else if (int === '6') {
        month = 'June';
    } else if (int === '7') {
        month = 'July';
    } else if (int === '8') {
        month = 'August';
    } else if (int === '9') {
        month = 'September';
    } else if (int === '10') {
        month = 'October';
    } else if (int === '11') {
        month = 'November';
    } else if (int === '12') {
        month = 'December';
    }
    return month;
}

let dataset;

window.onload = init;
