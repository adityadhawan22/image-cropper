import React, { Component } from 'react';

class ImageResizer extends Component {

    state = {
        isDragging: false,
        x: 0,
        y: 0,
        canvas: null,
        ctx: null,
        currentX: 0,
        currentY: 0,
        image: null,
        zoomValue: 1,
        canvasRef: React.createRef(),
    }

    componentDidMount() {
        const { file, width, height } = this.props;
        // let canvas = document.createElement("canvas");
        let canvas = this.state.canvasRef.current;
        canvas.height = height;
        canvas.width = width;

        let ctx = canvas.getContext("2d");
        let _URL = window.URL || window.webkitURL;
        var objectUrl = _URL.createObjectURL(file[0]);
        let _this = this;

        let image = new Image();
        image.onload = function () {
            _this.setState({ image }, () => { _this.renderDefault(); });
        }

        image.src = objectUrl;
        // document.body.appendChild(canvas);


        this.setState({ ctx, canvas, image, width, height });

        canvas.addEventListener('mousemove', this.startDragging);
        canvas.addEventListener('mouseup', this.mouseUp);
        canvas.addEventListener('mousedown', this.mouseDown);

        // Adding a support for mobile devices
        canvas.addEventListener('touchmove', this.startDragging);
        canvas.addEventListener('touchend', this.mouseUp);
        canvas.addEventListener('touchstart', this.mouseDown);

    }

    mouseUp = (event) => {
        event.preventDefault();
        this.setState({ isDragging: false });
        if (event.type === 'touchend')
            document.body.style.overflowY = 'scroll';
    }

    mouseDown = (event) => {
        event.preventDefault();

        let currentX = event.pageX;
        let currentY = event.pageY;

        if (event.type === 'touchstart') {
            currentX = event.touches[0].pageX;
            currentY = event.touches[0].pageY;
            document.body.style.overflowY = 'hidden';
        }

        this.setState({ currentX, currentY, isDragging: true });

    }

    startDragging = (event) => {
        event.preventDefault();

        const { isDragging, ctx, image, width, height } = this.state;
        if (!isDragging) {
            return;
        }
        else {
            let { x, y, currentX, currentY } = this.state;
            let xpos = event.pageX;
            let ypos = event.pageY;

            if (event.type === 'touchmove') {
                xpos = event.touches[0].pageX;
                ypos = event.touches[0].pageY;
            }

            let smoothing = 2;
            x = x + ((currentX - xpos) / smoothing) * -1;
            y = y + ((currentY - ypos) / smoothing) * -1;


            let imageWidth = image.width;
            let imageHeight = image.height;

            let ratio = width / imageWidth;
            let aspectRatio = (imageHeight * ratio < height) ? height / imageHeight : width / imageWidth;
            aspectRatio = this.state.zoomValue * aspectRatio;
            if (x < width - imageWidth * aspectRatio) {
                x = width - imageWidth * aspectRatio;
            }

            if (y < height - imageHeight * aspectRatio) {
                y = height - imageHeight * aspectRatio;
            }

            if (y > 0) {
                y = 0;
            }
            if (x > 0) {
                x = 0;
            }

            // Smoothing
            // if(Math.random() < 0.1){
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(image, x, y, imageWidth * aspectRatio, imageHeight * aspectRatio);
            this.setState({ x, y });
            // }
        }
    }

    onZoomChange = (e) => {
        let value = e.target.value ? e.target.value : 1;
        this.setState({ x: 0, y: 0, zoomValue: value }, () => { this.renderDefault() });
    }

    renderDefault = () => {
        const { image, width, height, ctx } = this.state;
        let imageWidth = image.width;
        let imageHeight = image.height;
        let ratio = width / imageWidth;
        let aspectRatio = (imageHeight * ratio < height) ? height / imageHeight : width / imageWidth;
        aspectRatio = this.state.zoomValue * aspectRatio;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, imageWidth * aspectRatio, imageHeight * aspectRatio);
    }


    saveImage = async () => {
        const { callback } = this.props;
        const { canvasRef } = this.state;
        const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve, 'image/jpeg'))
        callback(blob);
    }

    render() {
        return (
            <div>
                <canvas ref={this.state.canvasRef}></canvas>
                <div className="edit-wrap">
                    <label>Zoom Value:</label>
                    <input type="number" step="0.5" onChange={(e) => this.onZoomChange(e)} name="points" min="1" max="10" />
                </div>
                <p>Drag up/down/left/right edit the image! </p>
                <div className="download-wrapper">
                    <div className="download" onClick={this.saveImage}> Save </div>
                </div>
            </div>
        );
    }
}

export default ImageResizer;