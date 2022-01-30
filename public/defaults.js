
function get_default_raw_data() {
    return {
        Elems: [
            {
                id: 0,
                element_id: 0,
                parent: null,
                children: [],
                active: true,
                edges: [0,1,2,3],
                nodes: [0,1,2,3],
                expansion: {
                    u: 1,
                    v: 1,
                },
                h_levels: {
                    u: 0,
                    v: 0,
                },  
            }
        ],
        Edges: [
            {
                id: 0,
                parent: null,
                children: null,
                boundary: true,
                active_elems: [],
                elems: [
                    [],
                    [ 
                        {
                            "level_key": [0,0],
                            "cell_id": 0,
                        }
                    ]
                ],
                nodes: [0, 1],
                direction: "V-Dir"
            },
            {
                id: 1,
                parent: null,
                children: null,
                boundary: true,
                active_elems: [],
                elems: [
                    [
                        {
                            "level_key": [0,0],
                            "cell_id": 0,
                        }
                    ],
                    []
                ],
                nodes: [2, 3],
                direction: "V-Dir"
            },
            {
                id: 2,
                parent: null,
                children: null,
                boundary: true,
                active_elems: [],
                elems: [
                    [],
                    [
                        {
                            "level_key": [0,0],
                            "cell_id": 0,
                        }
                    ]
                ],
                nodes: [0, 2],
                direction: "U-Dir"
            },
            {
                id: 3,
                parent: null,
                children: null,
                boundary: true,
                active_elems: [],
                elems: [
                    [
                        {
                            "level_key": [0,0],
                            "cell_id": 0,
                        }
                    ],
                    []
                ],
                nodes: [1, 3],
                direction: "U-Dir"
            },
        ],
        Nodes: [
            {
                id: 0,
                active_level_u: null,
                active_level_v: null,
                boundary: true,
                edges: {
                    u: [
                        {
                            level: 0,
                            edge_ids: [0]
                        }
                    ],
                    v: [
                        {
                            level: 0,
                            edge_ids: [2]
                        }
                    ],
                },
                elems: [
                    [0]
                ],
                point: {
                    x: 0.0,
                    y: 0.0,
                }
            },
            {
                id: 1,
                active_level_u: null,
                active_level_v: null,
                boundary: true,
                edges: {
                    u: [
                        {
                            level: 0,
                            edge_ids: [0]
                        }
                    ],
                    v: [
                        {
                            level: 0,
                            edge_ids: [3]
                        }
                    ],
                },
                elems: [
                    [0]
                ],
                point: {
                    x: 1.0,
                    y: 0.0,
                }
            },
            {
                id: 2,
                active_level_u: null,
                active_level_v: null,
                boundary: true,
                edges: {
                    u: [
                        {
                            level: 0,
                            edge_ids: [1]
                        }
                    ],
                    v: [
                        {
                            level: 0,
                            edge_ids: [2]
                        }
                    ],
                },
                elems: [
                    [0]
                ],
                point: {
                    x: 0.0,
                    y: 1.0,
                }
            },
            {
                id: 3,
                active_level_u: null,
                active_level_v: null,
                boundary: true,
                edges: {
                    u: [
                        {
                            level: 0,
                            edge_ids: [1]
                        }
                    ],
                    v: [
                        {
                            level: 0,
                            edge_ids: [3]
                        }
                    ],
                },
                elems: [
                    [0]
                ],
                point: {
                    x: 1.0,
                    y: 1.0,
                }
            }
        ],
        Elements: [
            {
                id: 0,
                eps_rel: 1,
                mu_rel: 1,
            }
        ]
    }
}
