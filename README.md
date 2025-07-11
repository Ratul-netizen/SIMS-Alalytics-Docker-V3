# SIMS Analytics

A full-stack analytics application built with Next.js and Python Flask.

## Project Structure

```
.
├── frontend/          # Next.js frontend application
│   ├── src/          # Source code
│   └── ...
└── backend/          # Python Flask backend
    ├── app.py        # Main application file
    └── ...
```

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn
- pip

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Unix/MacOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the Flask application:
   ```bash
   python app.py
   ```
   The backend server will start at http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The frontend will be available at http://localhost:3000

## Development Process

1. **Backend Development**
   - All API endpoints are defined in `backend/app.py`
   - Database migrations are managed through Flask-Migrate
   - Follow PEP 8 style guide for Python code

2. **Frontend Development**
   - Components are located in `frontend/src/components`
   - Pages are in `frontend/src/pages`
   - Use TypeScript for type safety
   - Follow the existing component structure

3. **Testing**
   - Backend: Use pytest for unit tests
   - Frontend: Use Jest and React Testing Library

4. **Version Control**
   - Use feature branches for new development
   - Follow conventional commits
   - Create pull requests for code review

## Environment Variables

### Backend
Create a `.env` file in the backend directory with:
```
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=your_database_url
```

### Frontend
Create a `.env.local` file in the frontend directory with:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
‣䥓卍䅟慮祬楴獣䑟捯敫ੲ‣䥓卍䄭慬祬楴獣䐭捯敫⵲㍖�