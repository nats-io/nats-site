+++
date = "2015-09-27"
title = "Using NATS with Minio"
description = ""
category = "tutorials"
[menu.main]
  name = "Minio"
  weight = 12
  identifier = "doc-nats-minio"
  parent = "Additional Documentation"
+++

[Minio](https://www.minio.io) is a Golang-based object store, increasingly popular for cloud native deployments. Minio is S3 compatible, and runs across a wide variety of platforms.

This demonstration will show you how to run a Minio object store on a local machine, configure a local NATS instance, and finally replicate objects to other clouds.

#### Step 1: Install and run NATS Server

`go get github.com/nats-io/nats-server`

#### Step 2: Install Minio

`go get github.com/minio/minio`

#### Step 3: Configure Minio to use NATS for event subscription

Edit `~/.minio/config.json`

Enable NATS in the configuration by setting: `"nats"."1"."enable": true`

For example:

```json
{
  "nats": {
    "1": {
      "enable": true,
      "address": "0.0.0.0:4222",
      "subject": "bucketevents"
    }
  }
}
```

#### Step 4: Run Minio

`minio server ~/minio-tmp/`

#### Step 5: Run Minio-NATS

`go run minionats/main.go -remote s3://accessKeyId:accessSecretKey@host:port -local s3://accessKeyId:accessSecretKey@host:port`

#### Step 6: Try it out!

- Go into your test bucket [Minio Browser](http://localhost:9000/minio/minio-nats-example/) your [S3 Bucket](https://console.aws.amazon.com/s3/buckets/minio-nats-example)
- Now when you upload or delete a file in Minio, these changes will be replicated on your S3 Bucket!

## Usage flags

```sh
Usage of demo-minio-nats:
  -bucket string
    	bucket to test with (default "minio-nats-example")
  -local string
    	local S3 URL in format s3://accessKeyId:accessSecretKey@host:port
  -nats string
    	NATS URL in format nats://user:password@host:port (default "nats://localhost:4222")
  -region string
    	region to create and maintain bucket (default "us-east-1")
  -remote string
    	remote S3 URL in format s3://accessKeyId:accessSecretKey@host:port
  -tmpDir string
    	temporary directory for copying files (default "/tmp/")
```
