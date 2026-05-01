# SnapVault — Cloud-Native Photo Sharing
> COM769 Coursework 2 | MSc Computer Science | Microsoft Azure

## Advanced Features (3 — Distinction Level)
1. JWT Authentication + Role-Based Access (Creator / Consumer)
2. Azure Computer Vision — AI auto-tagging on every upload
3. GitHub Actions CI/CD — auto-deploy to Azure on every push

## Azure Services Required
| Service | Purpose | Tier |
|---|---|---|
| App Service | Python FastAPI backend | Free F1 |
| Static Web Apps | HTML/JS frontend | Free |
| Cosmos DB | NoSQL database | Free tier |
| Blob Storage | Image files | Pay-per-use (minimal) |
| Computer Vision | AI photo tagging | Free F0 |

## Quick Start — Local
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # fill in your Azure keys
uvicorn main:app --reload
# Open frontend/login.html with VS Code Live Server
```

## Create Creator Account (via Swagger UI)
```
Go to: http://localhost:8000/docs
POST /auth/create-creator
{
  "username": "creator1",
  "email": "creator@demo.com",
  "password": "Demo1234!",
  "admin_key": "your SECRET_KEY value"
}
```

## Azure Deployment Order
1. Create Resource Group
2. Create Cosmos DB (free tier) → create database + 3 containers
3. Create Blob Storage → create container named photos (Blob access)
4. Create Computer Vision (free F0)
5. Create App Service (Python 3.11, Free F1) → connect to GitHub /backend
6. Set App Service env vars + startup command
7. Create Static Web App → connect to GitHub /frontend
8. Update AZURE_API in frontend/js/config.js → push → done

## App Service Startup Command
```
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --timeout 120
```

## App Service Environment Variables
```
COSMOS_URL, COSMOS_KEY, COSMOS_DB
BLOB_CONNECTION, BLOB_CONTAINER
VISION_KEY, VISION_ENDPOINT
SECRET_KEY, ALLOWED_ORIGINS
```
