---
layout: post
categories: works
title: "Widearth: AR & Digital Twins Platforms at Maxst"
tags:
  - 
description: >
  A Fully Managed Platform for Real-World Space-Based AR & Digital Twin Services; I contributed to the development of the platform as a lead ML/Infra engineer.
image: /assets/img/works/00ef7950-3bb3-4865-82b0-e160b092412c.png
comments: true
---

* toc
{:toc .large-only}

## Summary
- **Title**: **Development of AR & Digital Twin Platform [Widearth]**
- **Website**: [*https://widearth.world*](https://widearth.world)
- **Period**: **Jan 2024 - Oct 2024 (10 months)**
- **Role**: **Lead ML/Infra ~ MLOps/DevOps + ML Backend + SRE [Contribution 75%]**
    - **DevOps & SRE**
        - IaC, GitOps, CI/CD Pipelines, Monitoring, Logging, Notifications, Multi-Deployment Scenarios, Emergency Calls
    - **Hybrid Clusters**
        - AWS EKS + Bare Metal Kubernetes, API Gateway Pattern, Dynamic Instance Management, GPU Cost Optimization
    - **ML Workloads**
        - ML APIs, ML Pipelines, Data lake, Dockerizing, Model CI/CD
- **Results: Successful service launch ~ Small Team, All Features Implemented, Improved Availability, Cost Savings**
    - **Service Launch**
        - 15 people total, 8 developers, 1 infrastructure manager participated in planning and development to contribute to the launch and operation of the platform
    - **High-Efficiency ML**
        - Real-time execution of ML pipelines in the on-premises infrastructure of the hybrid cluster. Produced more than 300 space maps in the production environment, and saved about 150M KRW (70%) compared to the previous service
    - **High-Availability Infrastructure**
        - Hybrid cluster and disaster response to implement a service with 96% annual availability and a downtime of 14 days
- **Skills**
    - AWS EKS
    - Kubespray
    - Python/FastAPI
    - Argo Workflows
    - Argo CD
    - Bitbucket Pipelines
    - Karpenter


# Details
We configured a hybrid architecture for the digital twin platform.

>  Please refer to the omitted/simplified parts due to internal security regulations.

![Widearth's operation flow and user behavior patterns](/assets/img/works/964ffa59-e690-4b3b-b52a-a16e69728246.png){:.lead width="800" loading="lazy"}
Widearth's operation flow and user behavior patterns
{:.figcaption}


Widearth is a **B2B2C** business that uses digital twin technology to create space maps for the following two users. It is a platform business that provides services to general consumers after passing through the main customers.

- Description of users
    - **User A (Digital twin content provider)**
        - **User A** can create a space map (2) by using the workspace (1) they own.
        - The created space map is stored in the cloud and **User A** can share it through the content studio (3). The shared target is **User B (digital twin content consumer)**.
        - **User A** can also modify the content (4), add content, and process personal information for privacy.
        - The candidate group of **User A** is **‘a subject that makes a profit by sharing space through communication’**, and examples are as follows:
            - Real Estate / Travel / Art Museum / Restaurant / Heavy Industry / Virtual Space / Disabled-Friendly Facilities
            - Their plans are ‘to meet the needs of customers when they are not on site’.
                - Before visiting the site / After visiting the site / When it is not possible to visit the site / When the site has changed
    - **User B (Digital twin content consumer)**
        - **User B** is the subject that consumes the space map service provided by **User A**.
        - The candidate group of **User B** is **‘a subject that makes a profit by consuming space through communication’**, and examples are as follows:
            - Potential Real Estate Consumer / Potential Traveler / Potential Art Museum Visitor / Potential Restaurant Customer / Potential Employee / Virtual Space User / Disabled Person And Helper/Protector
            - They are **customers** who can get information about the space and use the service from **User A** by paying for it.

<div style="margin-top: 5rem;">
  {% include components/dingbat.html %}
</div>

---

![Widearth's architecture corresponding to the public cloud area. The area where users interact](/assets/img/works/61a39148-4f5a-4424-862c-26a0adcda660.png){:.lead width="800" loading="lazy"}
Widearth's architecture corresponding to the public cloud area. The area where users interact
{:.figcaption}

- The area where users interact, mainly the public cloud area of the platform.
- It is configured with an MSA (microservice architecture or mini-service architecture) that separates FE/BE/pipeline. Since the databases of each service are not strictly divided, it is appropriate to call it a **‘mini-service architecture’**.
- It can operate in single/multi-cluster and all servers are designed to be horizontally scalable according to usage/usage environment.
- The pipeline is explained in detail in the hybrid architecture below.

<div style="margin-top: 5rem;">
  {% include components/dingbat.html %}
</div>

---

![Widearth's architecture corresponding to the hybrid cloud (pipeline). The area where users interact](/assets/img/works/7e09a770-db47-4ae1-8fce-346220ac39ff.png){:.lead width="800" loading="lazy"}
Widearth's architecture corresponding to the hybrid cloud (pipeline). The area where users interact
{:.figcaption}

- The area where the pipeline is operating, using both on-premises and public cloud.
- The pipeline is configured with the same specifications on both the on-premises and public cloud. To do this, a ‘file storage’ and an ‘object storage’ are configured in each cloud.
- The database for logging and metadata for the back office is configured only in the public cloud for availability and management.
- The pipeline is allocated to the available area of the on-premises data center first. If the on-premises does not respond or all areas are allocated, it is allocated to the public cloud second and the pipeline is activated.
    - If there is an outage/disaster in the on-premises data center,
    - If the request exceeds the available capacity of the on-premises data center.
- The public cloud is allocated to the cluster that services FE/BE with the minimum resource allocation for the pipeline. If the pipeline is allocated to the public cloud, the node is allocated and activated.

Through this hybrid architecture, we can operate a platform with high performance, high efficiency, and high availability.


[Widearth]: https://widearth.world
