---
layout:     post
categories: [ "certifications" ]
tags:       [ "kubernetes", "linux-foundation" ]
description: >
  Kubernetes 및 클라우드 네이티브 생태계에 대한 기초 지식.<br/>
  <b>유효기간: 2025년 10월 22일 – 2027년 10월 22일</b>
image: /assets/img/certtifications/CNCF-Certification_-KCNA.png
accent_image: 
  background: url('/assets/img/common/penguins-linux-foundation.jpg') center/cover
  overlay: false
comments: true
---

# KCNA: Kubernetes and Cloud Native Associate (2025)

* UNORDERED TOC
{:toc .large-only}

## 1. 자격증 소개

Kubernetes and Cloud Native Associate (KCNA)는 Kubernetes와 클라우드 네이티브 생태계에 대한 기초 지식을 평가하는 자격증입니다. CNCF(Cloud Native Computing Foundation)와 The Linux Foundation이 함께 만들었고, 클라우드 네이티브 기술의 기본기를 다지고 싶은 분들에게 적합합니다.

시험은 온라인 감독 방식으로 진행되며, 90분 동안 60개의 4지선다형 문제를 풉니다. 핸즈온 없이 순수하게 이론 문제로만 구성되어 있어요. 합격 커트라인은 75%이고, 자격증 유효기간은 2년입니다. 시험 범위는 다음과 같습니다:

- **Kubernetes 기초**: 46% - 핵심 개념, 아키텍처, 기본 운영
- **컨테이너 오케스트레이션**: 22% - 컨테이너 개념, 오케스트레이션 원칙, 컨테이너 런타임
- **클라우드 네이티브 아키텍처**: 16% - 클라우드 네이티브 원칙, 패턴, 설계
- **클라우드 네이티브 옵저버빌리티**: 8% - 모니터링, 로깅, 옵저버빌리티 도구
- **클라우드 네이티브 애플리케이션 딜리버리**: 8% - CI/CD, GitOps, 배포 전략

CKA나 CKAD처럼 실제로 클러스터를 만지는 시험이 아니라, 개념과 이론 위주로 출제됩니다. 그래서 클라우드 네이티브 세계에 첫 발을 딛는 분들에게 좋은 출발점이 될 수 있습니다.

## 2. 시험 후기

![KCNA 자격증](/assets/img/certtifications/8984032a-6f68-4aa6-bd7d-2c786141fc80.png){:.lead width="500" height="100" loading="lazy"}

KCNA 자격증 2025. 2025년 10월 22일 발급. 2028년 10월 22일 만료. 자격증 확인은 [여기](https://www.credly.com/badges/759e92f0-7b3b-4788-8eff-c20ad1e2c645)에서 할 수 있습니다.
{:.figcaption}

2025년 10월 22일에 KCNA 시험을 보고 합격했습니다. 이미 CKA와 CKAD를 취득한 상태였는데, KCNA는 그동안 실무에서 익힌 지식을 이론적으로 정리해볼 수 있는 좋은 기회였습니다.

시험 형식은 생각보다 단순합니다:
- 60문제 전부 4지선다형 객관식 (터미널 작업 없음)
- 실제 구현보다는 개념과 원칙 위주
- Kubernetes뿐 아니라 클라우드 네이티브 전반을 다룸

문제는 CNCF 프로젝트, 클라우드 네이티브 아키텍처, 옵저버빌리티 도구, 애플리케이션 딜리버리 등 꽤 넓은 범위에서 출제됩니다. Kubernetes를 실무에서 다뤄본 경험이 분명 도움이 됐지만, 그것만으로는 부족하고 생태계 전반에 대한 이해가 필요했습니다.

저는 KodeKloud의 [Kubernetes and Cloud-Native Associate (KCNA)](https://learn.kodekloud.com/user/courses/kubernetes-and-cloud-native-associate-kcna) 강좌로 준비했습니다. 강사는 Mumshad Mannambeth인데, CKA/CKAD 강의로도 유명한 분이죠. Basic 플랜만 구매해도 충분히 수강할 수 있습니다 (Pro는 굳이 필요 없어요). 총 9시간 분량으로 클라우드 네이티브 아키텍처, 컨테이너 오케스트레이션, Kubernetes 기초, 애플리케이션 딜리버리, 옵저버빌리티까지 시험 범위 전체를 커버합니다. KodeKloud가 핸즈온 랩 환경을 제공하긴 하는데, 정작 KCNA 시험에는 핸즈온이 없으니 참고하세요. 강좌에 포함된 퀴즈와 모의 시험이 실제 시험 형식에 익숙해지는 데 꽤 도움이 됐습니다. Kubernetes를 어느 정도 아는 상태라면 일주일 정도면 강좌를 다 들을 수 있을 거예요.

## 3. 시험 준비 팁

직접 시험을 치르면서 느낀 점들을 정리해봤습니다.

**꼭 챙겨야 할 리소스:**
- **공식 CNCF 커리큘럼**: 시험 영역별 비중이 명확하게 나와 있으니 반드시 확인하세요
- **CNCF 랜드스케이프**: [CNCF Landscape](https://landscape.cncf.io/)는 한 번쯤 훑어보는 게 좋습니다. 프로젝트가 Graduated인지, Incubating인지, Sandbox인지 구분할 줄 알아야 하고, 각 프로젝트가 어떤 문제를 해결하는지 파악해두세요
- **최근 CNCF 추가 프로젝트**: 시험 2-3개월 전에 새로 합류한 프로젝트가 출제되는 경우가 있습니다. 최신 동향을 놓치지 마세요

**학습 전략:**
- CKA/CKAD가 있다면 KodeKloud 강좌는 일주일이면 충분합니다
- "어떻게 하는가"보다 "왜 이렇게 하는가", "이게 뭔가"에 집중하세요. KCNA는 개념 이해를 묻는 시험입니다
- 모의 시험을 꼭 풀어보세요. 실제 시험에는 핸즈온이 없고 객관식뿐이라 형식에 익숙해지는 게 중요합니다
- CNCF 프로젝트 공식 문서를 읽어보면서 각 프로젝트가 생태계에서 어떤 역할을 하는지 감을 잡아두세요

**중요한 팁:**
KCNA는 Kubernetes 시험이 아니라 클라우드 네이티브 전체를 다루는 시험입니다. Kubernetes만 공부하면 안 되고, 옵저버빌리티 도구, CI/CD, GitOps, 클라우드 네이티브 아키텍처 패턴까지 시간을 투자해야 합니다. 시험치기 전에 CNCF 블로그도 읽어보시는 것을 추천합니다. 2주 전의 따끈따끈한 소식도 시험에 나올 수 있습니다.

## 4. 요약

KCNA는 클라우드 네이티브 생태계의 큰 그림을 잡기에 좋은 자격증입니다. 저처럼 CKA/CKAD를 먼저 딴 경우에는 흩어져 있던 이론 지식을 정리하는 계기가 되고, 처음 시작하는 분들에게는 체계적인 학습 로드맵이 되어줍니다.

KCNA의 특징을 정리하면:
- **입문 수준**: 클라우드 네이티브를 처음 접해도 도전할 수 있음
- **넓은 범위**: Kubernetes만이 아니라 클라우드 네이티브 생태계 전체를 다룸
- **이론 중심**: 개념과 원칙에 대한 이해를 평가
- **보완적 성격**: CKA, CKAD 같은 핸즈온 자격증과 함께 갖추면 시너지가 남

클라우드 네이티브 분야에서 기본기를 다지고 싶거나, 이미 알고 있는 내용을 체계적으로 정리하고 싶다면 KCNA를 고려해보세요.

이 자격증은 [LinkedIn 게시물](https://www.linkedin.com/posts/jyje_the-linux-foundation-%EC%9E%90%EA%B2%A9%EC%88%98%EB%A3%8C%EC%A6%9Dkcna-kubernetes-activity-7388695644942684160-Nw_Y)에서 공유했습니다.
