"use strict"
console.log("Hello");

function title_edit(e)
{
    if(e.which == 13)
    {
        e.preventDefault();
    }
}

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

    var on_move_drag = function(evt)
    {
        if(node.move_dragging)
        {
            var newX = evt.clientX;
            var newY = evt.clientY;

            var deltaX = newX - node.move_x;
            var deltaY = newY - node.move_y;

            node.move_x = newX;
            node.move_y = newY;

            move_node(node, node.left + deltaX, node.top + deltaY);
        }
    }

    var stop_move_drag = function(evt)
    {
        node.move_dragging = false;

        var view = document.getElementById("graph_view"); 
        view.removeEventListener("mousemove", on_move_drag);
        view.removeEventListener("mouseup", stop_move_drag);
    }

    var start_move_drag = function(evt)
    {
        node.move_dragging = true;
        node.move_x = evt.clientX;
        node.move_y = evt.clientY;

        var view = document.getElementById("graph_view"); 
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
            var newX = evt.clientX;
            var newY = evt.clientY;

            var deltaX = newX - node.x;
            var deltaY = newY - node.y;

            node.x = newX;
            node.y = newY;

            resize_node(node, node.width + deltaX, node.height + deltaY);
             
        }
    }
    var stop_resize_drag = function(evt)
    {
        node.dragging = false;

        var view = document.getElementById("graph_view"); 
        view.removeEventListener("mousemove", on_resize_drag);
        view.removeEventListener("mouseup", stop_resize_drag);
    }
    var start_resize_drag = function(evt)
    {
        node.dragging = true;
        node.x = evt.clientX;
        node.y = evt.clientY;

        var view = document.getElementById("graph_view"); 
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
