

document.getElementById("h-level-dir-menu").addEventListener('change', (e) => {
    gui_data["h_type"] = e.target.value;
    plot_data = get_plot_data();
        get_inheritance_lines();
        set_cell_fill_states();
});

document.getElementById("h-level-min-menu").addEventListener('change', (e) => {
    const new_min = Number.parseInt(e.target.value);
    if (new_min > gui_data.h_max) {
        document.getElementById(`h-level-min-${gui_data.h_max - 1}`).setAttribute('selected', 'selected');
    } else {
        gui_data.h_min = new_min;
        plot_data = get_plot_data();
            set_cell_fill_states();
            get_inheritance_lines();
    }
});

document.getElementById("h-level-max-menu").addEventListener('change', (e) => {
    const new_max = Number.parseInt(e.target.value);
    if (new_max < gui_data.h_min) {
        document.getElementById(`h-level-max-${gui_data.h_min + 1}`).setAttribute('selected', 'selected');
    } else {
        gui_data.h_max = new_max;
        plot_data = get_plot_data();
            set_cell_fill_states();
            get_inheritance_lines();
    }
});

document.getElementById("h-slider").addEventListener('change', (e) => {
    gui_data["z_scale"] = Number.parseFloat(e.target.value) / 100.0;
});

document.getElementById("alpha-slider").addEventListener('change', (e) => {
    gui_data["cell_alpha"] = Number.parseFloat(e.target.value);
});

document.getElementById("x-center").addEventListener('change', (e) => {
    gui_data.center.x = Number.parseFloat(e.target.value) / 100.0;
});
document.getElementById("y-center").addEventListener('change', (e) => {
    gui_data.center.y = Number.parseFloat(e.target.value) / 100.0;
});
document.getElementById("z-center").addEventListener('change', (e) => {
    gui_data.center.z = Number.parseFloat(e.target.value) / 100.0;
});

document.getElementById("inheritance-checkbox").addEventListener('change', (e) => {
    gui_data["show_inheritance"] = e.target.checked;
});

document.getElementById("cell-id-checkbox").addEventListener('change', (e) => {
    gui_data["show_cell_ids"] = e.target.checked;
});

document.getElementById("active-geo-checkbox").addEventListener('change', (e) => {
    if (e.target.checked) {
        document.getElementById("active-edge-settings").setAttribute("style", "visibility: block;");
    } else {
        document.getElementById("active-edge-settings").setAttribute("style", "visibility: hidden;");
    }
    gui_data["show_active_geo"] = e.target.checked;
});

document.getElementById("active-edge-color").addEventListener('change', (e) => {
    gui_data["active_edge_color"] = e.target.value;
});

document.getElementById("active-edge-weight").addEventListener('change', (e) => {
    gui_data["active_edge_weight"] = Number.parseInt(e.target.value);
});

document.getElementById("color-mapping-menu").addEventListener('change', (e) => {
    gui_data["map_colors"] = e.target.value;
    set_color_scale_auto();
    get_color_map_fns();
    document.getElementById("color-scale-min").value = gui_data.color_bounds.min.toString();
    document.getElementById("color-scale-max").value = gui_data.color_bounds.max.toString();

    if (gui_data.map_colors === "none") {
        document.getElementById("color-key-loc").setAttribute('style', "visibility: hidden;");
    } else {
        document.getElementById("color-key-loc").setAttribute('style', "visibility: block;");
    }
});

document.getElementById("color-scale-min").addEventListener('change', (e) => {
    let min_val = Number.parseInt(e.target.value);
    if (min_val <= gui_data.color_bounds.max) {
        gui_data.color_bounds.min = min_val;
    } else {
        gui_data.color_bounds.min = gui_data.color_bounds.max;
        document.getElementById("color-scale-min").value = gui_data.color_bounds.min.toString();
    }
    get_color_map_fns();
});

document.getElementById("color-scale-max").addEventListener('change', (e) => {
    let max_val = Number.parseInt(e.target.value);
    if (max_val >= gui_data.color_bounds.min) {
        gui_data.color_bounds.max = max_val;
    } else {
        gui_data.color_bounds.max = gui_data.color_bounds.min;
        document.getElementById("color-scale-max").value = gui_data.color_bounds.max.toString();
    }
    get_color_map_fns();
});

document.getElementById("color-scale-auto").addEventListener('click', (e) => {
    set_color_scale_auto();
    get_color_map_fns();
    document.getElementById("color-scale-min").value = gui_data.color_bounds.min.toString();
    document.getElementById("color-scale-max").value = gui_data.color_bounds.max.toString();
});

document.getElementById("color-key-type-select").addEventListener('change', (e) => {
    gui_data.color_key_type = e.target.value;
    get_color_map_fns();
});

document.getElementById("hue-slider").addEventListener('change', (e) => {
    gui_data.hsb_settings.hue.mid = Number.parseInt(e.target.value);
    get_color_map_fns();
});
document.getElementById("hue-var-slider").addEventListener('change', (e) => {
    gui_data.hsb_settings.hue.var = Number.parseInt(e.target.value);
    get_color_map_fns();
});

document.getElementById("sat-slider").addEventListener('change', (e) => {
    gui_data.hsb_settings.sat.mid = Number.parseInt(e.target.value);
    get_color_map_fns();
});
document.getElementById("sat-var-slider").addEventListener('change', (e) => {
    gui_data.hsb_settings.sat.var = Number.parseInt(e.target.value);
    get_color_map_fns();
});

document.getElementById("bri-slider").addEventListener('change', (e) => {
    gui_data.hsb_settings.bri.mid = Number.parseInt(e.target.value);
    get_color_map_fns();
});
document.getElementById("bri-var-slider").addEventListener('change', (e) => {
    gui_data.hsb_settings.bri.var = Number.parseInt(e.target.value);
    get_color_map_fns();
});

document.getElementById("x-slider").addEventListener('change', (e) => {
    gui_data.color_key.x = Number.parseInt(e.target.value) * 10;
});

document.getElementById("y-slider").addEventListener('change', (e) => {
    gui_data.color_key.y = Number.parseInt(e.target.value) * 10;
});

document.getElementById("z-slider").addEventListener('change', (e) => {
    gui_data.color_key.z = Number.parseInt(e.target.value) * 10;
});

document.getElementById("save-canvas-img").addEventListener('click', (e) => {
    let name = document.getElementById("canvas-img-name").value || "domain";
    saveCanvas(canvas_main, name, 'jpeg');
});

document.getElementById("cell-quantity-menu").addEventListener('change', (e) => {
    cell_quant_to_draw = e.target.value;
    document.getElementById("cell-min-value").innerText = cell_quant_data[cell_quant_to_draw].min.toPrecision(6);
    document.getElementById("cell-max-value").innerText = cell_quant_data[cell_quant_to_draw].max.toPrecision(6);
});

document.getElementById("edge-quantity-menu").addEventListener('change', (e) => {
    edge_quant_to_draw = e.target.value;
    document.getElementById("edge-min-value").innerText = edge_quant_data[edge_quant_to_draw].min.toPrecision(6);
    document.getElementById("edge-max-value").innerText = edge_quant_data[edge_quant_to_draw].max.toPrecision(6);
});