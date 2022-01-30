const color_dicts1 = {
    3: ['#edf8b1', '#7fcdbb', '#2c7fb8'],
    4: ['#ffffcc', '#a1dab4', '#41b6c4', '#225ea8'],
    5: ['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494'],
    6: ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#2c7fb8', '#253494'],
    7: ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84'],
    8: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84'],
    9: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
};

const color_dicts2 = {
    3: ['#ffeda0', '#feb24c', '#f03b20'],
    4: ['#ffffb2', '#fecc5c', '#fd8d3c', '#e31a1c'],
    5: ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'],
    6: ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'],
    7: ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#b10026'],
    8: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#b10026'],
    9: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
};

function get_intermediate_data() {
    const cells = raw_data.Elems.map(c => {
        return {
            id: c.id,
            h: {
                u: c.h_levels.u,
                v: c.h_levels.v,
                min: Math.min(c.h_levels.u, c.h_levels.v),
                max: Math.max(c.h_levels.u, c.h_levels.v),
            },
            p: {
                u: c.expansion.u,
                v: c.expansion.v,
            },
            active: c.active,
            has_active_edges: c.edges.reduce((acc, edge_id) => {
                const e = raw_data.Edges[edge_id];
                if (e.active_elems.length > 0) {
                    return acc || e.active_elems.includes(c.id);
                } else {
                    return acc;
                }
            }, false),
            nodes: c.nodes
        }
    });

    const edges = raw_data.Edges.map(e => {
        let related_cells = new Set();

        e.elems.forEach(side => {
            side.forEach(cell_object => {
                related_cells.add(cell_object.cell_id);
            });
        });

        let min_u_level = Number.MAX_SAFE_INTEGER;
        let min_v_level = Number.MAX_SAFE_INTEGER;
        let max_u_level = Number.MIN_SAFE_INTEGER;
        let max_v_level = Number.MIN_SAFE_INTEGER;

        for (let r_cell_id of related_cells) {
            let h = cells[r_cell_id].h;
            if (h.u < min_u_level) min_u_level = h.u;
            if (h.v < min_v_level) min_v_level = h.v;
            if (h.u > max_u_level) max_u_level = h.u;
            if (h.v > max_v_level) max_v_level = h.v;
        }

        return {
            id: e.id,
            n0: e.nodes[0],
            n1: e.nodes[1],
            min_levels: {
                u: min_u_level,
                v: min_v_level,
                min: Math.min(min_u_level, min_v_level),
                max: Math.max(min_u_level, min_v_level)
            },
            max_levels: {
                u: max_u_level,
                v: max_v_level,
                min: Math.min(max_u_level, max_v_level),
                max: Math.max(max_u_level, max_v_level)
            },
            boundary: e.boundary,
            active_cells: e.active_elems,
            related_cells: Array.from(related_cells),
            nodes: e.nodes
        }
    });

    const nodes = raw_data.Nodes.map(n => {
        // let related_cells = new Set();

        // for ([dir, sides] of Object.entries(n.edges)) {
        //     for ([side, level_data] of Object.entries(sides)) {
        //         level_data.edge_ids.forEach(edge_id => {
        //             edges[edge_id].related_cells.forEach(cell_id => related_cells.add(cell_id));
        //         });
        //     }
        // }

        let related_cells = [];
        for ([dir, cell_id_list] of Object.entries(n.elems)) {
            cell_id_list.forEach(cell_id => related_cells.push(cell_id));
        }

        let min_u_level = Number.MAX_SAFE_INTEGER;
        let min_v_level = Number.MAX_SAFE_INTEGER;
        let max_u_level = Number.MIN_SAFE_INTEGER;
        let max_v_level = Number.MIN_SAFE_INTEGER;

        for (let r_cell_id of related_cells) {
            let h = cells[r_cell_id].h;
            if (h.u < min_u_level) min_u_level = h.u;
            if (h.v < min_v_level) min_v_level = h.v;
            if (h.u > max_u_level) max_u_level = h.u;
            if (h.v > max_v_level) max_v_level = h.v;
        }

        return {
            id: n.id,
            point: n.point,
            boundary: n.boundary,
            min_levels: {
                u: min_u_level,
                v: min_v_level,
                min: Math.min(min_u_level, min_v_level),
                max: Math.max(min_u_level, min_v_level)
            },
            max_levels: {
                u: max_u_level,
                v: max_v_level,
                min: Math.min(max_u_level, max_v_level),
                max: Math.max(max_u_level, max_v_level)
            },
            related_cells: Array.from(related_cells),
        };
    });

    return {
        Cells: cells,
        Edges: edges,
        Nodes: nodes,
    }
}

function get_plot_data() {
    const [scale_x, scale_y] = get_point_scale_fns();

    const plot_nodes = intermediate_data.Nodes
        .filter(n => h_within_active_range(n))
        .map(n => {
            return {
                id: n.id,
                x: scale_x(n.point.x),
                y: scale_y(n.point.y),
                boundary: n.boundary,
                active_level: null,
            }
        });

    const plot_cells = intermediate_data.Cells
        .filter(c => h_within_active_range(c))
        .map(c => {
            const p0 = plot_nodes[c.nodes[0]];
            const p3 = plot_nodes[c.nodes[3]];

            return {
                id: c.id,
                geom: {
                    cx: (p0.x + p3.x) / 2.0,
                    cy: (p0.y + p3.y) / 2.0,
                    wx: p3.x - p0.x,
                    wy: Math.abs(p3.y - p0.y),
                    nodes: c.nodes,
                },
                h: {
                    u: c.h.u - gui_data.h_min,
                    v: c.h.v - gui_data.h_min,
                    min: c.h.min - gui_data.h_min,
                    max: c.h.max - gui_data.h_min,
                },
                p: c.p,
                fs: Math.sqrt(Math.abs(p0.y - p3.y) * Math.abs(p0.x - p3.x)) * 0.5,
                show_fill: true,
                active: c.active,
                has_active_edges: c.has_active_edges,
                has_active_nodes: false,
        };
    });

    return {
        Cells: plot_cells,
        Nodes: plot_nodes,
        Edges: intermediate_data.Edges
            .filter(e => h_within_active_range(e))
            .map(e => {
                const n0 = plot_nodes[e.nodes[0]];
                const n1 = plot_nodes[e.nodes[1]];

                return {
                    id: e.id,
                    n0: [n0.x, n0.y],
                    n1: [n1.x, n1.y],
                    boundary: e.boundary,
                    active_cells: e.active_cells,
                }
            }),
        InheritanceLines: [],
    }
}

function get_point_scale_fns() {
    const extremes = get_geometric_extremes();

    let scale = 0;
    if (extremes.x.max - extremes.x.min > extremes.y.max - extremes.y.min) {
        scale = 2.0 / (extremes.y.max - extremes.y.min);
    } else {
        scale = 2.0 / (extremes.x.max - extremes.x.min);
    }

    const scale_x = (x) => {
        return (x - extremes.x.min) * scale - 1.0;
    }

    const scale_y = (y) => {
        return 1.0 - ((y - extremes.y.min) * scale);
    }

    return [scale_x, scale_y];
}

function get_geometric_extremes() {
    return {
        x: {
            min: intermediate_data.Nodes
                .filter(n => h_within_active_range_strict(n))
                .map(n => n.point.x)
                .reduce((acc, val) => val < acc ? val : acc, Number.MAX_VALUE),
            max: intermediate_data.Nodes
                .filter(n => h_within_active_range_strict(n))
                .map(n => n.point.x)
                .reduce((acc, val) => val > acc ? val : acc, Number.MIN_VALUE)
        },
        y: {
            min: intermediate_data.Nodes
                .filter(n => h_within_active_range_strict(n))
                .map(n => n.point.y)
                .reduce((acc, val) => val < acc ? val : acc, Number.MAX_VALUE),
            max: intermediate_data.Nodes
                .filter(n => h_within_active_range_strict(n))
                .map(n => n.point.y)
                .reduce((acc, val) => val > acc ? val : acc, Number.MIN_VALUE)
        }
    }
}

function get_inheritance_lines() {
    plot_data.InheritanceLines = intermediate_data
        .Nodes
        .filter(n => h_within_active_range_strict(n))
        .map(n => {
            const min_h = n.min_levels[gui_data.h_type];
            const max_h = n.max_levels[gui_data.h_type];

            const active_min_h = (min_h >= gui_data.h_min) ? min_h : gui_data.h_min;
            const active_max_h = (max_h <= gui_data.h_max) ? max_h : gui_data.h_max;

            return {
                x: plot_data.Nodes[n.id].x,
                y: plot_data.Nodes[n.id].y,
                z0: active_min_h - gui_data.h_min,
                z1: active_max_h - gui_data.h_min,
            };
        });



    //     for (const dir of ["u", "v"]) {
    //         n.edges[dir].forEach(level => {
    //             level.edge_ids.forEach(edge_id => {
    //                 const edge_cells = intermediate_data.Edges[edge_id].cells;

    //                 for (const dir_idx of [0, 1]) {

    //                     edge_cells[dir_idx].forEach(level_key_cell => {
    //                         if (h_within_active_range(intermediate_data.Cells[level_key_cell.cell_id])) {
    //                             const level = plot_data.Cells[level_key_cell.cell_id].h[gui_data.h_type];
    
    //                             if (level < min_level) min_level = level;
    //                             if (level > max_level) max_level = level;
    //                         }
    //                     });
    //                 }
    //             });
    //         });
    //     }

    //     return {
    //         x: plot_data.Nodes[n.id].x,
    //         y: plot_data.Nodes[n.id].y,
    //         z0: min_level,
    //         z1: max_level,
    //     };
    // });
}

function h_within_active_range(obj) {
    if (obj.min_levels && obj.max_levels) {
        // node or edge
        return obj.min_levels[gui_data.h_type] >= gui_data.h_min || obj.max_levels[gui_data.h_type] <= gui_data.h_max;
    } else {
        // cell
        // must be strictly within range
        return obj.h[gui_data.h_type] >= gui_data.h_min && obj.h[gui_data.h_type] <= gui_data.h_max;
    }
}

function h_within_active_range_strict(obj) {
    if (obj.min_levels && obj.max_levels) {
        // node or edge
        return obj.min_levels[gui_data.h_type] >= gui_data.h_min && obj.max_levels[gui_data.h_type] <= gui_data.h_max
    } else {
        // cell
        // must be strictly within range
        return obj.h[gui_data.h_type] >= gui_data.h_min && obj.h[gui_data.h_type] <= gui_data.h_max;
    }
}

function set_cell_fill_states() {
    plot_data.Cells.forEach(c => c.show_fill = true);
    if (gui_data.h_type) {
        plot_data.Cells.forEach(c => {
            const relevant_h_level = c.h[gui_data.h_type];
            raw_data.Elems[c.id].children.forEach(child_cell_id => {
                if (plot_data.Cells[child_cell_id] && plot_data.Cells[child_cell_id].h[gui_data.h_type] === relevant_h_level) {
                    c.show_fill = false;
                }
            });
        })
    }
}

function get_color_map_fns() {
    let num_cats = 1;
    let relevant_colors = ['#fff'];

    switch (gui_data.color_key_type) {
        case "proc":
            document.getElementById("proc-color-settings").setAttribute("style", "visibility: block");

            let hue_ratio = 1.0;
            let sat_ratio = 1.0;
            let bri_ratio = 1.0;

            const color_bounds_range = Math.abs(gui_data.color_bounds.max - gui_data.color_bounds.min);
            if (color_bounds_range > 0.05) {
                hue_ratio = gui_data.hsb_settings.hue.var / color_bounds_range;
                sat_ratio = gui_data.hsb_settings.sat.var / color_bounds_range;
                bri_ratio = gui_data.hsb_settings.bri.var / color_bounds_range;
            }

            const g_min = gui_data.color_bounds.min;
            const hue_offset = gui_data.hsb_settings.hue.mid + (gui_data.hsb_settings.hue.var / 2.0);
            const sat_offset = gui_data.hsb_settings.sat.mid + (gui_data.hsb_settings.sat.var / 2.0);
            const bri_offset = gui_data.hsb_settings.bri.mid + (gui_data.hsb_settings.bri.var / 2.0);

            // gui_data.hue_map_fn = (value) => {
            //     return (((value - g_min) * hue_ratio) + hue_offset) % 365;
            // }

            // gui_data.sat_map_fn = (value) => {
            //     return (((value - g_min) * sat_ratio) + sat_offset);
            // }

            // gui_data.bri_map_fn = (value) => {
            //     return (((value - g_min) * bri_ratio) + bri_offset);
            // };

            gui_data.fill_map_fn = (value, alpha) => {
                const hue = (((value - g_min) * hue_ratio) + hue_offset) % 365;
                const bri = (((value - g_min) * sat_ratio) + sat_offset);
                const sat = (((value - g_min) * bri_ratio) + bri_offset);
                fill(hue, sat, bri, alpha);
            }
            break;

        case "dict1":
            document.getElementById("proc-color-settings").setAttribute("style", "visibility: hidden");
            set_color_scale_auto();
            num_cats = gui_data.color_bounds.max - gui_data.color_bounds.min + 1;
            relevant_colors = color_dicts1[num_cats];

            gui_data.fill_map_fn = (value, alpha) => {
                const idx = value - gui_data.color_bounds.min;
                if (relevant_colors[idx]) {
                    const fc = `${relevant_colors[idx]}${(Math.floor(alpha * 255.0 / 100.0)).toString(16)}`;
                    fill(fc);
                } else {
                    fill(200);
                }
            }

            break;

        case "dict2":
            document.getElementById("proc-color-settings").setAttribute("style", "visibility: hidden");
            set_color_scale_auto();
            num_cats = gui_data.color_bounds.max - gui_data.color_bounds.min + 1;
            relevant_colors = color_dicts2[num_cats];

            gui_data.fill_map_fn = (value, alpha) => {
                const idx = value - gui_data.color_bounds.min;
                if (relevant_colors[idx]) {
                    const fc = `${relevant_colors[idx]}${(Math.floor(alpha * 255.0 / 100.0)).toString(16)}`;
                    fill(fc);
                } else {
                    fill(200);
                }
            }

            break;

        default: console.log("Unknown color map type!");
    }
}

function set_color_scale_auto() {
    const extremes = get_expansion_extremes();

    switch (gui_data.map_colors) {
        case "none":
            gui_data.color_bounds = {
                min: 0,
                max: 1,
            };
            break;
        case "both":
            gui_data.color_bounds = {
                min: Math.min(extremes.u.min, extremes.v.min),
                max: Math.max(extremes.u.max, extremes.v.max),
            };
            break;
        case "u": gui_data.color_bounds = extremes.u; break;
        case "v": gui_data.color_bounds = extremes.v; break;
    }
}

function get_expansion_extremes() {
    return {
        u: {
            min: plot_data.Cells.map(c => c.p.u).reduce((acc, val) => val < acc ? val : acc, Number.MAX_VALUE),
            max: plot_data.Cells.map(c => c.p.u).reduce((acc, val) => val > acc ? val : acc, Number.MIN_VALUE),
        },
        v: {
            min: plot_data.Cells.map(c => c.p.v).reduce((acc, val) => val < acc ? val : acc, Number.MAX_VALUE),
            max: plot_data.Cells.map(c => c.p.v).reduce((acc, val) => val > acc ? val : acc, Number.MIN_VALUE),
        }
    }
}

function get_h_extremes() {
    let h_min = 100;
    let h_max = 0;

    let level_extract = (levels) => {
        switch (gui_data.h_type) {
            case "min":
                return Math.min(levels.u, levels.v);
            case "max":
                return Math.max(levels.u, levels.v);
            case "u":
                return levels.u;
            case "v":
                return levels.v;
        }
    }

    raw_data.Elems.forEach(cell => {
        let level = level_extract(cell.h_levels);
        if (level < h_min) h_min = level;
        if (level > h_max) h_max = level;
    });

    gui_data.h_min = h_min;
    gui_data.h_max = h_max;

    fill_menu_with_range("h-level-min-menu", h_min, h_max - 1, "min");
    fill_menu_with_range("h-level-max-menu", h_min + 1, h_max, "max");
}

function fill_menu_with_range(menu_id, min, max, name) {
    let menu = document.getElementById(menu_id);
    menu.innerHTML = "";

    for (let i = min; i <= max; i++) {
        let option_obj = document.createElement('option');

        option_obj.innerText = i.toString();
        option_obj.setAttribute('value', i.toString());
        option_obj.setAttribute('id', `h-level-${name}-${i}`);

        switch (name) {
            case "min": 
                if (i == min) {
                    option_obj.setAttribute('selected', 'selected');
                }
                break;
            case "max":
                if (i == max) {
                    option_obj.setAttribute('selected', 'selected');
                }
                break;
        }
        

        menu.appendChild(option_obj);
    }
}
