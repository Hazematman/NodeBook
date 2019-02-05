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
    node.container.style.width = width.toString() + "px";
    node.body.height = height.toString() + "px";
}

function create_node()
{
    var node = {};
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

    node.body = document.createElement("div");
    node.body.style.height = "200px";
    node.body.innerHTML = "Body";
    node.body.contentEditable = "true";
    node.body.spellcheck = "true";
    node.body.classList.add("node_body");

    node.resizer = document.createElement("div");
    node.resizer.classList.add("node_resizer");

    
    node.container.appendChild(node.title);
    node.container.appendChild(node.body);
    node.container.appendChild(node.resizer);

    document.getElementById("graph_view").appendChild(node.container);

    return node;
}
