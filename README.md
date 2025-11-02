# Pixel82 - Image Pixelation Tool

A modern, fully client-side web application for pixelating sections of images. Perfect for privacy protection, creating artistic effects, or obscuring sensitive information in images.

![Pixel82](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- **🖼️ Client-Side Processing**: All image processing happens in your browser - no uploads to servers
- **📱 Mobile & Desktop**: Fully responsive design works seamlessly on all devices
- **🎨 Multiple Drawing Tools**:
  - Rectangle tool for quick box selections
  - Circle tool for circular areas
  - Freehand polygon tool for precise custom shapes
- **✏️ Shape Manipulation**:
  - Select and move shapes
  - Resize shapes with intuitive handles
  - Delete individual shapes or clear all
- **⚙️ Adjustable Pixelation**: Pixel size slider (2-50px) for different blur levels
- **💾 Save Locally**: Export processed images directly to your device
- **🌙 Modern Dark UI**: Beautiful dark-mode interface with smooth interactions
- **🚀 Zero Dependencies**: Pure vanilla JavaScript - no frameworks required

## 🎯 Use Cases

- Blur faces in photos for privacy
- Obscure license plates in images
- Hide sensitive information in screenshots
- Create artistic pixelated effects
- Redact confidential documents

## 📦 Installation & Setup

### Local Development

#### Prerequisites
- Python 3.x (for the development server)

#### Quick Start

1. Clone or download this repository:
```bash
git clone <repository-url>
cd pixel82
```

2. Start the development server:
```bash
python3 server.py
# or
./server.py
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

That's it! The app will load and you can start pixelating images.

### Production Deployment with Docker

#### Using Docker

1. Build the Docker image:
```bash
docker build -t pixel82 .
```

2. Run the container:
```bash
docker run -d -p 8080:80 --name pixel82 pixel82
```

3. Access the application at:
```
http://localhost:8080
```

#### Using Docker Compose

1. Start the application:
```bash
docker-compose up -d
```

2. Access the application at:
```
http://localhost:8080
```

3. Stop the application:
```bash
docker-compose down
```

## 🎮 How to Use

1. **Upload an Image**
   - Click the "Upload Image" button or drag & drop a JPEG/PNG file
   - The image will load onto the canvas

2. **Draw Pixelation Areas**
   - **Rectangle Tool**: Click and drag to draw rectangles
   - **Circle Tool**: Click center point and drag to set radius
   - **Polygon Tool**: Click to add points, double-click to finish the shape
   - Adjust pixel size with the slider (2-50px)

3. **Edit Shapes**
   - Click the **Select Tool** (cursor icon)
   - Click on any shape to select it
   - Drag the shape to move it
   - Drag the handles to resize it
   - Click "Delete Selected" to remove it

4. **Save Your Work**
   - Click "Save Image" to download the pixelated version
   - The exported image maintains the original resolution

## 🛠️ Technical Details

### Architecture
- **Pure Client-Side**: No server-side processing required
- **HTML5 Canvas**: High-performance image manipulation
- **Vanilla JavaScript**: No framework dependencies
- **Responsive CSS**: Mobile-first design approach

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

### File Structure
```
pixel82/
├── index.html          # Main HTML structure
├── styles.css          # UI styles and responsive design
├── app.js              # Core application logic
├── server.py           # Development server
├── Dockerfile          # Production Docker image
├── nginx.conf          # Nginx configuration
├── docker-compose.yml  # Docker Compose setup
└── README.md           # This file
```

## 🎨 Features in Detail

### Drawing Tools

**Rectangle Tool** 🟦
- Click and drag to create rectangular selections
- Perfect for standard areas like license plates or text blocks

**Circle Tool** ⭕
- Click center point and drag outward to set radius
- Ideal for faces or circular objects

**Polygon Tool** 🔷
- Click to place each vertex of a custom polygon
- Double-click to complete the shape
- Great for irregular areas that need precise selection

### Shape Manipulation

**Selection & Movement**
- Use the Select tool to pick any drawn shape
- Drag anywhere inside the shape to reposition it
- Selected shapes are highlighted in blue

**Resizing**
- Corner handles: Scale proportionally
- Edge handles: Stretch in one direction
- Minimum size constraints prevent accidental deletion

**Deletion**
- Delete individual shapes with "Delete Selected"
- Clear all shapes at once with "Clear All"

### Pixelation Algorithm

The app uses a sophisticated pixelation algorithm that:
1. Divides the selected area into blocks based on pixel size
2. Calculates the average color of each block
3. Fills the entire block with that average color
4. Respects shape boundaries precisely (including curved and polygon edges)

## 🔒 Privacy & Security

- **100% Client-Side**: Images never leave your device
- **No Tracking**: No analytics or user tracking
- **No Uploads**: All processing happens in your browser
- **No Storage**: Images are not stored anywhere

## 📱 Mobile Usage Tips

- Use two-finger pinch to zoom your viewport if needed
- Tap tools to select them
- Tap and drag to draw shapes
- Double-tap to finish polygon shapes
- Use the Select tool to reposition or resize shapes

## 🐛 Troubleshooting

**Issue**: Images appear blurry or low quality
- **Solution**: The app automatically scales images to fit your screen. The saved image will be full resolution.

**Issue**: Can't draw shapes
- **Solution**: Make sure you've uploaded an image first and selected a drawing tool.

**Issue**: Polygon won't close
- **Solution**: Double-click (or double-tap on mobile) to finish drawing a polygon.

**Issue**: Development server won't start
- **Solution**: Make sure Python 3 is installed and port 8000 is available.

## 🚀 Deployment Options

### Static Hosting
Since this is a purely client-side app, you can deploy it to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Azure Static Web Apps

Simply upload the `index.html`, `styles.css`, and `app.js` files.

### Docker Deployment
The included Dockerfile creates a production-ready nginx container:
- Optimized for performance
- Gzip compression enabled
- Security headers configured
- Health check endpoint at `/health`

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 💡 Future Enhancements

Potential features for future versions:
- Undo/Redo functionality
- Shape rotation
- Copy/paste shapes
- Blur effect as alternative to pixelation
- Custom color overlays
- Batch processing
- Keyboard shortcuts

## 📞 Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Made with ❤️ for privacy and creativity**
