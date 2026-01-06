.PHONY: dev backend frontend install-backend install-frontend

# Default target
dev: install-backend install-frontend
	@echo "Starting both servers..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@trap 'kill 0' EXIT; \
	cd backend && uv run uvicorn main:app --reload --port 8000 & \
	cd frontend && pnpm dev

# Backend only
backend:
	cd backend && uv run uvicorn main:app --reload --port 8000

# Frontend only
frontend:
	cd frontend && pnpm dev

# Install backend dependencies
install-backend:
	cd backend && uv sync

# Install frontend dependencies
install-frontend:
	cd frontend && pnpm install

# Clean
clean:
	rm -rf frontend/.next
	rm -rf frontend/node_modules
	find backend -type d -name __pycache__ -exec rm -r {} +
	find backend -type f -name "*.pyc" -delete

