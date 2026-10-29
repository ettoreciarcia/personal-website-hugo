.PHONY: dev
dev:
	npm run dev

.PHONY: build
build:
	@echo "Building site..."
	npm run build

.PHONY: preview
preview: build
	npm run preview

.PHONY: deploy-dev
deploy-dev: build
	@echo "Deploying to development..."
	aws s3 sync --delete dist/ s3://$(DEPLOY_DEV_BUCKET)

.PHONY: deploy-prod
deploy-prod: build
	@echo "Deploying to production..."
	aws s3 sync --delete dist/ s3://$(DEPLOY_PROD_BUCKET) && \
	aws cloudfront create-invalidation --distribution-id $(DISTRIBUTION_ID) --paths "/*"

.PHONY: build-docker
build-docker:
	@echo "Building docker image..."
	docker buildx build --load -t hecha00/ettoreciarcia-site:2.0 .
