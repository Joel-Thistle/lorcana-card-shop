# Lorcana Card Shop

A full-stack e-commerce application for buying and selling Disney Lorcana trading cards.

## Features

- View and filter Lorcana cards by set, rarity, and color
- Shopping cart with persistent storage
- Premium packaging options
- Shipping calculator
- Admin controls for managing card prices
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: React 19, React Router v7, Bootstrap 5, Vite
- **Backend**: Python, Flask, MongoDB
- **Deployment**: Docker, Docker Compose, Nginx

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Node.js](https://nodejs.org/) (for local development)
- [Python](https://www.python.org/) (for local development)

### Development Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/lorcana-card-shop.git
   cd lorcana-card-shop
   ```

2. Install frontend dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. For backend development, set up a Python environment and install dependencies
   ```
   cd backend
   pip install -r requirements.txt
   ```

5. Run the Flask API
   ```
   python lorcana_api.py
   ```

### Docker Deployment

1. Build and start all services
   ```
   docker-compose up --build
   ```

2. Access the application
   - Frontend: http://localhost:80
   - Backend API: http://localhost:5000/api

3. Stop the application
   ```
   docker-compose down
   ```

## Project Structure

- `/src` - React frontend code
- `/backend` - Flask API
- `/mongo-init` - MongoDB initialization scripts
- `/imgs` - Image assets
- `/public` - Public assets

## Environment Variables

The following environment variables can be set in a `.env` file:

- `MONGODB_URI` - MongoDB connection string
- `MONGODB_USER` - MongoDB username (optional)
- `MONGODB_PASSWORD` - MongoDB password (optional)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Disney Lorcana card game by Ravensburger
- React and Flask communities for excellent documentation
