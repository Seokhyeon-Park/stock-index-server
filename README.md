# 지수/환율 조회 API (stock-index-server)

## 목적

> 1. Node, React, AWS 등 다양한 개발 경험을 위해 (사실 심심해서...) 작은 사이드 프로젝트를 계획함
> 2. 실용성을 위해 내가 평소에 사용하던 기능을 직접 만들어 사용하고자 함
> 3. 사이드 프로젝트 구현에 앞서 데이터를 수집/가공, 제공하는 부분이 필요하여 해당 프로젝트를 계획함
> 4. (API를 만들어 보고 싶었음)

## 사용기술
+ NodeJS(Javascript)
+ AWS(https://seokbong.tistory.com/125)
  + ubuntu(on raspberry pi) : AWS의 과금요소가 무서워 AWS 테스트 후 집에 남는 라즈베리파이로 서버를 만들어 둠

## 사용방법
+ API URL (2023.01.12 기준, 나쁜짓하면 혼남...)
```
http://183.102.138.178:3000/(options)
```

+ API List 조회 (2023.01.13 저녁 반영 예정)
```
http://183.102.138.178:3000/api
```

+ Options
```
API URL...:3000/(*required 조회대상)/(*option 조회기간)
```

> 조회대상 (2023.01.12 기준) : DJX, SP, NASDAQ, KOSPI, USD, JPY, GBP, EUR

> (API URL...:3000/api를 통해 최신 리스트 조회 가능)

> 조회기간 : YYYYMMDD-YYYYMMDD

## 사용예시 (URL)
```
http://183.102.138.178:3000/usd/20230101-20230111
```

## 주의사항
1. 주소는 언제든 바뀔 수 있음
2. 서버는 언제든 닫힐 수 있음
3. 서비스를 위함이 아닌 개인 사이드 프로젝트로 해당 API를 사용함에 있어 발생하는 어떠한 문제에 대하여 책임지지 않음

## 문의
+ dfbgq346q@gmail.com
+ webber2006@naver.com
