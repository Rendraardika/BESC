FROM golang:1.22-alpine AS builder
RUN apk add --no-cache git
WORKDIR /build

# copy full repo and build the backend binary
COPY . /build
WORKDIR /build/backend
RUN go env -w GOPROXY=https://proxy.golang.org
RUN go build -o besc-api ./cmd/api
RUN go build -o migrate-avatars ./cmd/migrate_avatars

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
RUN apk add --no-cache netcat-openbsd
WORKDIR /app
COPY --from=builder /build/backend/besc-api /app/besc-api
COPY --from=builder /build/backend/migrate-avatars /app/migrate-avatars
COPY backend/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
RUN mkdir -p /app/uploads

ENV APP_PORT=8080
EXPOSE 8080
CMD ["/app/entrypoint.sh"]
