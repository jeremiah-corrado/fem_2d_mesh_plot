var meta_data = {};

var edge_quant_data = {};
var cell_quant_data = {};
var cell_quant_to_draw = "none";
var edge_quant_to_draw = "none";

const trap_inlet = 0.125;

var gui_data = {
    h_type: document.getElementById("h-level-dir-menu").value,
    h_min: 0,
    h_max: 1,
    z_scale: Number.parseFloat(document.getElementById("h-slider").value) / 100.0,
    cell_alpha: Number.parseFloat(document.getElementById("alpha-slider").value),
    map_colors: "none",
    hue_map_fn: (value) => { return 200; },
    sat_map_fn: (value) => { return 80; },
    bri_map_fn: (value) => { return 80; },
    fill_map_fn: (value, alpha) => { fill(255) },
    center: {
        x: 0.0,
        y: 0.0,
        z: 0.0,
    },
    color_bounds: {
        min: Number.parseInt(document.getElementById("color-scale-min").value),
        max: Number.parseInt(document.getElementById("color-scale-max").value),
    },
    color_key_type: "proc",
    hsb_settings: {
        hue: {
            mid: 180,
            var: 90,
        },
        sat: {
            mid: 50,
            var: 25,
        },
        bri: {
            mid: 50,
            var: 25,
        },
    },
    color_key: {
        x: Number.parseInt(document.getElementById("x-slider").value) * 10,
        y: Number.parseInt(document.getElementById("y-slider").value) * 10,
        z: Number.parseInt(document.getElementById("z-slider").value) * 10,
    },
    active_edge_weight: Number.parseInt(document.getElementById("active-edge-weight").value),
    active_edge_color: document.getElementById("active-edge-color").value,
}

var raw_data = get_default_raw_data();
var intermediate_data = get_intermediate_data();
var plot_data = get_plot_data();

get_inheritance_lines();
set_cell_fill_states();

var font;
var canvas_main;

function preload() {
    font = loadFont('Roboto-Regular.ttf');
}

function setup() {
    canvas_main = createCanvas(1000, 800, WEBGL).parent('canvas-container');
    colorMode(HSB, 360, 100, 100, 100);
    rectMode(CENTER);

    textFont(font);
    textSize(width / 15);
    textAlign(CENTER, CENTER);

    perspective(5 * PI / 25, width / height, 0.5, 10000);

    raw_data = get_default_raw_data();
    intermediate_data = get_intermediate_data();
    plot_data = get_plot_data();

    get_inheritance_lines();
    set_cell_fill_states();
}

function draw() {
    background(255);
    orbitControl(2, 2, 0.025);

    if (gui_data.map_colors !== "none") {
        push();
        translate(gui_data.color_key.x, gui_data.color_key.y, gui_data.color_key.z);
        draw_color_key();
        pop();
    }

    push();
    scale(height / 2.5);
    rotateX(PI / 2);
    translate(gui_data.center.x, gui_data.center.y, gui_data.center.z);

    if (gui_data.show_inheritance) {
        strokeWeight(1);
        stroke(0);
        plot_inheritance_lines();
    }

        plot_nodes();
        plot_edges();
        plot_cells();
        if (cell_quant_to_draw !== "none") {
            plot_cell_quantity();
        }
        if (edge_quant_to_draw !== "none") {
            plot_edge_quantity();
        }

    if (gui_data.show_cell_ids) {
        fill(0);
        noStroke();
        plot_cell_ids();
    }
    pop();
}

function plot_cells() {
    plot_data.Cells.filter(c => c.show_fill).forEach(cell => {
        push();
        translate(0, 0, cell.h[gui_data.h_type] * gui_data.z_scale);

        if (gui_data.show_active_geo) strokeWeight(2); else strokeWeight(3);

        if (gui_data.show_active_geo && !cell.active) {
            // outline
            stroke(0);
            noFill();
            rect(cell.geom.cx, cell.geom.cy, cell.geom.wx, cell.geom.wy);

            if (cell.has_active_edges || cell.has_active_nodes) {
                // inner trapezoids
                const wx = cell.geom.wx * trap_inlet;
                const wy = cell.geom.wy * trap_inlet;

                const trap = (n0, n1, s1, s2, s3, s4) => {
                    const p0 = [plot_data.Nodes[cell.geom.nodes[n0]].x, plot_data.Nodes[cell.geom.nodes[n0]].y];
                    const p1 = [plot_data.Nodes[cell.geom.nodes[n1]].x, plot_data.Nodes[cell.geom.nodes[n1]].y];
                    beginShape();
                    vertex(p0[0], p0[1]);
                    vertex(p1[0], p1[1]);
                    vertex(p1[0] + wx * s1, p1[1] + wy * s2);
                    vertex(p0[0] + wx * s3, p0[1] + wy * s4);
                    endShape(CLOSE);
                }

                noStroke();

                // switch (gui_data.map_colors) {
                //     case "none": fill(50, gui_data.cell_alpha); break;
                //     case "both": fill(gui_data.hue_map_fn(cell.p.u), gui_data.sat_map_fn(cell.p.u), gui_data.bri_map_fn(cell.p.u), gui_data.cell_alpha); break;
                //     case "u": fill(gui_data.hue_map_fn(cell.p.u), gui_data.sat_map_fn(cell.p.u), gui_data.bri_map_fn(cell.p.u), gui_data.cell_alpha); break;
                //     case "v": fill(gui_data.hue_map_fn(cell.p.v), gui_data.sat_map_fn(cell.p.v), gui_data.bri_map_fn(cell.p.v), gui_data.cell_alpha); break;
                // }

                switch (gui_data.map_colors) {
                    case "none": fill(50, gui_data.cell_alpha); break;
                    case "both": gui_data.fill_map_fn(cell.p.u, gui_data.cell_alpha); break;
                    case "u": gui_data.fill_map_fn(cell.p.u, gui_data.cell_alpha); break;
                    case "v": gui_data.fill_map_fn(cell.p.v, gui_data.cell_alpha); break;
                }

                trap(0, 1, -1, -1, 1, -1);
                trap(2, 3, -1, 1, 1, 1);

                switch (gui_data.map_colors) {
                    case "none": fill(50, gui_data.cell_alpha); break;
                    case "both": gui_data.fill_map_fn(cell.p.v, gui_data.cell_alpha); break;
                    case "u": gui_data.fill_map_fn(cell.p.u, gui_data.cell_alpha); break;
                    case "v": gui_data.fill_map_fn(cell.p.v, gui_data.cell_alpha); break;
                }

                trap(0, 2, 1, 1, 1, -1);
                trap(1, 3, -1, 1, -1, -1);

                stroke(0);
                strokeWeight(1);
                noFill();
                rect(cell.geom.cx, cell.geom.cy, cell.geom.wx * (1 - 2 * trap_inlet), cell.geom.wy * (1 - 2 * trap_inlet));
            }
        } else {
            // outline
            stroke(0);

            // switch (gui_data.map_colors) {
            //     case "none": fill(50, gui_data.cell_alpha); break;
            //     case "both": noFill(); break;
            //     case "u": fill(gui_data.hue_map_fn(cell.p.u), gui_data.sat_map_fn(cell.p.u), gui_data.bri_map_fn(cell.p.u), gui_data.cell_alpha); break;
            //     case "v": fill(gui_data.hue_map_fn(cell.p.v), gui_data.sat_map_fn(cell.p.v), gui_data.bri_map_fn(cell.p.v), gui_data.cell_alpha); break;
            // }
            switch (gui_data.map_colors) {
                case "none": fill(50, gui_data.cell_alpha); break;
                case "both": noFill(); break;
                case "u": gui_data.fill_map_fn(cell.p.u, gui_data.cell_alpha); break;
                case "v": gui_data.fill_map_fn(cell.p.v, gui_data.cell_alpha); break;
            }
            rect(cell.geom.cx, cell.geom.cy, cell.geom.wx, cell.geom.wy);

            // inner triangles  
            if (gui_data.map_colors === "both") {
                const triangle = (n0, n1) => {
                    beginShape();
                    vertex(plot_data.Nodes[cell.geom.nodes[n0]].x, plot_data.Nodes[cell.geom.nodes[n0]].y);
                    vertex(plot_data.Nodes[cell.geom.nodes[n1]].x, plot_data.Nodes[cell.geom.nodes[n1]].y);
                    vertex(cell.geom.cx, cell.geom.cy);
                    endShape(CLOSE);
                }

                noStroke();

                // fill(gui_data.hue_map_fn(cell.p.u), gui_data.sat_map_fn(cell.p.u), gui_data.bri_map_fn(cell.p.u), gui_data.cell_alpha);
                gui_data.fill_map_fn(cell.p.u, gui_data.cell_alpha);
                triangle(0, 1);
                triangle(2, 3);

                // fill(gui_data.hue_map_fn(cell.p.v), gui_data.sat_map_fn(cell.p.v), gui_data.bri_map_fn(cell.p.v), gui_data.cell_alpha);
                gui_data.fill_map_fn(cell.p.v, gui_data.cell_alpha);
                triangle(0, 2);
                triangle(1, 3);
            }
        }
        pop();
    });
}

function plot_edges() {
    plot_data.Edges.forEach(e => {
        if (gui_data.show_active_geo) {
            stroke(color(gui_data.active_edge_color));
            strokeWeight(gui_data.active_edge_weight);

            e.active_cells.forEach(active_cell_id => {
                push();
                    translate(0, 0, plot_data.Cells[active_cell_id].h[gui_data.h_type] * gui_data.z_scale);
                    line(e.n0[0], e.n0[1], e.n1[0], e.n1[1]);
                pop();
            });
        }
    });
}

function plot_nodes() {
    plot_data.Nodes.forEach(n => {
        if (gui_data.show_active_geo && n.active_level !== null) {
            stroke(color(gui_data.active_edge_color));
            strokeWeight(gui_data.active_edge_weight + 3);
            
            push();
                translate(0, 0, n.active_level * gui_data.z_scale);
                point(n.x, n.y);
            pop();
        }
    });
}

function plot_inheritance_lines() {
    plot_data.InheritanceLines.forEach(line_spec => {
        line(line_spec.x, line_spec.y, line_spec.z0 * gui_data.z_scale, line_spec.x, line_spec.y, line_spec.z1 * gui_data.z_scale);
    });
}

function plot_cell_ids() {
    plot_data.Cells.forEach(cell => {
        push();
        textSize(cell.fs);
        translate(cell.geom.cx, cell.geom.cy, cell.h[gui_data.h_type] * gui_data.z_scale + 0.01);
        text(cell.id, 0, 0);
        pop();
    });
}

function draw_color_key() {
    const key_width = 400;
    const key_height = 65;

    //outline
    noFill();
    stroke(0);
    strokeWeight(3);
    rect(0, 0, key_width, key_height);

    let num_intervals = gui_data.color_bounds.max - gui_data.color_bounds.min + 1;
    let size_step = key_width / num_intervals;
    let offset = size_step / 2.0;

    strokeWeight(1);
    textSize(Math.log(size_step / 2) * 10);
    for (let i = 0; i < num_intervals; i++) {
        // fill(
        //     gui_data.hue_map_fn(i + gui_data.color_bounds.min),
        //     gui_data.sat_map_fn(i + gui_data.color_bounds.min),
        //     gui_data.bri_map_fn(i + gui_data.color_bounds.min),
        //     gui_data.cell_alpha
        // );
        gui_data.fill_map_fn(i + gui_data.color_bounds.min, gui_data.cell_alpha);
        rect(i * size_step - key_width / 2 + offset, 0, size_step, key_height);

        push();
        fill(0);
        translate(0, 0, 0.125);
        text((i + gui_data.color_bounds.min).toString(), i * size_step - key_width / 2 + offset, 0);
        pop();
    }
}

function plot_cell_quantity() {
    const min = cell_quant_data[cell_quant_to_draw].min;
    const max = cell_quant_data[cell_quant_to_draw].max;

    cell_quant_data[cell_quant_to_draw].values.forEach((cell_value, cell_index) => {
        const cell = plot_data.Cells[cell_index];

        push();
        translate(0, 0, cell.h[gui_data.h_type] * gui_data.z_scale * 1.005);
            noStroke();
            fill(map(cell_value, min, max, 0, 180), 255, 255);
            rect(cell.geom.cx, cell.geom.cy, cell.geom.wx * 0.8, cell.geom.wy * 0.8);

        pop();
    });
}

function plot_edge_quantity() {
    const min = edge_quant_data[edge_quant_to_draw].min;
    const max = edge_quant_data[edge_quant_to_draw].max;

    strokeWeight(4);

    edge_quant_data[edge_quant_to_draw].values.forEach((edge_values, cell_index) => {
        const cell = plot_data.Cells[cell_index];
        push();
            translate(0, 0, cell.h[gui_data.h_type] * gui_data.z_scale * 1.005);

            const points = [
                [cell.geom.cx - cell.geom.wx * 0.4, cell.geom.cy - cell.geom.wy * 0.4],
                [cell.geom.cx - cell.geom.wx * 0.4, cell.geom.cy + cell.geom.wy * 0.4],
                [cell.geom.cx + cell.geom.wx * 0.4, cell.geom.cy + cell.geom.wy * 0.4],
                [cell.geom.cx + cell.geom.wx * 0.4, cell.geom.cy - cell.geom.wy * 0.4]
            ];

            //left
            stroke(map(edge_values[2], min, max, 0, 180), 255, 255);
            line(points[0][0], points[0][1], points[1][0], points[1][1]);

            //bottom
            stroke(map(edge_values[0], min, max, 0, 180), 255, 255);
            line(points[1][0], points[1][1], points[2][0], points[2][1]);

            //right
            stroke(map(edge_values[3], min, max, 0, 180), 255, 255);
            line(points[2][0], points[2][1], points[3][0], points[3][1]);

            //top
            stroke(map(edge_values[1], min, max, 0, 180), 255, 255);
            line(points[3][0], points[3][1], points[0][0], points[0][1]);

        pop();
    });
}