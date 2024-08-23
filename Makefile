.PHONY: build
build:
	@echo "Building site..."
	hugo --minify

.PHONY: deploy-dev
deploy-dev:
	@echo "Deploying to development..."
	hugo --minify --baseURL=$(DEPLOY_DEV_URL) && \
	aws s3 sync --delete public/ s3://$(DEPLOY_DEV_BUCKET)

.PHONY: deploy-prod
deploy-prod:
	@echo "Deploying to production..."
	hugo --minify --baseURL=$(DEPLOY_PROD_URL) && \
	aws s3 sync --delete public/ s3://$(DEPLOY_PROD_BUCKET) && \
	aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

.PHONY: build-docker
build-docker:
	@echo "Building docker image..."
	docker buildx build --load -t hecha00/hugo-blox:1.0 . 

