"use strict"
console.log("Hello");

var view_state = {dragging:false, x:0, y:0, zoom:100, dragging_node:false};

function title_edit(e)
{
    if(e.which == 13)
    {
        e.preventDefault();
    }
}

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
}

function create_node()
{
    var node = {dragging:false, move_dragging:false, width:200, height:200, top: 10, left: 10};
    node.container = document.createElement("div");
    node.container.style.position = "absolute";
    node.container.style.top = "10px";
    node.container.style.left = "10px";
    node.container.style.width = "200px";
    node.container.classList.add("node_container");
    node.container.classList.add("node_transform");

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

    node.title = document.createElement("div");
    node.title.innerHTML = "Title";
    node.title.contentEditable = "true";
    node.title.spellcheck = "true";
    node.title.classList.add("node_title");

    node.title.addEventListener('keypress', title_edit);
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

    node.resizer = document.createElement("div");
    node.resizer.classList.add("node_resizer");
    node.resizer.draggable = "false";

    node.resizer.addEventListener("mousedown", start_resize_drag);
    
    node.container.appendChild(node.title);
    node.container.appendChild(node.body);
    node.container.appendChild(node.resizer);

    document.getElementById("graph_view").appendChild(node.container);

    return node;
}
