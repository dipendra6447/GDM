# JobNest - Required AWS Services & IAM Permissions Guide

This document lists the exact **AWS services** and **IAM permissions** you must request from your **AWS Root User / Administrator** to deploy the JobNest application in the most cost-efficient way ($0/month Free Tier).

---

## 🛠️ Required AWS Services Breakdown

| AWS Service | Purpose in JobNest | Requested IAM Policy / Access |
| :--- | :--- | :--- |
| **AWS Amplify (Hosting Gen 2)** | Hosting Next.js 16 (SSR, API routes, and static pages) connected to GitHub | `AdministratorAccess-Amplify` |
| **Amazon S3 (Simple Storage Service)** | Storing candidate resumes, profile photos, and company logos | `AmazonS3FullAccess` |
| **AWS SSM Parameter Store (Systems Manager)** | Secure, free storage for environment variables (`DATABASE_URL`, `JWT_SECRET`, `RESEND_API_KEY`) | `AmazonSSMFullAccess` |
| **Amazon CloudWatch** | Viewing deployment build logs and runtime error streams | `CloudWatchLogsFullAccess` |

---

## 📋 What to Send to your AWS Root / Administrator User

Ask your AWS Administrator to either:

### Option A: Attach AWS Managed Policies (Quickest)
Attach the following managed policies to your **IAM User account**:
1. `AdministratorAccess-Amplify`
2. `AmazonS3FullAccess`
3. `AmazonSSMFullAccess`
4. `CloudWatchLogsFullAccess`

---

### Option B: Custom Scoped Policy JSON (Least Privilege Security)
If your AWS Admin prefers a custom policy, provide them with this JSON statement:

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

## 💡 External Services (No AWS Charges)

To maintain **$0/month hosting costs**, the following components are kept off AWS:
- **Database:** Neon Serverless PostgreSQL (Free Tier - $0 AWS cost, replaces AWS RDS).
- **Email Delivery:** Resend API (Free Tier - $0 AWS cost, replaces AWS SES).
- **Secrets Management:** Environment variables set in Amplify Console or SSM Parameter Store (Free Tier, replaces AWS Secrets Manager).
