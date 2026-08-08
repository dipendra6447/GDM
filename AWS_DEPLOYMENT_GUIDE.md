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

## 4. Step-by-Step Deployment Instructions (AWS Amplify - Recommended)

### Step 1: Request IAM Permissions
Send the policy list in **Section 3** to your AWS Administrator and request access.

### Step 2: Push Code to GitHub
Ensure all latest code is committed and pushed to your repository (`dipendra6447/job_nest`).

### Step 3: Connect to AWS Amplify
1. Log in to the AWS Management Console with your IAM User credentials.
2. Search for **AWS Amplify** in the top search bar.
3. Click **Create new app** $\rightarrow$ Select **GitHub** as the source repository.
4. Authorize AWS Amplify to access `dipendra6447/job_nest`.
5. Select branch `dev` or `main`.

### Step 4: Configure Environment Variables in Amplify
In the Amplify setup wizard under **Environment Variables**, add:
* `DATABASE_URL` = *(Your Neon PostgreSQL connection string)*
* `JWT_SECRET` = *(Your JWT secret string)*
* `RESEND_API_KEY` = *(Your Resend email API key)*
* `NEXT_PUBLIC_APP_URL` = `https://your-domain.com` or your Amplify default URL.

### Step 5: Deploy
Click **Save and Deploy**. Amplify will automatically:
* Install node modules (`npm install`)
* Run Next.js build (`npm run build`)
* Provision Serverless SSR function & CloudFront CDN distribution.

---

## 5. Cost Optimization Rules (Avoid Accidental Charges)

1. **Do NOT launch AWS RDS:** Managed PostgreSQL instances on RDS cost ~$15-$30/mo minimum. Keep database hosting on Neon PostgreSQL free tier.
2. **Do NOT use AWS Secrets Manager:** It costs $0.40 per secret per month. Use **SSM Parameter Store** (Standard) or set environment variables directly inside AWS Amplify console settings.
3. **Do NOT provision NAT Gateways or Elastic IPs without attached EC2 instances:** Unattached Elastic IPs cost $0.005/hour.
4. **Configure S3 Lifecycle Policies:** Set old resume/image versions to expire or auto-delete after 90 days if redundant.
