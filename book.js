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

function create_node()
{
    var node = {dragging:false, width:200, height:200};
    node.container = document.createElement("div");
    node.container.style.position = "absolute";
    node.container.style.top = "10px";
    node.container.style.left = "10px";
    node.container.style.width = "200px";
    node.container.classList.add("node_container");

    node.title = document.createElement("div");
    node.title.innerHTML = "Title";
    node.title.contentEditable = "true";
    node.title.spellcheck = "true";
    node.title.classList.add("node_title");

    node.title.addEventListener('keypress', title_edit);

    node.body = document.createElement("p");
    node.body.style.height = "200px";
    node.body.innerHTML = "Body";
    node.body.contentEditable = "true";
    node.body.spellcheck = "true";
    node.body.classList.add("node_body");

    var on_drag = function(evt)
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

    var stop_drag = function(evt)
    {
        node.dragging = false;

        var view = document.getElementById("graph_view"); 
        view.removeEventListener("mousemove", on_drag);
        view.removeEventListener("mouseup", stop_drag);
    }

    var start_drag = function(evt)
    {
        node.dragging = true;
        node.x = evt.clientX;
        node.y = evt.clientY;

        var view = document.getElementById("graph_view"); 
        view.addEventListener("mousemove", on_drag);
        view.addEventListener("mouseup", stop_drag);
    }

    node.resizer = document.createElement("div");
    node.resizer.classList.add("node_resizer");
    node.resizer.draggable = "false";

    node.resizer.addEventListener("mousedown", start_drag);
    //node.resizer.addEventListener("mousemove", on_drag);
    //node.resizer.addEventListener("moveup", stop_drag);

    
    node.container.appendChild(node.title);
    node.container.appendChild(node.body);
    node.container.appendChild(node.resizer);

    document.getElementById("graph_view").appendChild(node.container);

    return node;
}
