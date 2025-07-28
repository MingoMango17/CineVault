# 🎬 CineVault

<p align="center">
  <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django">
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular">
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/Celery-37B24D?style=for-the-badge&logo=celery&logoColor=white" alt="Celery">
</p>

<p align="center">
  A modern, Netflix-inspired movie management platform built with Django and Angular. CineVault allows users to upload, manage, and stream their movie collection with a sleek, responsive interface.
</p>

## ✨ Features

- 🎥 **Movie Management**: Complete CRUD operations for movie collection
- 📁 **File Upload**: Support for video file uploads and storage
- 🎬 **Video Streaming**: Built-in video player with HTML5 video tag
- 🔍 **Movie Discovery**: Browse and search through your movie library
- 📱 **Responsive Design**: Netflix-inspired UI that works on all devices
- ⚡ **Real-time Updates**: Seamless user experience with loading indicators
- 🔐 **API-First Architecture**: RESTful API design for maximum flexibility

## 🛠️ Tech Stack

### Backend
- **Django**: Web framework for rapid development
- **Django REST Framework (DRF)**: API development toolkit
- **Celery**: Asynchronous task processing
- **Redis**: Message broker and caching
- **SQLite**: Database storage

### Frontend
- **Angular**: Modern frontend framework
- **TypeScript**: Type-safe JavaScript development
- **Angular Material**: UI component library
- **RxJS**: Reactive programming
- **HttpClient**: HTTP client for API communication

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Redis server

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/MingoMango17/CineVault.git
   cd cinevault
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start Redis server**
   ```bash
   redis-server
   ```

8. **Start Celery worker** (new terminal)
   ```bash
   python manage.py celery_worker
   ```

9. **Start Django server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   ng serve
   ```

4. **Access the application**
   ```
   Frontend: http://localhost:4200
   Backend API: http://localhost:8000
   Admin Panel: http://localhost:8000/admin
   ```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/movies/` | List all movies |
| GET | `/api/v1/movies/{id}/` | Get movie details |
| POST | `/api/v1/movies/` | Create new movie |
| PUT | `/api/v1/movies/{id}/` | Update movie |
| DELETE | `/api/v1/movies/{id}/` | Delete movie |

### Example API Usage

**Create a movie:**
```bash
curl -X POST http://localhost:8000/api/movies/ \
  -H "Content-Type: multipart/form-data" \
  -F "title=The Matrix" \
  -F "description=A computer programmer discovers reality" \
  -F "video_file=@matrix.mp4"
```

**Get all movies:**
```bash
curl http://localhost:8000/api/movies/
```

## 🎯 Key Features Implementation

### Movie Model
```python
class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    date_added = models.DateField(auto_now_add=True)
    video_file = models.FileField(upload_to='movies/')
```

### File Upload Configuration
- **MEDIA_URL**: `/media/`
- **MEDIA_ROOT**: Configured for file storage
- **File serving**: Enabled in development mode

### Frontend Components
- **Movie List**: Grid layout with movie cards
- **Movie Detail**: Video player and movie information
- **Movie Form**: Upload and edit functionality
- **Video Player**: HTML5 video with custom controls

## 👨‍💻 Author

**Junry Mingo**
- GitHub: [@MingoMango17](https://github.com/MingoMango17/CineVault)
- LinkedIn: [Junry Mingo](https://www.linkedin.com/in/junry-mingo-2bb819246/)
