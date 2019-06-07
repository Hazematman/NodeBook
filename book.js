"use strict"

/* Start of program preamble for static data */
var svgNS = "http://www.w3.org/2000/svg";

var app_state = 
{
    create_link: false,
    delete_link: false,
    first_node: null,
    nodes: [],
};

var view_state = {dragging:false, x:0, y:0, zoom:100, dragging_node:false};

function set_view_state()
{
    var view = document.getElementById("graph_view");
    var scale_amt = view_state.zoom / 100.0;
    var x = view_state.x;
    var y = view_state.y;
    view.style.transform = `scale(${scale_amt}) translate(${x}px, ${y}px)`;
}

function reset_view()
{
    view_state.zoom = 100;
    view_state.x = 0;
    view_state.y = 0;
    set_view_state();
}

function on_view_drag(evt)
{
    if(view_state.dragging)
    {
        var zoom_factor = view_state.zoom / 100.0
        var newX = evt.clientX;
        var newY = evt.clientY;

        var deltaX = (newX - view_state.move_x)/zoom_factor;
        var deltaY = (newY - view_state.move_y)/zoom_factor;

        view_state.move_x = newX;
        view_state.move_y = newY;

        view_state.x += deltaX;
        view_state.y += deltaY;

        set_view_state();
    }
}

function stop_view_drag(evt)
{
    view_state.dragging = false;

    var view = document.getElementById("graph_container"); 
    view.removeEventListener("mousemove", on_view_drag);
    view.removeEventListener("mouseup", stop_view_drag);
}

function start_view_drag(evt)
{
    var view = document.getElementById("graph_view");
    var container = document.getElementById("graph_container");
    var element_over = document.elementFromPoint(evt.clientX, evt.clientY);

    console.log("HELLO");

    if(!view_state.dragging_node && (element_over === view || element_over === container))
    {
        view_state.dragging = true;
        view_state.move_x = evt.clientX;
        view_state.move_y = evt.clientY;

        var view = document.getElementById("graph_container"); 
        view.addEventListener("mousemove", on_view_drag);
        view.addEventListener("mouseup", stop_view_drag);
    }
}

function zoom_event(evt)
{
    var view = document.getElementById("graph_view");
    var container = document.getElementById("graph_container");
    var element_over = document.elementFromPoint(evt.clientX, evt.clientY);

    if(element_over === view || element_over === container)
    {
        view_state.zoom -= evt.deltaY;
        set_view_state();
    }
}

document.getElementById("graph_container").addEventListener("mousedown", start_view_drag);
document.getElementById("graph_container").addEventListener("wheel", zoom_event);

function resize_node(node, width, height)
{
    node.width = width;
    node.height = height;
    node.container.style.width = width.toString() + "px";
    node.body.style.height = height.toString() + "px";
}

function move_node(node, x, y)
{
    node.left = x;
    node.top = y;

    node.container.style.top = y.toString() + "px";
    node.container.style.left = x.toString() + "px";

    for(var i = 0; i < node.links.length; i++)
    {
        modifiy_link(node.links[i]);
    }
}

function get_label_from_node(parent_node, node)
{
    var out_div = null;

    for(var i = 0; i < parent_node.children_list.length; i++)
    {
        if(parent_node.children_list[i].node === node)
        {
            out_div = parent_node.children_list[i].label;
            break;
        }
    }

    return out_div;
}

function update_child_label(parent_node, node)
{
    for(var i = 0; i < parent_node.children_list.length; i++)
    {
        if(parent_node.children_list[i].node === node)
        {
            parent_node.children_list[i].label.innerHTML = node.title.innerHTML;
        }
    }
}

function modifiy_link(link)
{
    var node = link.node;
    var child_node = link.child_node;

    var offset_div = get_label_from_node(node, child_node);

    var starting_point_x = offset_div.offsetLeft + offset_div.offsetParent.offsetLeft;
    var starting_point_y = offset_div.offsetTop + offset_div.offsetParent.offsetTop;

    var ending_point_x = child_node.left;
    var ending_point_y = child_node.top;

    var min_x = Math.min(starting_point_x, ending_point_x)
    var max_x = Math.max(starting_point_x, ending_point_x)

    var min_y = Math.min(starting_point_y, ending_point_y)
    var max_y = Math.max(starting_point_y, ending_point_y)

    var width = max_x - min_x;
    var height = max_y - min_y;

    link.svg.style.width = `${width}px`;
    link.svg.style.height = `${height}px`;
    link.svg.style.left = `${min_x}px`;
    link.svg.style.top = `${min_y}px`;


    // We need to get the start and end points of the line in the
    // transformed space
    var new_start_x = starting_point_x - min_x;
    var new_start_y = starting_point_y - min_y;
    
    var new_end_x = ending_point_x - min_x;
    var new_end_y = ending_point_y - min_y;

    var path_string = `M ${new_start_x} ${new_start_y} L ${new_end_x} ${new_end_y}`;
    link.line.setAttributeNS(null, "d", path_string);
    link.lineBG.setAttributeNS(null, "d", path_string);
}

function create_link(node, child_node)
{
    // TODO figure out how to handle pointer events on lines
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttributeNS(null, "pointer-events", "none");
    svg.style.position = "absolute";

    var lineBG = document.createElementNS(svgNS, "path");
    lineBG.setAttributeNS(null, "pointer-events", "stroke");
    lineBG.setAttributeNS(null, "stroke", "red");
    lineBG.setAttributeNS(null, "stroke-opacity", "0.0");
    lineBG.setAttributeNS(null, "stroke-width", "5");

    var line = document.createElementNS(svgNS, "path");
    line.setAttributeNS(null, "stroke", "black");
    line.setAttributeNS(null, "stroke-width", "2");

    svg.appendChild(lineBG);
    svg.appendChild(line)

    var view = document.getElementById("graph_view");
    view.appendChild(svg);

    // Create a link object based on this newly made SVG
    // and then move it so it is drawn right
    var link = {node: node, child_node: child_node, svg: svg, line: line, lineBG: lineBG};
    modifiy_link(link);

    var line_mouse_over = function(evt)
    {
        lineBG.setAttributeNS(null, "stroke-opacity", "1.0");
    }

    var line_mouse_leave = function(evt)
    {
        lineBG.setAttributeNS(null, "stroke-opacity", "0.0");
    }

    lineBG.addEventListener("mouseenter", line_mouse_over);
    lineBG.addEventListener("mouseleave", line_mouse_leave);

    // Add this link to both nodes so that they
    // can move the link when the nodes move
    node.links.push(link);
    child_node.links.push(link);
}

function delete_link(node_one, node_two)
{
    var parent = null;
    var child = null;
    for(var i = 0; i < node_one.links.length; i++)
    {
        if(node_one.links[i].child_node === node_two)
        {
            parent = node_one;
            child = node_two;
        }
    }

    if(parent === null)
    {
        for(var i = 0; i < node_two.links.length; i++)
        {
            if(node_two.links[i].child_node === node_one)
            {
                parent = node_two;
                child = node_one;
            }
        }
    }

    if(parent === null)
    {
        console.log("Trying to delete unconnected nodes");
        return;
    }

    delete_link_parent_child(parent, child);
}

function delete_link_parent_child(node, child_node)
{
    var parent_index = -1;
    var child_index = -1;
    var link = null;

    // Check to make sure link between nodes actually exists
    for(var i = 0; i < node.links.length; i++)
    {
        if(node.links[i].child_node === child_node)
        {
            parent_index = i;
            // If the link exists in both then it should be the same
            link = node.links[i]
        }
    }

    for(var i = 0; i < child_node.links.length; i++)
    {
        if(child_node.links[i].node === node)
        {
            child_index = i;
        }
    }

    if(parent_index === -1 || child_index === -1 || link === null)
    {
        console.log("Trying to delete unconnected nodes!");
        return;
    }

    var parent_list_index = -1;
    // Get index of parent in child parents list
    for(var i = 0; i < child_node.parent_nodes.length; i++)
    {
        if(child_node.parent_nodes[i] === node)
        {
            parent_list_index = i;
        }
    }

    if(parent_list_index !== -1)
    {
        child_node.parent_nodes.splice(parent_list_index, 1);
    }

    // Remove link from DOM
    var view = document.getElementById("graph_view");
    link.svg.removeChild(link.line);
    view.removeChild(link.svg);

    var child_list_index = -1;
    // find matching child_label
    for(var i = 0; i < node.children_list.length; i++)
    {
        if(node.children_list[i].node == child_node)
        {
            child_list_index = i;
        }
    }

    // Remove child from
    var child_label = node.children_list[child_list_index];
    node.children_list.splice(child_list_index, 1);
    node.child_container.removeChild(child_label.label);

    // Delete link from lists
    node.links.splice(parent_index, 1);
    child_node.links.splice(child_index, 1);

    // Update all links in parent node since
    // The labels would have moved now
    for(var i=0; i < node.links.length; i++)
    {
        modifiy_link(node.links[i]);
    }
}

function node_add_child(node, new_node)
{
    node.children.push(new_node);

    // Create a child node label under the parent node
    var child_label = document.createElement("div");
    child_label.classList.add("node_label");
    child_label.innerHTML = new_node.title.innerHTML;

    var child = 
    {
        node: new_node,
        label: child_label,
    };

    node.children_list.push(child);

    node.child_container.appendChild(child_label);

    create_link(node, new_node);
}

function create_link_button()
{
    app_state.create_link = true;
    app_state.delete_link = false;
    app_state.first_node = null;
}

function delete_link_button()
{
    app_state.create_link = false;
    app_state.delete_link = true;
    app_state.first_node = null;
}

function create_node(parent_node)
{
    var node = 
        {
            dragging:false, 
            move_dragging:false, width:200, height:200, top: 0, left: 0, 
            children: [], 
            children_list: [],
            parent_nodes: [],
            links: [],
        };


    if(parent_node !== null)
    {
        node.parent_nodes.push(parent_node);
    }

    var on_node_click = function(evt)
    {
        if(app_state.create_link || app_state.delete_link)
        {
            if(app_state.first_node === null)
            {
                app_state.first_node = node;
            }
            else
            {
                if(app_state.create_link)
                {
                    node_add_child(app_state.first_node, node);
                    node.parent_nodes.push(app_state.first_node);
                }
                else if(app_state.delete_link)
                {
                    delete_link(app_state.first_node, node);
                }
                app_state.create_link = false;
                app_state.delete_link = false;
            }
        }
    }

    node.container = document.createElement("div");
    node.container.style.position = "absolute";
    node.container.style.top = `${node.top}px`;
    node.container.style.left = `${node.left}px`;
    node.container.style.width = "200px";
    node.container.classList.add("node_container");
    node.container.classList.add("node_transform");

    node.container.addEventListener("mousedown", on_node_click);

    var on_move_drag = function(evt)
    {
        if(node.move_dragging)
        {
            var zoom_factor = view_state.zoom / 100.0
            var newX = evt.clientX;
            var newY = evt.clientY;

            var deltaX = (newX - node.move_x)/zoom_factor;
            var deltaY = (newY - node.move_y)/zoom_factor;

            node.move_x = newX;
            node.move_y = newY;

            move_node(node, node.left + deltaX, node.top + deltaY);
        }
    }

    var stop_move_drag = function(evt)
    {
        node.move_dragging = false;
        view_state.dragging_node = false;

        var view = document.getElementById("graph_container"); 
        view.removeEventListener("mousemove", on_move_drag);
        view.removeEventListener("mouseup", stop_move_drag);
    }

    var start_move_drag = function(evt)
    {
        node.move_dragging = true;
        view_state.dragging_node = true;

        node.move_x = evt.clientX;
        node.move_y = evt.clientY;

        var view = document.getElementById("graph_container"); 
        view.addEventListener("mousemove", on_move_drag);
        view.addEventListener("mouseup", stop_move_drag);
    }

    var title_edit = function(e)
    {
        if(e.which == 13)
        {
            e.preventDefault();
        }
    }

    var text_change = function(e)
    {
        update_tree_node_label(node);

        for(var i = 0; i < node.parent_nodes.length; i++)
        {
            update_child_label(node.parent_nodes[i], node);
        }
    }

    node.title = document.createElement("div");
    node.title.innerHTML = "Title";
    node.title.contentEditable = "true";
    node.title.spellcheck = "true";
    node.title.classList.add("node_title");

    node.title.addEventListener('keypress', title_edit);
    node.title.addEventListener('input', text_change);
    node.title.addEventListener('mousedown', start_move_drag); 

    node.body = document.createElement("p");
    node.body.style.height = "200px";
    node.body.innerHTML = "Body";
    node.body.contentEditable = "true";
    node.body.spellcheck = "true";
    node.body.classList.add("node_body");

    var on_resize_drag = function(evt)
    {
        if(node.dragging)
        {
            var zoom_factor = view_state.zoom / 100.0
            var newX = evt.clientX;
            var newY = evt.clientY;

            var deltaX = (newX - node.x)/zoom_factor;
            var deltaY = (newY - node.y)/zoom_factor;

            node.x = newX;
            node.y = newY;

            resize_node(node, node.width + deltaX, node.height + deltaY);
             
        }
    }
    var stop_resize_drag = function(evt)
    {
        node.dragging = false;
        view_state.dragging_node = false;

        var view = document.getElementById("graph_container"); 
        view.removeEventListener("mousemove", on_resize_drag);
        view.removeEventListener("mouseup", stop_resize_drag);
    }
    var start_resize_drag = function(evt)
    {
        node.dragging = true;
        view_state.dragging_node = true;
        node.x = evt.clientX;
        node.y = evt.clientY;

        var view = document.getElementById("graph_container"); 
        view.addEventListener("mousemove", on_resize_drag);
        view.addEventListener("mouseup", stop_resize_drag);
    }

    var create_child_node = function(evt)
    {
        var new_node = create_node(node);
        node_add_child(node, new_node);
    }

    node.resizer = document.createElement("div");
    node.resizer.classList.add("node_resizer");
    node.resizer.draggable = "false";

    node.resizer.addEventListener("mousedown", start_resize_drag);

    /* Create a container to hold the list of all the children */
    node.child_container = document.createElement("div");

    // Create button to add new node linked to this one
    node.add_button = document.createElement("div");
    node.add_button.classList.add("node_add");
    node.add_button.innerHTML = "Add Node";
    node.add_button.draggable = "true";

    node.add_button.addEventListener("mousedown", create_child_node);
    
    node.container.appendChild(node.title);
    node.container.appendChild(node.body);
    node.container.appendChild(node.resizer);
    node.container.appendChild(node.child_container);
    node.container.appendChild(node.add_button);

    document.getElementById("graph_view").appendChild(node.container);

    node.tree_node = document.createElement("div");
    node.tree_node.classList.add("tree_node");
    node.tree_node.innerHTML = node.title.innerHTML;

    var tree_container = document.getElementById("tree_container2");
    tree_container.appendChild(node.tree_node);

    app_state.nodes.push(node);


    return node;
}

function update_tree_node_label(node)
{
    node.tree_node.innerHTML = node.title.innerHTML;
}


/* This is a simple function to update the entire
 * Tree view on the side of the app
 * A better approach would be to add and delete
 * elements as they come in */
/* Don't call this function */
function update_tree()
{
    var tree_container = document.getElementById("tree_container2");

    /* Delete all the childern in the tree */
    while(tree_container.firstChild)
    {
        tree_container.removeChild(tree_container.firstChild);
    }

    /* Now create a node for ever child */
    for(var i=0; i < app_state.nodes.length; i++)
    {
        var node = app_state.nodes[i];

        var div = document.createElement("div");
        div.classList.add("tree_node");
        div.innerHTML = node.title.innerHTML;

        tree_container.appendChild(div);
    }
}
