
document.getElementById("mesh-file-upload").addEventListener('change', (e) => {
    const file = e.target.files[0];
    meta_data["filename"] = file.name.split('.')[0];

    const reader = new FileReader();

    reader.addEventListener('load', load_event => {
        raw_data = JSON.parse(load_event.target.result);
        get_h_extremes();

        intermediate_data = get_intermediate_data();

        // reset quantites menus and data
        edge_quant_to_draw = "none";
        cell_quant_to_draw = "none";
        edge_quant_data = {};
        cell_quant_data = {};
        clear_cell_quant_menu();
        clear_edge_quant_menu();
        document.getElementById("cell-min-value").innerText = "0"
        document.getElementById("cell-max-value").innerText = "0";
        document.getElementById("edge-min-value").innerText = "0"
        document.getElementById("edge-max-value").innerText = "0";
        
        // setup plot data
        plot_data = get_plot_data();
        set_cell_fill_states();
        get_inheritance_lines();
    });
    reader.addEventListener('error', error => console.log(error));
    reader.addEventListener('abort', abort => console.log(abort));

    reader.readAsText(file);
});

document.getElementById("quant-file-upload").addEventListener('change', (e) => {
    const files = e.target.files;

    files.forEach(file => {
        const reader = new FileReader();

        reader.addEventListener('load', load_event => {
            const raw_quant_data = JSON.parse(load_event.target.result);
            if (raw_quant_data.num_cells == raw_data.Cells.length) {
                switch (raw_quant_data.Type) {
                    case "Cell": 
                        cell_quant_data[raw_quant_data.Name] = {
                            values: raw_quant_data.Data,
                            min: raw_quant_data.min,
                            max: raw_quant_data.max,
                        }
                        add_cell_quant_to_menu(raw_quant_data.Name);
    
                        break;
        
                    case "Edge":
                        edge_quant_data[raw_quant_data.Name] = {
                            values: raw_quant_data.Data,
                            min: raw_quant_data.min,
                            max: raw_quant_data.max,
                        }
                        add_edge_quant_to_menu(raw_quant_data.Name);
    
                        break;
                    
                    default: console.log("Unknown Quantity Type!");
                }
            } else {
                console.log("Wrong Number of Cells in Quantity File!");
            }
        });
        reader.addEventListener('error', error => console.log(error));
        reader.addEventListener('abort', abort => console.log(abort));
    
        reader.readAsText(file);
    });
});

function clear_cell_quant_menu() {
    document.getElementById("cell-quantity-menu").innerHTML = "";
    let none_option = document.createElement("option");
    none_option.value = "none";
    none_option.innerHTML = "None";
    none_option.setAttribute("selected", "selected");
    document.getElementById("cell-quantity-menu").appendChild(none_option);
}

function clear_edge_quant_menu() {
    document.getElementById("edge-quantity-menu").innerHTML = "";
    let none_option = document.createElement("option");
    none_option.value = "none";
    none_option.innerHTML = "None";
    none_option.setAttribute("selected", "selected");
    document.getElementById("edge-quantity-menu").appendChild(none_option);
}

function add_cell_quant_to_menu(name) {
    let new_option = document.createElement("option");
    new_option.value = name;
    new_option.innerHTML = name;
    document.getElementById("cell-quantity-menu").appendChild(new_option);
}   

function add_edge_quant_to_menu(name) {
    let new_option = document.createElement("option");
    new_option.value = name;
    new_option.innerHTML = name;
    document.getElementById("edge-quantity-menu").appendChild(new_option);
}   