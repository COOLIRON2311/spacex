import { SpaceX } from "./api/spacex";
import * as d3 from "d3";
import * as Geo from './geo.json';

document.addEventListener("DOMContentLoaded", setup);

function setup() {
    const spaceX = new SpaceX();
    spaceX.launches().then(data => {
        const listContainer = document.getElementById("listContainer");
        renderLaunches(data, listContainer);
        drawMap();
    });
}
function renderLaunches(launches, container) {
    const list = document.createElement("ul");
    list.className = "list-group";
    launches.forEach(launch => {
        const item = document.createElement("li");
        item.className = "list-group-item";
        item.innerHTML = launch.name;
        list.appendChild(item);
    });
    container.replaceChildren(list);
}

function drawMap() {
    // const width = 640;
    // const height = 480;
    const width = 800;
    const height = 600;
    // const margin = { top: 20, right: 10, bottom: 40, left: 100 };
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const svg = d3.select('#map').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    const projection = d3.geoMercator()
        // .scale(70)
        .scale(100)
        // .center([0, 20])
        .center([-50, 0])
        .translate([width / 2 - margin.left, height / 2]);
    svg.append("g")
        .selectAll("path")
        .data(Geo.features)
        .enter()
        .append("path")
        .attr("class", "topo")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // .attr("fill", function (d) {
        //     return colorScale(0);
        // })
        .style("opacity", .7);
}
