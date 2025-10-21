.PHONY: watch-server

watch-server:
	reflex -r '\.go$$' -s -- sh -c 'go build -o bin/ ./cmd/server/ && ./bin/server'