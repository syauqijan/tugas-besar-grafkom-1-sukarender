let selectedShapeIndex = null;
let selectedVertexIndex = null;
let selectedVertices = [];
var verticesList = [];

const colorPicker = document.getElementById('color-picker');

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    return [
        parseInt(hex.substring(0, 2), 16) / 255,
        parseInt(hex.substring(2, 4), 16) / 255,
        parseInt(hex.substring(4, 6), 16) / 255,
        1.0
    ];
}

function handleMouseDown(event){
    if (currentShapeType === "polygon" ) {
        if(count==0){
            verticesList = [];
        }
        isDrawing = true;
        let x = event.offsetX / canvas.width * 2 - 1;
        let y = 1 - event.offsetY / canvas.height * 2;
        verticesList.push([x, y]);
    
        // if (verticesList.length > 3) {
        //     // verticesList = convexHull(verticesList);
            
        //     let dist1 = Math.hypot(verticesList[verticesList.length - 1][0] - x, verticesList[verticesList.length - 1][1] - y);
        //     let dist2 = Math.hypot(verticesList[verticesList.length - 2][0] - x, verticesList[verticesList.length - 2][1] - y);
        //     if (dist1 < dist2) {
        //         let temp = verticesList[verticesList.length - 1];
        //         verticesList[verticesList.length - 1] = verticesList[verticesList.length - 2];
        //         verticesList[verticesList.length - 2] = temp;
        //     }
        // }
        console.log("v_poly:", verticesList);
        drawPolygon();
        console.log("polygon");
        count++;
    } else {
        if (count==0){
            isDrawing = true;
            startX = event.offsetX;
            startY = event.offsetY;
            endX = event.offsetX;
            endY = event.offsetY;
            if (currentShapeType === "line") {
                drawShape(gl, startX, startY, endX, endY, "line");
                console.log("line");
            }
            else if (currentShapeType === "square") {
                drawShape(gl, startX, startY, endX, endY, "square");
                console.log("square");
            } 
            else if (currentShapeType === "rectangle") {
                drawShape(gl, startX, startY, endX, endY, "rectangle");
                console.log("rectangle");
            }
            else if(currentShapeType === "polygon"){
                verticesList = [];
                let x = getXClipValue(event.offsetX);
                let y = getYClipValue(event.offsetY);
                verticesList.push([x, y]);
                console.log("polygon");
            }
            count++;
        }
    }
}

function handleMouseMove(event){
    if (!isDrawing) return;
    endX = event.offsetX;
    endY = event.offsetY;
    n=shapes.length-1;
    temp=shapes[n];
    if (currentShapeType === "line") {
        temp.verticesList[1][0]=endX / canvas.width * 2 - 1;
        temp.verticesList[1][1]=1 - endY / canvas.height * 2;
        shapes[n]=temp;
        redrawShape(n);
        return;
    }

    else if (currentShapeType === "square"){
        
        let sqlen = Math.abs(endX - startX);
        let newX, newY
        
        if(endX < startX){
            if(endY < startY){
                newX = startX - sqlen;
                newY = startY - sqlen;
            }
            else {
                newX = startX - sqlen;
                newY = startY + sqlen;
            }
        }
        else{
            if(endY < startY){
                newX = startX + sqlen;
                newY = startY - sqlen;
            }
            else{
                newX = startX + sqlen;
                newY = startY + sqlen;
            }
        }

        temp.verticesList[3][0]=newX / canvas.width * 2 - 1;
        temp.verticesList[3][1]=1 - newY / canvas.height * 2;
        temp.verticesList[1][0]=newX / canvas.width * 2 - 1;
        temp.verticesList[2][1]=1 - newY / canvas.height * 2;

        shapes[n]=temp;
        redrawShape(n);
        return;
    }

    else if (currentShapeType === "rectangle"){
        temp.verticesList[3][0]=endX / canvas.width * 2 - 1;
        temp.verticesList[3][1]=1 - endY / canvas.height * 2;
        temp.verticesList[1][0]=endX / canvas.width * 2 - 1;
        temp.verticesList[2][1]=1 - endY / canvas.height * 2;
        shapes[n]=temp;
        redrawShape(n);
        return;
    
    }

    
}

function handleMouseUp(event, shapeType){
    if (!isDrawing) return;
    isDrawing = false;
    checkShape();
    return shapes;
}
function storeShape(verticesList, shapeType, fragColorList) {
    var shape = {
        verticesList: verticesList,
        shapeType: shapeType,
        fragColorList: fragColorList
    };
    shapes.push(shape);
    return shapes;
}

function checkShape(){
    // check all the shapes in the shapes array and pop if all vertices are same
    for (let i=0; i<shapes.length; i++){
        let shape = shapes[i];
        let vertices = shape.verticesList;
        if (vertices[0][0] == vertices[1][0] && vertices[0][1] == vertices[1][1]){
            delete shapes[i];
        }
    }
}

function displayShape(arrayShape) {
    var shapeList = document.getElementById("container");

    shapeList.innerHTML = '';

    arrayShape.forEach((shape, shapeIndex) => {
        const shapeDiv = document.createElement('div');
        shapeDiv.className = 'shape-div';
        shapeList.appendChild(shapeDiv);
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'header-div';
        shapeDiv.appendChild(headerDiv);

        
        const descButton = document.createElement('button');
        descButton.textContent = "↓";
        descButton.className = 'btn-desc';
        headerDiv.appendChild(descButton);
        const shapeButton = document.createElement('button');
        shapeButton.textContent = `Shape ${shapeIndex + 1}`;
        shapeButton.className = 'btn-shape';
        headerDiv.appendChild(shapeButton);
        
        
        const ascButton = document.createElement('button');
        ascButton.textContent = "↑";
        ascButton.className = 'btn-asc';
        headerDiv.appendChild(ascButton);

        shape.verticesList.forEach((vertex, vertexIndex) => {
            const vertexDiv = document.createElement('div');
            vertexDiv.className = 'vertex-div';
            shapeDiv.appendChild(vertexDiv);
        
            const vertexCheckbox = document.createElement('input');
            vertexCheckbox.type = 'checkbox';
            vertexCheckbox.id = `vertex-${shapeIndex}-${vertexIndex}`;
            vertexCheckbox.className = 'btn-vertex';
            // check if vertex is in selectedVertices
            if (selectedVertices[shapeIndex] && selectedVertices[shapeIndex].includes(vertexIndex)) {
                vertexCheckbox.checked = true;
            }
            vertexDiv.appendChild(vertexCheckbox);
        
            const vertexLabel = document.createElement('label');
            vertexLabel.htmlFor = vertexCheckbox.id;
            vertexLabel.textContent = `Vertex ${vertexIndex + 1}`;
            vertexDiv.appendChild(vertexLabel);

            // vertexCheckbox.addEventListener('change', () => {
            //     if (vertexCheckbox.checked) {
            //         selectedVertices.push({ shapeIndex, vertexIndex });
            //         console.log(`Shape ${shapeIndex + 1}-Vertex ${vertexIndex + 1} selected`);
            //     } else {
            //         selectedVertices = selectedVertices.filter(vertex => vertex.shapeIndex !== shapeIndex || vertex.vertexIndex !== vertexIndex);
            //     }
            //     console.log(selectedVertices);
            // });

            vertexCheckbox.addEventListener('change', () => {
                if (vertexCheckbox.checked) {
                    if (!selectedVertices[shapeIndex]) {
                        selectedVertices[shapeIndex] = [];
                    }
                    selectedVertices[shapeIndex].push(vertexIndex);
                } else {
                    if (selectedVertices[shapeIndex]) {
                        selectedVertices[shapeIndex] = selectedVertices[shapeIndex].filter(index => index !== vertexIndex);
                        if (selectedVertices[shapeIndex].length === 0) {
                            delete selectedVertices[shapeIndex];
                        }
                    }
                }
                console.log(selectedVertices);
                
            });

        });

        shapeButton.addEventListener('click', () => {
            // check if shape index is in vertices list
            console.log(`Shape ${shapeIndex + 1} clicked`);
            if (selectedVertices[shapeIndex]) {
                selectedVertices[shapeIndex].forEach(vertexIndex => {
                    const vertexCheckbox = document.getElementById(`vertex-${shapeIndex}-${vertexIndex}`);
                    vertexCheckbox.checked = false;
                });
                delete selectedVertices[shapeIndex];
            }
            else {
                shape.verticesList.forEach((_, vertexIndex) => {
                    console.log(`Shape ${shapeIndex + 1}-Vertex ${vertexIndex + 1} clicked`);
                    console.log(`Coordinate: (${shape.verticesList[vertexIndex][0]}, ${shape.verticesList[vertexIndex][1]})`);
                    const vertexCheckbox = document.getElementById(`vertex-${shapeIndex}-${vertexIndex}`);
                    vertexCheckbox.checked = true;
                    if (!selectedVertices[shapeIndex]) {
                        selectedVertices[shapeIndex] = [];
                    }
                    selectedVertices[shapeIndex].push(vertexIndex);
                });
            }
            console.log(selectedVertices);
        });
    });
}

colorPicker.addEventListener('input', function() {
    const pickedColor = colorPicker.value; 
    const rgbaColor = hexToRgb(pickedColor);

    selectedVertices.forEach((vertexIndices, shapeIndex) => {
        if (vertexIndices) {
            console.log(`Shape ${shapeIndex + 1} length of checked vertices is ${vertexIndices.length}`);
            vertexIndices.forEach(vertexIndex => {
                shapes[shapeIndex].fragColorList[vertexIndex] = rgbaColor;
            });
        }
    });


    redrawAllShapes();
});
function saveJson(){
    var json = JSON.stringify(shapes);
    var blob = new Blob([json], {type: "application/json"});
    var url  = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.download    = "shapes.json";
    a.href        = url;
    a.click();
}

function loadJson(){
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => { 
        var file = e.target.files[0]; 
        var reader = new FileReader();
        reader.readAsText(file,'UTF-8');
        reader.onload = readerEvent => {
            var content = readerEvent.target.result;
            shapes = JSON.parse(content);
            redrawAllShapes();
        }
    }
    input.click();
}


function convexHull(points) {
    if (points.length < 3) return [];

    let hull = [];

    let leftMost = 0;
    for (let i = 1; i < points.length; i++) {
        if (points[i][0] < points[leftMost][0]) {
            leftMost = i;
        }
    }

    let p = leftMost;
    let q;

    do {
        hull.push(points[p]);
        q = (p + 1) % points.length;

        for (let i = 0; i < points.length; i++) {
            if (orientation(points[p], points[i], points[q]) == 2) {
                q = i;
            }
        }

        p = q;

    } while (p != leftMost);

    return hull;
}

function orientation(p, q, r) {
    let val = (q[1] - p[1]) * (r[0] - q[0]) -
              (q[0] - p[0]) * (r[1] - q[1]);

    if (val == 0) return 0;
    return (val > 0)? 1: 2; 
}