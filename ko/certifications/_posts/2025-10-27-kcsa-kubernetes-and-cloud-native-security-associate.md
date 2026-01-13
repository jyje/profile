---
layout:     post
categories: [ "certifications" ]
tags:       [ "kubernetes", "linux-foundation", "security" ]
description: >
  Kubernetes 및 클라우드 네이티브 생태계 보안을 위한 기초 지식.<br/>
  <b>유효기간: 2025년 10월 27일 – 2027년 10월 27일</b>
image: /assets/img/certtifications/CNCF-Certification_-KCSA.png
accent_image: 
  background: url('/assets/img/common/penguins-linux-foundation.jpg') center/cover
  overlay: false
comments: true
---

# KCSA: Kubernetes and Cloud Native Security Associate (2025)

* UNORDERED TOC
{:toc .large-only}

## 1. 자격증 소개

Kubernetes and Cloud Native Security Associate (KCSA)는 Kubernetes와 클라우드 네이티브 생태계의 보안에 대한 기초 지식을 평가하는 자격증입니다. CNCF(Cloud Native Computing Foundation)와 The Linux Foundation이 함께 만들었고, 클라우드 네이티브 보안의 기본기를 다지고 싶은 분들에게 적합합니다.

시험은 온라인 감독 방식으로 진행되며, 90분 동안 60개의 4지선다형 문제를 풉니다. 핸즈온 없이 순수하게 이론 문제로만 구성되어 있어요. 합격 커트라인은 75%이고, 자격증 유효기간은 2년입니다. 시험 범위는 다음과 같습니다:

- **Kubernetes 보안 기초**: 핵심 보안 개념, Pod 보안, 네트워크 정책, RBAC
- **컨테이너 보안**: 컨테이너 이미지 보안, 스캐닝, 런타임 보안
- **클라우드 네이티브 보안 도구**: CNCF 생태계의 보안 도구 및 실무
- **보안 모범 사례**: 보안 구성, 시크릿 관리, 컴플라이언스
- **위협 탐지 및 대응**: 클라우드 네이티브 환경의 모니터링, 로깅, 인시던트 대응

CKS(Certified Kubernetes Security Specialist)처럼 실제로 클러스터 보안을 구성하는 시험이 아니라, 개념과 이론 위주로 출제됩니다. 그래서 클라우드 네이티브 보안을 처음 시작하는 분들에게 좋은 출발점이 될 수 있습니다.

## 2. 시험 후기

![KCSA 자격증](/assets/img/certtifications/8f52ead9-2648-4bac-a881-ef8e8bf866dd.png){:.lead width="500" height="100" loading="lazy"}

KCSA 자격증 2025. 2025년 10월 27일 발급. 2027년 10월 27일 만료. 자격증 확인은 [여기](https://www.credly.com/badges/1206ad1c-e348-4328-934d-72e44ca434be)에서 할 수 있습니다.
{:.figcaption}

2025년 10월 27일에 KCSA 시험을 보고 합격했습니다. 이미 CKA와 CKAD를 취득한 상태였는데, KCSA는 그동안 실무에서 접했던 보안 관련 지식을 이론적으로 정리해볼 수 있는 좋은 기회였습니다.

시험 형식은 생각보다 단순합니다:
- 60문제 전부 4지선다형 객관식 (터미널 작업 없음)
- 실제 구현보다는 보안 개념, 원칙, 모범 사례 위주
- Kubernetes뿐 아니라 클라우드 네이티브 보안 전반을 다룸

문제는 Kubernetes 보안 정책, 컨테이너 보안, 시크릿 관리, 네트워크 보안, 컴플라이언스, CNCF 보안 도구 등 꽤 넓은 범위에서 출제됩니다. Kubernetes를 실무에서 다뤄본 경험이 분명 도움이 됐지만, 그것만으로는 부족하고 보안 원칙이 클라우드 네이티브 환경에서 어떻게 적용되는지 전반적으로 이해하고 있어야 합니다.

저는 KodeKloud의 [Kubernetes and Cloud Native Security Associate (KCSA)](https://learn.kodekloud.com/user/courses/kubernetes-and-cloud-native-security-associate-kcsa) 강좌로 준비했습니다. 강사는 Mumshad Mannambeth와 Nimesha Jinarajadasa입니다. Basic 플랜만 구매해도 충분히 수강할 수 있어요 (Pro는 굳이 필요 없습니다). 총 6.78시간 분량으로 클라우드 네이티브 보안 개요, Kubernetes 클러스터 구성 요소 보안, 보안 기초, 위협 모델, 플랫폼 보안, 컴플라이언스 프레임워크까지 시험 범위 전체를 커버합니다. 핸즈온 랩과 인터랙티브 콘텐츠가 잘 되어 있고, 보안 트렌드에 맞춰 콘텐츠도 자주 업데이트됩니다. 다만 KodeKloud가 핸즈온 랩을 제공하긴 하는데, 정작 KCSA 시험에는 핸즈온이 없으니 참고하세요. 강좌에 포함된 퀴즈와 모의 시험이 실제 시험 형식에 익숙해지는 데 꽤 도움이 됐습니다.

## 3. 시험 준비 팁

직접 시험을 치르면서 느낀 점들을 정리해봤습니다.

**꼭 챙겨야 할 리소스:**
- **공식 CNCF 커리큘럼**: 시험 영역별 비중이 명확하게 나와 있으니 반드시 확인하세요
- **CNCF 보안 랜드스케이프**: [CNCF Landscape](https://landscape.cncf.io/)에서 보안 관련 프로젝트를 훑어보세요. 각 보안 도구가 무슨 역할을 하는지, Graduated/Incubating/Sandbox 중 어디에 속하는지 파악해두면 좋습니다
- **CNCF 블로그**: [CNCF 블로그](https://www.cncf.io/blog/)는 정기적으로 확인하는 게 좋아요. 최신 보안 업데이트나 새로운 프로젝트 발표가 시험에 출제되기도 합니다
- **최근 CNCF 보안 프로젝트**: 시험 2-3개월 전에 새로 합류한 보안 프로젝트가 출제되는 경우가 있습니다. 최신 동향을 놓치지 마세요
- **Kubernetes 보안 문서**: 공식 문서에서 Pod 보안, 네트워크 정책, RBAC, 시크릿 관리 부분은 꼭 읽어보세요

**학습 전략:**
- CKS가 있거나 보안 관련 실무 경험이 있다면 준비 시간을 단축할 수 있습니다
- "어떻게 구성하는가"보다 "왜 이렇게 하는가", "이게 뭔가"에 집중하세요. KCSA는 보안 개념 이해를 묻는 시험입니다
- 모의 시험을 꼭 풀어보세요. 실제 시험에는 핸즈온이 없고 객관식뿐이라 형식에 익숙해지는 게 중요합니다
- 클라우드 네이티브 환경에서 흔히 발생하는 보안 취약점과 모범 사례를 정리해두세요
- CNCF 보안 프로젝트들이 생태계에서 각각 어떤 역할을 하는지 감을 잡아두세요

**중요한 팁:**
KCSA는 Kubernetes 보안 시험이 아니라 클라우드 네이티브 보안 전체를 다루는 시험입니다. Kubernetes만 공부하면 안 되고, 컨테이너 보안, 시크릿 관리, 컴플라이언스, 위협 탐지, 보안 도구까지 시간을 투자해야 합니다. 시험 전에 CNCF 블로그도 꼭 읽어보세요. 2주 전의 따끈따끈한 소식도 시험에 나올 수 있습니다.


## 4. 요약

KCSA는 클라우드 네이티브 보안의 큰 그림을 잡기에 좋은 자격증입니다. 저처럼 CKA/CKAD/CKS를 먼저 딴 경우에는 흩어져 있던 보안 지식을 정리하는 계기가 되고, 처음 시작하는 분들에게는 체계적인 보안 학습 로드맵이 되어줍니다.

KCSA의 특징을 정리하면:
- **입문 수준**: 클라우드 네이티브 보안을 처음 접해도 도전할 수 있음
- **넓은 범위**: Kubernetes만이 아니라 클라우드 네이티브 보안 생태계 전체를 다룸
- **이론 중심**: 보안 개념과 원칙에 대한 이해를 평가
- **보완적 성격**: CKS 같은 핸즈온 자격증이나 실무 보안 경험과 함께 갖추면 시너지가 남

클라우드 네이티브 보안 분야에서 기본기를 다지고 싶거나, 이미 알고 있는 보안 지식을 체계적으로 정리하고 싶다면 KCSA를 고려해보세요.
