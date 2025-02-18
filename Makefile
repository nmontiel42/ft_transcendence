make:
	@if [ ! -d "frontend/node_modules" ]; then \
		cd frontend && npm install; \
	fi
	cd frontend && npx tailwindcss -i ./public/style.css -o ../dist/output.css
	cd frontend && npx tsc
	if [ ! -d "backend/node_modules" ]; then \
		cd backend && npm install; \
	fi
	node backend/server.js

com:
	@if [ ! -d "frontend/node_modules" ]; then \
		cd frontend && npm install; \
	fi
	cd frontend && npx tailwindcss -i ./public/style.css -o ../dist/output.css
	cd frontend && npx tsc

clean:
	rm -r dist

.PHONY: make, com
