// Application State
const state = {
    image: null,
    originalImage: null,
    canvas: null,
    ctx: null,
    shapes: [],
    currentTool: 'rectangle',
    pixelSize: 10,
    isDrawing: false,
    startX: 0,
    startY: 0,
    selectedShape: null,
    dragMode: null, // 'move', 'resize-tl', 'resize-tr', 'resize-bl', 'resize-br', 'resize-t', 'resize-b', 'resize-l', 'resize-r'
    dragStartX: 0,
    dragStartY: 0,
    polygonPoints: [],
    scale: 1
};

// Shape class
class Shape {
    constructor(type, data) {
        this.type = type; // 'rectangle', 'circle', 'polygon'
        this.data = data;
        this.selected = false;
    }

    contains(x, y) {
        switch (this.type) {
            case 'rectangle':
                return x >= this.data.x && x <= this.data.x + this.data.width &&
                       y >= this.data.y && y <= this.data.y + this.data.height;
            case 'circle':
                const dx = x - this.data.x;
                const dy = y - this.data.y;
                return (dx * dx + dy * dy) <= (this.data.radius * this.data.radius);
            case 'polygon':
                return this.pointInPolygon(x, y, this.data.points);
        }
        return false;
    }

    pointInPolygon(x, y, points) {
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const xi = points[i].x, yi = points[i].y;
            const xj = points[j].x, yj = points[j].y;
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    getBoundingBox() {
        switch (this.type) {
            case 'rectangle':
                return {
                    x: this.data.x,
                    y: this.data.y,
                    width: this.data.width,
                    height: this.data.height
                };
            case 'circle':
                return {
                    x: this.data.x - this.data.radius,
                    y: this.data.y - this.data.radius,
                    width: this.data.radius * 2,
                    height: this.data.radius * 2
                };
            case 'polygon':
                const xs = this.data.points.map(p => p.x);
                const ys = this.data.points.map(p => p.y);
                const minX = Math.min(...xs);
                const maxX = Math.max(...xs);
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);
                return {
                    x: minX,
                    y: minY,
                    width: maxX - minX,
                    height: maxY - minY
                };
        }
    }

    draw(ctx, isSelected = false) {
        ctx.save();
        
        if (isSelected) {
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2;
        } else {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
        }

        ctx.setLineDash([5, 5]);

        switch (this.type) {
            case 'rectangle':
                ctx.strokeRect(this.data.x, this.data.y, this.data.width, this.data.height);
                break;
            case 'circle':
                ctx.beginPath();
                ctx.arc(this.data.x, this.data.y, this.data.radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'polygon':
                if (this.data.points.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(this.data.points[0].x, this.data.points[0].y);
                    for (let i = 1; i < this.data.points.length; i++) {
                        ctx.lineTo(this.data.points[i].x, this.data.points[i].y);
                    }
                    ctx.closePath();
                    ctx.stroke();
                }
                break;
        }

        if (isSelected) {
            this.drawHandles(ctx);
        }

        ctx.restore();
    }

    drawHandles(ctx) {
        const bbox = this.getBoundingBox();
        const handleSize = 8;
        
        ctx.fillStyle = '#6366f1';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);

        // Corner handles
        const handles = [
            { x: bbox.x, y: bbox.y }, // top-left
            { x: bbox.x + bbox.width, y: bbox.y }, // top-right
            { x: bbox.x, y: bbox.y + bbox.height }, // bottom-left
            { x: bbox.x + bbox.width, y: bbox.y + bbox.height }, // bottom-right
        ];

        // Edge handles
        if (this.type === 'rectangle' || this.type === 'circle') {
            handles.push(
                { x: bbox.x + bbox.width / 2, y: bbox.y }, // top
                { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height }, // bottom
                { x: bbox.x, y: bbox.y + bbox.height / 2 }, // left
                { x: bbox.x + bbox.width, y: bbox.y + bbox.height / 2 } // right
            );
        }

        handles.forEach(handle => {
            ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
            ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
        });
    }

    getHandleAt(x, y) {
        if (!this.selected) return null;
        
        const bbox = this.getBoundingBox();
        const handleSize = 8;
        const threshold = handleSize;

        const handles = [
            { x: bbox.x, y: bbox.y, type: 'resize-tl' },
            { x: bbox.x + bbox.width, y: bbox.y, type: 'resize-tr' },
            { x: bbox.x, y: bbox.y + bbox.height, type: 'resize-bl' },
            { x: bbox.x + bbox.width, y: bbox.y + bbox.height, type: 'resize-br' },
        ];

        if (this.type === 'rectangle' || this.type === 'circle') {
            handles.push(
                { x: bbox.x + bbox.width / 2, y: bbox.y, type: 'resize-t' },
                { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height, type: 'resize-b' },
                { x: bbox.x, y: bbox.y + bbox.height / 2, type: 'resize-l' },
                { x: bbox.x + bbox.width, y: bbox.y + bbox.height / 2, type: 'resize-r' }
            );
        }

        for (const handle of handles) {
            if (Math.abs(x - handle.x) <= threshold && Math.abs(y - handle.y) <= threshold) {
                return handle.type;
            }
        }

        return null;
    }
}

// Initialize application
function init() {
    state.canvas = document.getElementById('mainCanvas');
    state.ctx = state.canvas.getContext('2d');

    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Image upload
    const imageUpload = document.getElementById('imageUpload');
    imageUpload.addEventListener('change', handleImageUpload);

    // Drag and drop
    const dropzone = document.getElementById('dropzone');
    const canvasContainer = document.querySelector('.canvas-container');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        canvasContainer.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        canvasContainer.addEventListener(eventName, () => dropzone.classList.add('active'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        canvasContainer.addEventListener(eventName, () => dropzone.classList.remove('active'), false);
    });

    canvasContainer.addEventListener('drop', handleDrop, false);

    // Tool selection
    document.getElementById('rectangleTool').addEventListener('click', () => selectTool('rectangle'));
    document.getElementById('circleTool').addEventListener('click', () => selectTool('circle'));
    document.getElementById('polygonTool').addEventListener('click', () => selectTool('polygon'));
    document.getElementById('selectTool').addEventListener('click', () => selectTool('select'));

    // Pixel size
    const pixelSizeSlider = document.getElementById('pixelSize');
    const pixelSizeValue = document.getElementById('pixelSizeValue');
    pixelSizeSlider.addEventListener('input', (e) => {
        state.pixelSize = parseInt(e.target.value);
        pixelSizeValue.textContent = state.pixelSize;
        render();
    });

    // Canvas interactions
    state.canvas.addEventListener('mousedown', handleMouseDown);
    state.canvas.addEventListener('mousemove', handleMouseMove);
    state.canvas.addEventListener('mouseup', handleMouseUp);
    state.canvas.addEventListener('dblclick', handleDoubleClick);

    // Touch events for mobile
    state.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    state.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    state.canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Delete and clear
    document.getElementById('deleteShape').addEventListener('click', deleteSelectedShape);
    document.getElementById('clearAll').addEventListener('click', clearAllShapes);

    // Save image
    document.getElementById('saveImage').addEventListener('click', saveImage);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        handleImageFile(files[0]);
    }
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        handleImageFile(file);
    }
}

function handleImageFile(file) {
    if (!file.type.match('image/png') && !file.type.match('image/jpeg')) {
        alert('Please upload a PNG or JPEG image.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            state.originalImage = img;
            loadImage(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function loadImage(img) {
    // Hide dropzone
    document.getElementById('dropzone').style.display = 'none';
    
    // Calculate canvas size
    const maxWidth = window.innerWidth - 400; // Account for controls panel
    const maxHeight = window.innerHeight - 200;
    
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
    }
    
    if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
    }
    
    state.canvas.width = width;
    state.canvas.height = height;
    state.scale = width / img.width;
    
    state.image = img;
    state.shapes = [];
    state.selectedShape = null;
    
    // Enable controls
    document.getElementById('clearAll').disabled = false;
    document.getElementById('saveImage').disabled = false;
    
    render();
}

function selectTool(tool) {
    state.currentTool = tool;
    
    // Update button states
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tool}Tool`).classList.add('active');
    
    // Clear polygon points when switching tools
    if (tool !== 'polygon') {
        state.polygonPoints = [];
    }
    
    // Update cursor
    if (tool === 'select') {
        state.canvas.style.cursor = 'default';
    } else {
        state.canvas.style.cursor = 'crosshair';
    }
}

function getCanvasCoordinates(e) {
    const rect = state.canvas.getBoundingClientRect();
    const scaleX = state.canvas.width / rect.width;
    const scaleY = state.canvas.height / rect.height;
    
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function handleMouseDown(e) {
    const coords = getCanvasCoordinates(e);
    const x = coords.x;
    const y = coords.y;

    if (state.currentTool === 'select') {
        // Check if clicking on a handle of selected shape
        if (state.selectedShape) {
            const handle = state.selectedShape.getHandleAt(x, y);
            if (handle) {
                state.dragMode = handle;
                state.dragStartX = x;
                state.dragStartY = y;
                state.isDrawing = true;
                return;
            }
        }

        // Check if clicking on a shape
        let shapeClicked = false;
        for (let i = state.shapes.length - 1; i >= 0; i--) {
            if (state.shapes[i].contains(x, y)) {
                selectShape(state.shapes[i]);
                state.dragMode = 'move';
                state.dragStartX = x;
                state.dragStartY = y;
                state.isDrawing = true;
                shapeClicked = true;
                break;
            }
        }

        if (!shapeClicked) {
            selectShape(null);
        }
    } else if (state.currentTool === 'polygon') {
        // Add point to polygon
        state.polygonPoints.push({ x, y });
        render();
    } else {
        state.isDrawing = true;
        state.startX = x;
        state.startY = y;
    }
}

function handleMouseMove(e) {
    const coords = getCanvasCoordinates(e);
    const x = coords.x;
    const y = coords.y;

    if (!state.isDrawing) {
        // Update cursor based on hover
        if (state.currentTool === 'select' && state.selectedShape) {
            const handle = state.selectedShape.getHandleAt(x, y);
            if (handle) {
                state.canvas.style.cursor = getCursorForHandle(handle);
                return;
            } else if (state.selectedShape.contains(x, y)) {
                state.canvas.style.cursor = 'move';
                return;
            }
        }
        state.canvas.style.cursor = state.currentTool === 'select' ? 'default' : 'crosshair';
        return;
    }

    if (state.currentTool === 'rectangle') {
        render();
        drawTemporaryRectangle(x, y);
    } else if (state.currentTool === 'circle') {
        render();
        drawTemporaryCircle(x, y);
    } else if (state.currentTool === 'select' && state.selectedShape) {
        handleShapeDrag(x, y);
    }
}

function handleMouseUp(e) {
    if (!state.isDrawing) return;

    const coords = getCanvasCoordinates(e);
    const x = coords.x;
    const y = coords.y;

    if (state.currentTool === 'rectangle') {
        const width = x - state.startX;
        const height = y - state.startY;
        
        if (Math.abs(width) > 5 && Math.abs(height) > 5) {
            const shape = new Shape('rectangle', {
                x: width > 0 ? state.startX : x,
                y: height > 0 ? state.startY : y,
                width: Math.abs(width),
                height: Math.abs(height)
            });
            state.shapes.push(shape);
        }
    } else if (state.currentTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - state.startX, 2) + Math.pow(y - state.startY, 2));
        
        if (radius > 5) {
            const shape = new Shape('circle', {
                x: state.startX,
                y: state.startY,
                radius: radius
            });
            state.shapes.push(shape);
        }
    }

    state.isDrawing = false;
    state.dragMode = null;
    render();
}

function handleDoubleClick(e) {
    if (state.currentTool === 'polygon' && state.polygonPoints.length >= 3) {
        const shape = new Shape('polygon', {
            points: [...state.polygonPoints]
        });
        state.shapes.push(shape);
        state.polygonPoints = [];
        render();
    }
}

// Touch event handlers
function handleTouchStart(e) {
    e.preventDefault();
    handleMouseDown(e);
}

function handleTouchMove(e) {
    e.preventDefault();
    handleMouseMove(e);
}

function handleTouchEnd(e) {
    e.preventDefault();
    handleMouseUp(e);
}

function drawTemporaryRectangle(x, y) {
    const width = x - state.startX;
    const height = y - state.startY;
    
    state.ctx.strokeStyle = '#6366f1';
    state.ctx.lineWidth = 2;
    state.ctx.setLineDash([5, 5]);
    state.ctx.strokeRect(
        width > 0 ? state.startX : x,
        height > 0 ? state.startY : y,
        Math.abs(width),
        Math.abs(height)
    );
}

function drawTemporaryCircle(x, y) {
    const radius = Math.sqrt(Math.pow(x - state.startX, 2) + Math.pow(y - state.startY, 2));
    
    state.ctx.strokeStyle = '#6366f1';
    state.ctx.lineWidth = 2;
    state.ctx.setLineDash([5, 5]);
    state.ctx.beginPath();
    state.ctx.arc(state.startX, state.startY, radius, 0, Math.PI * 2);
    state.ctx.stroke();
}

function handleShapeDrag(x, y) {
    const dx = x - state.dragStartX;
    const dy = y - state.dragStartY;

    if (state.dragMode === 'move') {
        moveShape(state.selectedShape, dx, dy);
    } else if (state.dragMode.startsWith('resize')) {
        resizeShape(state.selectedShape, state.dragMode, dx, dy);
    }

    state.dragStartX = x;
    state.dragStartY = y;
    render();
}

function moveShape(shape, dx, dy) {
    switch (shape.type) {
        case 'rectangle':
            shape.data.x += dx;
            shape.data.y += dy;
            break;
        case 'circle':
            shape.data.x += dx;
            shape.data.y += dy;
            break;
        case 'polygon':
            shape.data.points.forEach(point => {
                point.x += dx;
                point.y += dy;
            });
            break;
    }
}

function resizeShape(shape, handle, dx, dy) {
    switch (shape.type) {
        case 'rectangle':
            resizeRectangle(shape.data, handle, dx, dy);
            break;
        case 'circle':
            resizeCircle(shape.data, handle, dx, dy);
            break;
        case 'polygon':
            resizePolygon(shape.data, handle, dx, dy);
            break;
    }
}

function resizeRectangle(data, handle, dx, dy) {
    switch (handle) {
        case 'resize-tl':
            data.x += dx;
            data.y += dy;
            data.width -= dx;
            data.height -= dy;
            break;
        case 'resize-tr':
            data.y += dy;
            data.width += dx;
            data.height -= dy;
            break;
        case 'resize-bl':
            data.x += dx;
            data.width -= dx;
            data.height += dy;
            break;
        case 'resize-br':
            data.width += dx;
            data.height += dy;
            break;
        case 'resize-t':
            data.y += dy;
            data.height -= dy;
            break;
        case 'resize-b':
            data.height += dy;
            break;
        case 'resize-l':
            data.x += dx;
            data.width -= dx;
            break;
        case 'resize-r':
            data.width += dx;
            break;
    }
    
    // Ensure minimum size
    if (data.width < 10) data.width = 10;
    if (data.height < 10) data.height = 10;
}

function resizeCircle(data, handle, dx, dy) {
    const distance = Math.sqrt(dx * dx + dy * dy);
    const delta = handle.includes('l') || handle.includes('t') ? -distance : distance;
    data.radius = Math.max(5, data.radius + delta);
}

function resizePolygon(data, handle, dx, dy) {
    const bbox = {
        minX: Math.min(...data.points.map(p => p.x)),
        maxX: Math.max(...data.points.map(p => p.x)),
        minY: Math.min(...data.points.map(p => p.y)),
        maxY: Math.max(...data.points.map(p => p.y))
    };
    
    const centerX = (bbox.minX + bbox.maxX) / 2;
    const centerY = (bbox.minY + bbox.maxY) / 2;
    
    let scaleX = 1;
    let scaleY = 1;
    
    switch (handle) {
        case 'resize-tl':
        case 'resize-tr':
        case 'resize-bl':
        case 'resize-br':
            scaleX = 1 + dx / (bbox.maxX - centerX);
            scaleY = 1 + dy / (bbox.maxY - centerY);
            break;
    }
    
    data.points.forEach(point => {
        point.x = centerX + (point.x - centerX) * scaleX;
        point.y = centerY + (point.y - centerY) * scaleY;
    });
}

function getCursorForHandle(handle) {
    const cursors = {
        'resize-tl': 'nw-resize',
        'resize-tr': 'ne-resize',
        'resize-bl': 'sw-resize',
        'resize-br': 'se-resize',
        'resize-t': 'n-resize',
        'resize-b': 's-resize',
        'resize-l': 'w-resize',
        'resize-r': 'e-resize'
    };
    return cursors[handle] || 'default';
}

function selectShape(shape) {
    if (state.selectedShape) {
        state.selectedShape.selected = false;
    }
    
    state.selectedShape = shape;
    
    if (shape) {
        shape.selected = true;
        document.getElementById('deleteShape').disabled = false;
    } else {
        document.getElementById('deleteShape').disabled = true;
    }
    
    render();
}

function deleteSelectedShape() {
    if (state.selectedShape) {
        const index = state.shapes.indexOf(state.selectedShape);
        if (index > -1) {
            state.shapes.splice(index, 1);
        }
        state.selectedShape = null;
        document.getElementById('deleteShape').disabled = true;
        render();
    }
}

function clearAllShapes() {
    if (state.shapes.length === 0) return;
    
    if (confirm('Are you sure you want to clear all shapes?')) {
        state.shapes = [];
        state.selectedShape = null;
        document.getElementById('deleteShape').disabled = true;
        render();
    }
}

function render() {
    if (!state.image) return;

    // Clear canvas
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);

    // Draw original image
    state.ctx.drawImage(state.image, 0, 0, state.canvas.width, state.canvas.height);

    // Get image data once before pixelating
    const sourceImageData = state.ctx.getImageData(0, 0, state.canvas.width, state.canvas.height);

    // Apply pixelation to shapes
    state.shapes.forEach(shape => {
        applyPixelation(shape, sourceImageData);
    });

    // Draw shape outlines
    state.shapes.forEach(shape => {
        shape.draw(state.ctx, shape === state.selectedShape);
    });

    // Draw polygon in progress
    if (state.currentTool === 'polygon' && state.polygonPoints.length > 0) {
        state.ctx.strokeStyle = '#6366f1';
        state.ctx.lineWidth = 2;
        state.ctx.setLineDash([5, 5]);
        state.ctx.beginPath();
        state.ctx.moveTo(state.polygonPoints[0].x, state.polygonPoints[0].y);
        for (let i = 1; i < state.polygonPoints.length; i++) {
            state.ctx.lineTo(state.polygonPoints[i].x, state.polygonPoints[i].y);
        }
        state.ctx.stroke();

        // Draw points
        state.ctx.fillStyle = '#6366f1';
        state.polygonPoints.forEach(point => {
            state.ctx.fillRect(point.x - 3, point.y - 3, 6, 6);
        });
    }
}

function applyPixelation(shape, sourceImageData) {
    const bbox = shape.getBoundingBox();
    const pixelSize = state.pixelSize;
    const canvasWidth = state.canvas.width;

    // Pixelate
    for (let y = Math.floor(bbox.y); y < bbox.y + bbox.height; y += pixelSize) {
        for (let x = Math.floor(bbox.x); x < bbox.x + bbox.width; x += pixelSize) {
            // Check if this pixel block center is inside the shape
            const centerX = x + pixelSize / 2;
            const centerY = y + pixelSize / 2;
            
            if (!shape.contains(centerX, centerY)) continue;

            // Calculate average color for this block
            let r = 0, g = 0, b = 0, count = 0;
            
            for (let py = 0; py < pixelSize; py++) {
                for (let px = 0; px < pixelSize; px++) {
                    const sampleX = Math.floor(x + px);
                    const sampleY = Math.floor(y + py);
                    
                    if (sampleX >= canvasWidth || sampleY >= state.canvas.height) continue;
                    
                    const index = (sampleY * canvasWidth + sampleX) * 4;
                    r += sourceImageData.data[index];
                    g += sourceImageData.data[index + 1];
                    b += sourceImageData.data[index + 2];
                    count++;
                }
            }
            
            if (count === 0) continue;
            
            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            // Fill the pixelated block
            state.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            
            for (let py = 0; py < pixelSize; py++) {
                for (let px = 0; px < pixelSize; px++) {
                    const fillX = Math.floor(x + px);
                    const fillY = Math.floor(y + py);
                    
                    if (fillX >= canvasWidth || fillY >= state.canvas.height) continue;
                    
                    if (shape.contains(fillX, fillY)) {
                        state.ctx.fillRect(fillX, fillY, 1, 1);
                    }
                }
            }
        }
    }
}

function saveImage() {
    if (!state.image) return;

    // Create a new canvas for the final image
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    
    finalCanvas.width = state.originalImage.width;
    finalCanvas.height = state.originalImage.height;

    // Draw original image
    finalCtx.drawImage(state.originalImage, 0, 0);

    // Get image data once before pixelating
    const sourceImageData = finalCtx.getImageData(0, 0, finalCanvas.width, finalCanvas.height);

    // Scale shapes to original image size
    const scaleRatio = state.originalImage.width / state.canvas.width;

    state.shapes.forEach(shape => {
        const scaledShape = scaleShapeToOriginal(shape, scaleRatio);
        applyPixelationToFinalImage(finalCtx, scaledShape, sourceImageData, finalCanvas.width, finalCanvas.height);
    });

    // Download the image
    finalCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pixelated-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
}

function scaleShapeToOriginal(shape, scale) {
    const scaledShape = new Shape(shape.type, {});
    
    switch (shape.type) {
        case 'rectangle':
            scaledShape.data = {
                x: shape.data.x * scale,
                y: shape.data.y * scale,
                width: shape.data.width * scale,
                height: shape.data.height * scale
            };
            break;
        case 'circle':
            scaledShape.data = {
                x: shape.data.x * scale,
                y: shape.data.y * scale,
                radius: shape.data.radius * scale
            };
            break;
        case 'polygon':
            scaledShape.data = {
                points: shape.data.points.map(p => ({
                    x: p.x * scale,
                    y: p.y * scale
                }))
            };
            break;
    }
    
    return scaledShape;
}

function applyPixelationToFinalImage(ctx, shape, sourceImageData, canvasWidth, canvasHeight) {
    const bbox = shape.getBoundingBox();
    const pixelSize = state.pixelSize;

    // Pixelate
    for (let y = Math.floor(bbox.y); y < bbox.y + bbox.height; y += pixelSize) {
        for (let x = Math.floor(bbox.x); x < bbox.x + bbox.width; x += pixelSize) {
            // Check if this pixel block center is inside the shape
            const centerX = x + pixelSize / 2;
            const centerY = y + pixelSize / 2;
            
            if (!shape.contains(centerX, centerY)) continue;

            // Calculate average color for this block
            let r = 0, g = 0, b = 0, count = 0;
            
            for (let py = 0; py < pixelSize; py++) {
                for (let px = 0; px < pixelSize; px++) {
                    const sampleX = Math.floor(x + px);
                    const sampleY = Math.floor(y + py);
                    
                    if (sampleX >= canvasWidth || sampleY >= canvasHeight) continue;
                    
                    const index = (sampleY * canvasWidth + sampleX) * 4;
                    r += sourceImageData.data[index];
                    g += sourceImageData.data[index + 1];
                    b += sourceImageData.data[index + 2];
                    count++;
                }
            }
            
            if (count === 0) continue;
            
            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            // Fill the pixelated block
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            
            for (let py = 0; py < pixelSize; py++) {
                for (let px = 0; px < pixelSize; px++) {
                    const fillX = Math.floor(x + px);
                    const fillY = Math.floor(y + py);
                    
                    if (fillX >= canvasWidth || fillY >= canvasHeight) continue;
                    
                    if (shape.contains(fillX, fillY)) {
                        ctx.fillRect(fillX, fillY, 1, 1);
                    }
                }
            }
        }
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
