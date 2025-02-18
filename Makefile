make:
	cd frontend && npx tailwindcss -i ./public/style.css -o ../dist/output.css
	cd frontend && npx tsc
	node backend/server.js

com:
	cd frontend && npx tailwindcss -i ./public/style.css -o ../dist/output.css
	cd frontend && npx tsc

clean:
	rm -r dist

.PHONY: make, com
