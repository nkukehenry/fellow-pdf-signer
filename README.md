# Fello Sign

Fello Sign is a professional web-based tool designed to handle PDF signing and annotation with high precision and security. It allows users to upload PDF documents, add stylized signatures or plain text annotations, and export the signed results with professional accuracy.

## Features

### Signature Management
- **Draw Signature**: Free-hand drawing pad with smooth stroke capture.
- **Type Signature**: Multiple professional handwriting fonts for quick signing.
- **Upload Signature**: Support for image-based signatures with transparent background support.
- **Styling**: Choice of professional ink colors including Black, Navy, and Red.
- **Date Stamping**: Optional automatic blue ink date stamp centered beneath the signature.

### Text Annotations
- Dedicated tool for adding plain text notes, names, or additional dates to any PDF page.
- Same smooth repositioning capabilities as signature elements.

### User Experience
- **Smooth Drag-and-Drop**: High-priority interaction layers ensure responsive repositioning of all elements.
- **Precision Drawing**: Dedicated selection tools for defining the exact size and location of signatures.
- **Real-time Feedback**: Visual cues for placement, sizing, and alignment.
- **Automatic Cleanup**: Input modals reset automatically after use for a fluid workflow.

### PDF Processing
- Local processing ensures document privacy.
- Pixel-perfect coordinate mapping between browser UI and PDF points.
- High-quality font embedding and image composition.

## Technical Stack
- **Frontend**: Angular with Standalone Components.
- **Styling**: Tailwind CSS for a premium, responsive interface.
- **PDF Engine**: pdf-lib for document manipulation and pdfjs-dist for high-quality rendering.
- **Signature Engine**: signature_pad for smooth vector-based drawing.

## Setup and Development

### Prerequisites
- Node.js and npm installed on your system.
- Angular CLI installed globally.

### Installation
1. Clone the repository to your local machine.
2. Run `npm install` to install project dependencies.

### Development Server
Run the following command to start a local development server:
```bash
ng serve
```
Navigate to `http://localhost:4200/` in your browser. The application will reload automatically upon source file changes.

### Build
To create a production-ready build, run:
```bash
ng build
```
The compiled artifacts will be stored in the `dist/` directory.

## License
Refer to the project's license documentation for usage rights and restrictions.
