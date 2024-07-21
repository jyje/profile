---
layout:     post
categories: [ "works" ]
tags:
  - devops
  - kubernetes
  - aws
description: >
  For high availability and cost optimization, a case study of a hybrid cluster that combines on-premise and public cloud.
image: ../assets/img/works/286a79d6-5433-4315-9309-61f6a6235f4c.jpg
---

# DevOps: Hybrid Clusters with On-Premise Bare-Metal K8s and AWS EKS

Photo from <a href="https://unsplash.com/ko/%EC%82%AC%EC%A7%84/%EB%82%AE%EC%97%90-%EB%B0%94%EC%9C%84-%ED%95%B4%EC%95%88%EC%97%90-%EC%84%9C%EC%9E%88%EB%8A%94-3-%EB%AA%85%EC%9D%98-%EB%82%A8%EC%9E%90-Opzk_hvwO9Q?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a> in <a href="https://unsplash.com/ko/@mike_kiev?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Photobank Kiev</a>
  

* UNORDERED TOC
{:toc}

## 1. Overview

My team and I built a hybrid Kubernetes cluster that combines on-premise and public cloud resources. This architecture helps us overcome the limitations of on-premise resources and optimize the cost of public cloud usage.

Our application consists of two parts: a web application and machine learning (ML) pipelines. The web application is hosted on the public cloud, while the ML workload runs on the on-premise GPU servers. The hybrid cluster architecture provides the following benefits:

- **Reliability**: Hosting the web applications and databases on the public cloud helps us achieve high availability and reliability 24/7.
- **Cost Optimization**: By using the on-premise GPU servers for ML workloads, we reduced the cost of public cloud resources by over 50%.
- **Scalability**: When the on-premise cluster runs out of resources, we can easily scale out to the public cloud. Even if the on-premise cluster is down, the public cloud extends backup nodes to ensure high availability for ML workloads.

The following diagram shows the architecture of the hybrid cluster:

![Architecture Diagram of the Hybrid Cluster](../assets/img/works/10393250-4f16-43e6-856b-c4fa7515fdce.png){:.lead width="800" height="400" loading="lazy"}

**Architecture Diagram of the Hybrid Cluster;** Users ask contents from the web application hosted on the public cloud, while the ML pipelines run on the on-premise cluster. The metric collector monitors the liveness and availability of the on-premise cluster and scales out the backup pipelines in the public cloud when needed.
{:.figcaption}

## 2. Problem Statement

Initially, we deployed a public AWS EKS cluster to support our web application and ML pipeline. However, running ML workloads on the public cloud proved to be cost-ineffective due to the high expense of GPU instances (*e.g.,* g4dn) on AWS EC2, resulting in unacceptable monthly costs amounting to thousands of dollars.

To mitigate these costs, we transitioned to on-premise clusters equipped with GPU servers for our ML pipelines. To facilitate communication between the public cloud and our on-premise clusters, we needed to expose endpoints on the on-premise cluster.

A metric collector in the public cloud was set up to monitor the liveness and availability of the on-premise cluster. In the event of the on-premise cluster going down or lagging, the metric collector would automatically scale out public cloud resources to maintain high availability of the ML pipelines.

## 3. Methods
To achieve the architecture described above, we implemented the following steps:

### 3.1. Public Cluster: AWS EKS
We deployed a public AWS EKS cluster to host our web application and database. The EKS cluster deployed the following components:

- **Web Application**: A web application that serves as the front-end and CMS for users.
- **Database**: PostgreSQL and MySQL databases that store user data and application logs.
- **Metric Collector**: A metric collector that monitors the liveness and pipeline availability of the on-premise and public clusters.
- **Backup ML Pipelines**: Backup pipelines that are automatically scaled out in the event the on-premise cluster is not available.

### 3.2. On-Premise Cluster: Bare-Metal Kubernetes
We deployed on-premise bare-metal Kubernetes clusters with GPU servers. The on-premise cluster deployed the following components:

- **ML Pipelines**: Machine learning pipelines that process data and train models. The pipelines run on GPU servers to accelerate the training process. We used Argo Workflows as a pipeline controller.
- **Metrics Server**: A metrics server that exposes the liveness and availability of the on-premise cluster to the public cloud.

### 3.3. Scheduling ML Pipelines
If the on-premise cluster is down or lagging, the metric collector in the public cloud will automatically scale out the backup ML pipelines to ensure high availability of the ML workloads. The metric collector will also scale in the backup pipelines when the on-premise cluster is back online.

## 4. Summary
This is a case study of a loosely-coupled hybrid cluster that combines on-premise and public cloud resources. The architecture provides high availability, cost optimization, and scalability for our application.

We reduced the cost of public cloud resources by over 50% by running ML workloads on on-premise GPU servers. The public cloud provides high availability and reliability for our web application and database.

The metric collector alerts us when the on-premise cluster is unavailable and automatically scales out the backup pipelines to ensure high availability of the ML workloads. This allows us to adjust the scale of the public cloud resources based on the availability of the on-premise cluster.

## 5. Future Works
Recently, we noticed that there are use cases utilizing AWS EKS Anywhere to combine on-premise and public nodes in a single EKS cluster. We are planning to proof the concept and migrate our on-premise cluster to EKS Anywhere to simplify the management of the hybrid cluster.