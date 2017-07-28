/**
 * Created by wgm on 17/7/28.
 */

function main(graphContainer,tbContainer)
{
    // Checks if browser is supported
    if (!mxClient.isBrowserSupported())
    {
        // Displays an error message if the browser is
        // not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    }
    else
    {
        //能够实现在SVG中清晰呈现矩形，即：去锯齿效果
        mxRectangleShape.prototype.crisp = true;

        // Defines an icon for creating new connections in the connection handler.
        // This will automatically disable the highlighting of the source vertex.
        mxConnectionHandler.prototype.connectImage = new mxImage('images/connector.gif', 16, 16);

        // Creates new toolbar without event processing
        var toolbar = new mxToolbar(tbContainer);
        toolbar.enabled = false;

        // Workaround for Internet Explorer ignoring certain styles
        if (mxClient.IS_QUIRKS)
        {
            document.body.style.overflow = 'hidden';
            new mxDivResizer(tbContainer);
            new mxDivResizer(graphContainer);
        }

        var model = new mxGraphModel();
        var graph = new mxGraph(graphContainer,model);

        // Enables new connections in the graph
        graph.setConnectable(true);
        graph.setMultigraph(false);

        // Stops editing on enter or escape keypress
        var keyHandler = new mxKeyHandler(graph);
        var rubberband = new mxRubberband(graph);

        var addVertex = function(icon, w, h, style,typeName)
        {
            var vertex = new mxCell(null, new mxGeometry(0, 0, w, h), style);
            vertex.setVertex(true);

            //if(typeName){
            //    var label = graph.insertVertex(vertex,null,typeName,0,0,20,30);
            //}

            var img = addToolbarItem(graph, toolbar, vertex, icon,typeName);
            img.enabled = true;

            graph.getSelectionModel().addListener(mxEvent.CHANGE, function()
            {
                var tmp = graph.isSelectionEmpty();
                mxUtils.setOpacity(img, (tmp) ? 100 : 20);
                img.enabled = tmp;
            });
        };

        addVertex('editors/images/rectangle.gif', 100, 40, '',"StartNode");
        addVertex('editors/images/rounded.gif', 100, 40, 'shape=rounded',"Activity");
        addVertex('editors/images/ellipse.gif', 40, 40, 'shape=ellipse',"EndNode");
        addVertex('editors/images/rhombus.gif', 40, 40, 'shape=rhombus',"transition");
        addVertex('editors/images/triangle.gif', 40, 40, 'shape=triangle',"synchroniser");
        addVertex('editors/images/cylinder.gif', 40, 40, 'shape=cylinder',"select");
        addVertex('editors/images/actor.gif', 30, 40, 'shape=actor',"tool");
    }
}

function addToolbarItem(graph, toolbar, prototype, image,typeName)
{
    // Function that is executed when the image is dropped on
    // the graph. The cell argument points to the cell under
    // the mousepointer if there is one.
    var funct = function(graph, evt, cell, x, y)
    {
        graph.stopEditing(false);

        var vertex = graph.getModel().cloneCell(prototype);
        vertex.geometry.x = x;
        vertex.geometry.y = y;

        graph.addCell(vertex);
        graph.setSelectionCell(vertex);
    }

    // Creates the image which is used as the drag icon (preview)
    var img = toolbar.addMode(null, image, function(evt, cell) {
        var pt = this.graph.getPointForEvent(evt);
        funct(graph, evt, cell, pt.x, pt.y);
    });

    // Disables dragging if element is disabled. This is a workaround
    // for wrong event order in IE. Following is a dummy listener that
    // is invoked as the last listener in IE.
    mxEvent.addListener(img, 'mousedown', function(evt)
    {
        // do nothing
    });

    // This listener is always called first before any other listener
    // in all browsers.
    mxEvent.addListener(img, 'mousedown', function(evt)
    {
        if (img.enabled == false)
        {
            mxEvent.consume(evt);
        }
    });

    mxUtils.makeDraggable(img, graph, funct);

    return img;
}

