# AWS Deployment Guide

This guide explains how to deploy the Crop Recommendation application to AWS.

## Architecture
- **Backend**: Hosted on **AWS App Runner** (or ECS Fargate) to run the Dockerized FastAPI app.
- **Frontend**: Hosted on **AWS Amplify** (e.g. connected to GitHub) or S3 + CloudFront.

## Prerequisites
1.  AWS Account.
2.  AWS CLI installed and configured.
3.  Docker installed.

## Step 1: Deploy Backend (AWS App Runner) - Easiest Method
1.  Push your code to a GitHub repository.
2.  Go to the [AWS App Runner Console](https://console.aws.amazon.com/apprunner).
3.  Click **Create an App Runner service**.
4.  **Source**: Select **Source code repository**.
5.  Connect your GitHub account and select your repository.
6.  **Configuration**:
    - **Runtime**: Python 3
    - **Build command**: `pip install -r backend_app/requirements.txt`
    - **Start command**: `uvicorn backend_app.main:app --host 0.0.0.0 --port 8000`
    - **Port**: 8000
    *(Alternatively, you can choose "Container registry" if you push your Docker image to ECR using the `buildspec.yml` provided).*
7.  Deploy. App Runner will give you a public URL (e.g., `https://xyz.awsapprunner.com`).

## Step 2: Update Frontend Configuration
Once you have the backend URL from Step 1:
1.  Open `vite.config.ts`.
2.  Update the `proxy` target or, for production, verify how your frontend calls the API. 
    > **Note**: In production, the Vite proxy doesn't work (it's dev-only). You need to set the API URL in an environment variable.
3.  Create/Update `.env.production`:
    ```
    VITE_API_URL=https://your-app-runner-url.awsapprunner.com
    ```
4.  Update `backend/sevices/apiService.ts` to use this variable if it doesn't already.

## Step 3: Deploy Frontend (Vercel)
1.  Push your code to **GitHub**.
2.  Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Framework Preset**: Select **Vite**.
5.  **Root Directory**: ensure it is set to `./` (root).
6.  **Environment Variables**:
    - Name: `VITE_API_URL`
    - Value: `https://your-backend-service.awsapprunner.com` (The URL you got from Step 1).
7.  Click **Deploy**.


## Alternative: Deploy Backend using Docker & ECR
If you prefer using the provided `Dockerfile`:
1.  Create an **ECR Repository** named `crop-backend`.
2.  Build and push the image:
    ```bash
    aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account_id>.dkr.ecr.<region>.amazonaws.com
    docker build -t crop-backend ./backend_app
    docker tag crop-backend:latest <account_id>.dkr.ecr.<region>.amazonaws.com/crop-backend:latest
    docker push <account_id>.dkr.ecr.<region>.amazonaws.com/crop-backend:latest
    ```
3.  Deploy this image to **App Runner** or **ECS**.
