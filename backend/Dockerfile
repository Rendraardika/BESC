FROM golang:1.20-alpine AS builder
RUN apk add --no-cache git
WORKDIR /build

# copy full repo and build the backend binary
COPY . /build
WORKDIR /build/backend
RUN go env -w GOPROXY=https://proxy.golang.org
RUN go build -o besc-api ./cmd/api

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /build/backend/besc-api /app/besc-api
COPY --from=builder /build/backend/uploads /app/uploads

ENV APP_PORT=8080
EXPOSE 8080
CMD ["/app/besc-api"]
