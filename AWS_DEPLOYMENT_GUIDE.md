# JobNest AWS Cost-Efficient Deployment & IAM Permission Guide

This guide details the exact **AWS services** required to deploy the JobNest application in the most **cost-efficient way** ($0 to $5/month), along with the specific **IAM permissions** you must ask your AWS Root / Administrator to grant your IAM user account.

---

## 1. Cost-Efficient AWS Architecture Overview

JobNest is built with **Next.js 16 (React, Server Components, API routes), Drizzle ORM (PostgreSQL), and Resend (Email)**.

To keep hosting costs at or near **$0/month (Free Tier)**:
1. **Compute & Frontend:** AWS Amplify Hosting Gen 2 *(Managed Next.js SSR)* OR AWS EC2 `t4g.micro` *(Ubuntu VM running PM2 + Nginx)*.
2. **Database:** Keep using **Neon Serverless PostgreSQL** (Free Tier - $0 AWS cost). *Avoid AWS RDS to save $15–$30/mo.*
3. **File Storage:** **Amazon S3** (5 GB Free Tier for 12 months for candidate resumes & logos).
4. **Environment Secrets:** **AWS Systems Manager (SSM) Parameter Store** (Standard parameters are 100% free; replaces paid AWS Secrets Manager).
5. **SSL & Domain:** **Cloudflare Free / Let's Encrypt (Certbot)** or **AWS Certificate Manager (ACM)**.

---

## 2. Required AWS Services Breakdown

| AWS Service | Deployment Purpose | Expected Cost |
| :--- | :--- | :--- |
| **AWS Amplify Hosting (Gen 2)** | Automatic Next.js SSR & static build hosting directly connected to GitHub | **$0/mo** (Free Tier: 1,000 build mins, 15 GB bandwidth/mo) |
| **Amazon S3** | Storing candidate resumes, profile photos, and company logos | **$0/mo** (Free Tier: 5 GB storage) $\rightarrow$ ~$0.023/GB |
| **AWS SSM Parameter Store** | Securely storing `.env` variables (`POSTGRES_URL`, `JWT_SECRET`, `RESEND_API_KEY`) | **$0/mo** (Standard parameters are free) |
| **Amazon CloudWatch** | Server build logs, runtime error monitoring, and traffic metrics | **$0/mo** (Free Tier: 5 GB log data) |
| **AWS IAM** | Granting your IAM user access to manage and deploy these services | **$0/mo** (Always free) |

---

## 3. IAM Permissions Required for Your IAM User Account

Since you are operating as an **IAM User** (and not the AWS Root User), your AWS Administrator must attach permissions to your IAM User account or IAM Group before you can create and manage resources.

### Option A: Standard AWS Managed Policies (Quickest for Admin to attach)
Ask your AWS Administrator to attach the following AWS-managed policies to your IAM User:

1. `AdministratorAccess-Amplify` *(Grants full access to set up Amplify apps)*
2. `AmazonS3FullAccess` *(Grants ability to create and manage S3 buckets for file uploads)*
3. `AmazonSSMReadOnlyAccess` or `AmazonSSMFullAccess` *(Grants access to read/write environment parameters)*
4. `CloudWatchLogsFullAccess` *(Grants permission to view build logs and error streams)*

---

### Option B: Custom Scoped IAM Policy (Least Privilege Security Model)
If your AWS Administrator prefers a single custom policy restricted only to your project services, share the following JSON policy with them:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AmplifyDeploymentAccess",
      "Effect": "Allow",
      "Action": [
        "amplify:*",
        "cloudfront:*",
        "lambda:*",
        "apigateway:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3StorageAccess",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:GetBucketLocation",
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:PutBucketCors"
      ],
      "Resource": [
        "arn:aws:s3:::jobnest-*",
        "arn:aws:s3:::jobnest-*/*"
      ]
    },
    {
      "Sid": "SSMParameterAccess",
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:PutParameter",
        "ssm:GetParametersByPath"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/jobnest/*"
    },
    {
      "Sid": "CloudWatchLogAccess",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 4. Complete Step-by-Step Implementation Guide

---

### Pillar 1: Compute & Frontend Hosting

#### Option A: AWS Amplify Hosting Gen 2 (Recommended - 100% Serverless & Managed)
> **Best for:** Zero server management, automatic SSL, CDN caching, and continuous deployment directly from GitHub.

1. **Push Code to GitHub:**
   Ensure all local changes are committed and pushed to your repo (`dipendra6447/job_nest`).

2. **Connect to AWS Amplify:**
   - Open [AWS Amplify Console](https://console.aws.amazon.com/amplify/home).
   - Click **Create new app** $\rightarrow$ Choose **GitHub** as source.
   - Authorize AWS Amplify to access `dipendra6447/job_nest`.
   - Select branch (e.g., `main` or `dev`).

3. **Build Settings Verification:**
   Amplify Gen 2 automatically detects Next.js 16 App Router. Verify build command:
   ```yaml
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```

4. **Environment Variables:**
   Inject environment secrets in **App Settings > Environment Variables** (see Pillar 4).

5. **Deploy:**
   Click **Save and Deploy**. Amplify will build Serverless SSR functions and attach a CloudFront CDN.

---

#### Option B: AWS EC2 `t4g.micro` (Alternative - Full Linux VM Control)
> **Best for:** Full server customization using AWS Graviton (ARM64) 750 free hours/month.

1. **Launch EC2 Instance:**
   - AMI: Ubuntu 24.04 LTS (ARM64).
   - Instance Type: `t4g.micro`.
   - Key Pair: Create or select SSH key pair (`jobnest-key.pem`).
   - Security Group Rules:
     - SSH (Port 22) $\rightarrow$ Your IP
     - HTTP (Port 80) $\rightarrow$ Anywhere (`0.0.0.0/0`)
     - HTTPS (Port 443) $\rightarrow$ Anywhere (`0.0.0.0/0`)

2. **Server Environment Setup (SSH):**
   ```bash
   ssh -i "jobnest-key.pem" ubuntu@<EC2-PUBLIC-IP>

   # Update & install Node.js 20, Git, PM2 & Nginx
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs git nginx
   sudo npm install -g pm2
   ```

3. **Clone & Run JobNest with PM2:**
   ```bash
   git clone https://github.com/dipendra6447/job_nest.git
   cd job_nest
   npm install
   nano .env.production # Paste database & secret keys
   npm run build
   pm2 start npm --name "jobnest" -- start
   pm2 save && pm2 startup
   ```

4. **Configure Nginx Reverse Proxy (`/etc/nginx/sites-available/default`):**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Run `sudo systemctl restart nginx`.

---

### Pillar 2: Database Setup (Neon Serverless PostgreSQL)

> **Why Neon:** $0/mo free tier (0.5 GiB storage, auto-suspend compute). Avoid AWS RDS ($15–$30/mo charges).

1. **Create Neon Project:**
   - Log into [Neon.tech](https://neon.tech).
   - Create project `jobnest-db` and select region matching your AWS Amplify / EC2 region (e.g. `us-east-1`).

2. **Obtain Connection String:**
   - Copy connection string: `postgresql://<user>:<password>@<ep-id>.neon.tech/jobnest?sslmode=require`.

3. **Configure Next.js & Drizzle ORM:**
   - Add `DATABASE_URL` to environment variables.
   - Run Drizzle migrations:
     ```bash
     npx drizzle-kit push
     ```

---

### Pillar 3: File Storage (Amazon S3 for Resumes & Logos)

> **Why S3:** 5 GB free tier storage for candidate CVs, profile images, and company logos.

1. **Create S3 Bucket:**
   - Go to **S3 Console** $\rightarrow$ **Create bucket**.
   - Bucket name: `jobnest-storage-prod` (must be globally unique).
   - AWS Region: Same as compute region (e.g., `us-east-1`).

2. **Configure CORS Rules (For Direct Frontend Uploads):**
   In S3 Bucket $\rightarrow$ **Permissions** $\rightarrow$ **Cross-origin resource sharing (CORS)**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "HEAD", "DELETE"],
       "AllowedOrigins": ["https://yourdomain.com", "https://*.amplifyapp.com", "http://localhost:3000"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

3. **Candidate Resume Security Practice:**
   - Public read access for logos/photos (`public/logos/*`).
   - Private access for resumes (`resumes/*`) accessed via S3 Presigned URLs generated dynamically in Next.js Server Components.

---

### Pillar 4: Environment Secrets (SSM Parameter Store & Amplify Env Vars)

> **Why SSM Parameter Store:** Standard parameters are 100% free ($0 cost vs AWS Secrets Manager $0.40/secret/month).

1. **Creating Parameters in SSM Parameter Store:**
   - Open **AWS Systems Manager** $\rightarrow$ **Parameter Store**.
   - Click **Create parameter**:
     - Name: `/jobnest/prod/DATABASE_URL` | Type: `SecureString`
     - Name: `/jobnest/prod/JWT_SECRET` | Type: `SecureString`
     - Name: `/jobnest/prod/RESEND_API_KEY` | Type: `SecureString`
     - Name: `/jobnest/prod/AWS_S3_BUCKET_NAME` | Type: `String`

2. **Injecting into Amplify Hosting:**
   - Go to **Amplify Console** $\rightarrow$ **App Settings** $\rightarrow$ **Environment Variables**.
   - Add key-value pairs matching parameter names.

---

### Pillar 5: Custom Domain & SSL Setup

#### Option A: AWS Amplify Custom Domain (Automatic Free SSL via ACM)
1. In Amplify Console $\rightarrow$ **Domain Management** $\rightarrow$ Click **Add domain**.
2. Enter your custom domain name (e.g., `jobnest.com`).
3. Amplify generates DNS CNAME records. Add these CNAMEs to your domain registrar (Cloudflare, Namecheap, GoDaddy).
4. SSL certificate is automatically issued and renewed for free via AWS Certificate Manager (ACM).

#### Option B: EC2 + Cloudflare Free DNS & SSL / Let's Encrypt Certbot
- **Via Cloudflare Free:** Point domain A record to EC2 Public IP. Set Cloudflare SSL/TLS mode to **Full**.
- **Via Certbot (Let's Encrypt on EC2):**
  ```bash
  sudo apt install -y certbot python3-certbot-nginx
  sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
  ```

---

## 5. Cost Optimization Rules (Avoid Accidental Charges)

1. **Do NOT launch AWS RDS:** Managed PostgreSQL instances on RDS cost ~$15-$30/mo minimum. Keep database hosting on Neon PostgreSQL free tier.
2. **Do NOT use AWS Secrets Manager:** It costs $0.40 per secret per month. Use **SSM Parameter Store** (Standard) or set environment variables directly inside AWS Amplify console settings.
3. **Do NOT provision NAT Gateways or Elastic IPs without attached EC2 instances:** Unattached Elastic IPs cost $0.005/hour.
4. **Configure S3 Lifecycle Policies:** Set old resume/image versions to expire or auto-delete after 90 days if redundant.

