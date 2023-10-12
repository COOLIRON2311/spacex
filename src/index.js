import { SpaceX } from "./api/spacex";
import * as d3 from "d3";
import * as Geo from './geo.json';

document.addEventListener("DOMContentLoaded", setup);

function setup() {
    const spaceX = new SpaceX();
    const listContainer = document.getElementById("listContainer");
    spaceX.launchpads().then(data => {
        const lp_map = new Map();
        const launchpads = [];
        data.forEach(lp => {
            lp_map[`L${lp.id}`] = 0;
            launchpads.push(
                {
                    "id": `L${lp.id}`,
                    "full_name": lp.full_name,
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lp.longitude, lp.latitude]
                    }
                }
            );
        });
        return { lp_map: lp_map, launchpads: launchpads };
    }).then(r => {
        spaceX.launches().then(data => {
            data.forEach(l => {
                r.lp_map[`L${l.launchpad}`]++;
            });
            renderLaunches(data, listContainer);
            drawMap(r.launchpads.filter(l => r.lp_map[l.id] > 0));
        });
    });
}

function highLightPoint(event) {
    const s1 = d3.selectAll(".norm_point");
    const s2 = d3.select(`#${event.target.getAttribute("lp")}`);
    s1.classed("off_point", true); // turn off all points
    s2.classed("off_point", false); // turn on target point
    s2.classed("norm_point", false); // disable normal state for target point
    s2.classed("high_point", true); // enable highlight state for target point
}

function toneDownPoint(event) {
    const s1 = d3.selectAll(".norm_point");
    const s2 = d3.select(`#${event.target.getAttribute("lp")}`);
    s1.classed("off_point", false); // turn on all points
    s2.classed("high_point", false); // disable highlight state for target point
    s2.classed("norm_point", true); // enable normal state for target point
}

function renderLaunches(launches, container) {
    const list = document.createElement("ul");
    list.className = "list-group";
    launches.forEach(launch => {
        const item = document.createElement("li");
        item.setAttribute("lp", `L${launch.launchpad}`);
        item.className = "list-group-item";
        item.innerHTML = launch.name;
        item.onmouseover = highLightPoint;
        item.onmouseleave = toneDownPoint;
        list.appendChild(item);
    });
    container.replaceChildren(list);
}

/**
 *
 * @param {Array} data
 */
function drawMap(data) {
    // console.log(data);
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
    const path = d3.geoPath()
        .projection(projection);
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
    svg.selectAll("point")
        .data(data)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", (v) => v.id)
        .attr("class", "norm_point");
}
