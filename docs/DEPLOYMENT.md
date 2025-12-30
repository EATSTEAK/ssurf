# 배포 가이드

이 문서는 ssurf 앱의 CI/CD 설정 및 배포 방법을 설명합니다.

## 목차

- [개요](#개요)
- [버전 관리](#버전-관리)
- [태그 기반 배포](#태그-기반-배포)
- [GitHub Secrets 설정](#github-secrets-설정)
- [iOS 배포 설정](#ios-배포-설정)
- [Android 배포 설정](#android-배포-설정)
- [로컬에서 Fastlane 테스트](#로컬에서-fastlane-테스트)
- [Fastlane Lanes](#fastlane-lanes)

## 개요

ssurf는 **태그 기반 자동 배포**를 사용합니다. 태그를 푸시하면 GitHub Actions와 Fastlane이 자동으로 앱을 빌드하고 각 플랫폼의 스토어에 배포합니다.

### 배포 플랫폼

- **iOS**: TestFlight (Beta) 및 App Store (Production)
- **Android**: Google Play Internal Testing, Beta, Production

### 기술 스택

- **CI/CD**: GitHub Actions
- **빌드 도구**: Fastlane + Expo Prebuild
- **네이티브 프로젝트**: `expo prebuild`로 자동 생성 (Git에서 제외)

## 버전 관리

앱 버전과 빌드 번호는 [`app.json`](../app.json)에서 중앙 관리됩니다.

### app.json 구조

```json
{
  "expo": {
    "version": "1.0.0", // 사용자에게 표시되는 버전 (SemVer)
    "ios": {
      "buildNumber": "1" // iOS 빌드 번호 (문자열)
    },
    "android": {
      "versionCode": 1 // Android 버전 코드 (정수)
    }
  }
}
```

### 버전 업데이트 절차

새 배포를 위해 다음 단계를 수행합니다:

1. **버전 번호 업데이트**

   ```json
   "version": "1.0.1"  // 1.0.0 → 1.0.1
   ```

2. **iOS 빌드 번호 증가**

   ```json
   "buildNumber": "2"  // "1" → "2"
   ```

3. **Android 버전 코드 증가**
   ```json
   "versionCode": 2    // 1 → 2
   ```

**중요:** Fastlane은 빌드 번호를 자동으로 증가시키지 않으므로, 수동으로 관리해야 합니다.

## 태그 기반 배포

### 태그 규칙

**시멘틱 버전 태그 (`v*.*.*`)**

- 형식: `v1.0.0`, `v2.1.3`, `v1.0.0-beta.1` 등
- 용도: Production 릴리즈
- 배포 대상:
  - iOS → App Store
  - Android → Google Play Production

**빌드 번호 태그 (`b*`)**

- 형식: `b2025122701`, `b2025122702` 등 (연도+월+일+일련번호)
- 용도: 내부 테스팅
- 배포 대상:
  - iOS → TestFlight (Beta)
  - Android → Internal Testing

### 배포 워크플로우

#### 1. 버전 업데이트

[`app.json`](../app.json)을 편집하여 버전 정보를 업데이트합니다.

```json
{
  "expo": {
    "version": "1.0.1",
    "ios": { "buildNumber": "2" },
    "android": { "versionCode": 2 }
  }
}
```

#### 2. 변경 사항 커밋

```bash
git add app.json
git commit -m "chore: bump version to 1.0.1"
```

#### 3. 태그 생성 및 푸시

**프로덕션 릴리즈:**

```bash
git tag v1.0.1
git push origin v1.0.1
```

**내부 테스팅:**

```bash
git tag b2025122701
git push origin b2025122701
```

#### 4. 자동 빌드 및 배포

- GitHub Actions 탭에서 워크플로우 진행 상황 확인
- 빌드 완료 후 각 스토어에서 앱 확인

### 수동 배포 (Workflow Dispatch)

태그 없이 수동으로 배포할 수도 있습니다:

1. GitHub 리포지토리의 **Actions** 탭으로 이동
2. 원하는 워크플로우 선택 (iOS Deployment 또는 Android Deployment)
3. **Run workflow** 클릭
4. 배포 레인 선택:
   - iOS: `beta` 또는 `release`
   - Android: `internal`, `beta` 또는 `release`
5. **Run workflow** 실행

## GitHub Secrets 설정

배포를 위해 다음 secrets를 GitHub 리포지토리 Settings → Secrets and variables → Actions에 설정해야 합니다.

### iOS Secrets

| Secret 이름                     | 설명                                           |
| ------------------------------- | ---------------------------------------------- |
| `APP_STORE_CONNECT_KEY_ID`      | App Store Connect API Key ID                   |
| `APP_STORE_CONNECT_ISSUER_ID`   | App Store Connect API Issuer ID                |
| `APP_STORE_CONNECT_KEY_CONTENT` | App Store Connect API Key 내용 (Base64 인코딩) |
| `APPLE_ID`                      | Apple 개발자 계정 이메일                       |
| `MATCH_GIT_URL`                 | Fastlane Match용 인증서/프로파일 저장소 URL    |
| `MATCH_GIT_BASIC_AUTHORIZATION` | Match 저장소 접근용 Basic Auth 토큰 (Base64)   |
| `MATCH_PASSWORD`                | Match 암호화 비밀번호                          |

### Android Secrets

| Secret 이름                        | 설명                                            |
| ---------------------------------- | ----------------------------------------------- |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Google Play Service Account JSON 키 (전체 내용) |
| `ANDROID_KEYSTORE_BASE64`          | Android Keystore 파일 (Base64 인코딩)           |
| `ANDROID_KEYSTORE_PASSWORD`        | Keystore 비밀번호                               |
| `ANDROID_KEY_ALIAS`                | Key Alias                                       |
| `ANDROID_KEY_PASSWORD`             | Key 비밀번호                                    |

## iOS 배포 설정

### 1. App Store Connect API Key 생성

1. [App Store Connect](https://appstoreconnect.apple.com/) 접속
2. **Users and Access** → **Keys** 탭으로 이동
3. **+** 버튼을 클릭하여 새 키 생성
4. Key ID와 Issuer ID를 저장
5. `.p8` 파일 다운로드

### 2. API Key Base64 인코딩

```bash
base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
```

이 명령어는 Base64로 인코딩된 키를 클립보드에 복사합니다.

### 3. Fastlane Match 설정

Fastlane Match는 인증서와 프로비저닝 프로파일을 암호화하여 Git 저장소에 저장합니다.

#### Match 저장소 생성

1. GitHub에 private 저장소 생성 (예: `yourorg/certificates`)
2. Personal Access Token 생성 (repo 권한 필요)

#### Match 초기화

```bash
cd fastlane
bundle install
bundle exec fastlane match init
```

프롬프트에서 `git`을 선택하고 저장소 URL을 입력합니다.

#### 인증서 생성

```bash
bundle exec fastlane match appstore
```

비밀번호를 입력하면 인증서와 프로파일이 생성되어 저장소에 푸시됩니다.

### 4. GitHub Secrets 설정

생성한 정보를 GitHub Secrets에 추가합니다:

```bash
# Match 저장소 Basic Auth 토큰 생성
echo -n "username:github_pat_xxx" | base64
```

- `APP_STORE_CONNECT_KEY_ID`: App Store Connect에서 확인한 Key ID
- `APP_STORE_CONNECT_ISSUER_ID`: App Store Connect에서 확인한 Issuer ID
- `APP_STORE_CONNECT_KEY_CONTENT`: Base64 인코딩된 `.p8` 파일 내용
- `APPLE_ID`: Apple 개발자 계정 이메일
- `MATCH_GIT_URL`: Match 저장소 URL (예: `https://github.com/yourorg/certificates`)
- `MATCH_GIT_BASIC_AUTHORIZATION`: Base64 인코딩된 `username:token`
- `MATCH_PASSWORD`: Match 초기화 시 설정한 비밀번호

## Android 배포 설정

### 1. Keystore 생성

앱 서명용 Keystore가 없다면 생성합니다:

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore release.keystore \
  -alias ssurf-release \
  -keyalg RSA -keysize 2048 -validity 10000
```

프롬프트에서 비밀번호와 정보를 입력합니다.

### 2. Keystore Base64 인코딩

```bash
base64 -i release.keystore | pbcopy
```

### 3. Google Play Service Account 생성

#### Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. **IAM & Admin** → **Service Accounts**로 이동
4. **Create Service Account** 클릭
5. 서비스 계정 이름 입력 (예: `ssurf-deployment`)
6. **Create and Continue** 클릭
7. Role 선택 생략하고 **Done** 클릭
8. 생성된 서비스 계정 클릭
9. **Keys** 탭 → **Add Key** → **Create new key**
10. JSON 형식 선택 → **Create**
11. JSON 파일 다운로드

#### Google Play Console 연결

1. [Google Play Console](https://play.google.com/console) 접속
2. **Settings** → **API access**로 이동
3. **Link to a Google Cloud project** 클릭
4. 이전에 생성한 프로젝트 선택
5. Service accounts 섹션에서 생성한 서비스 계정 찾기
6. **Grant access** 클릭
7. 권한 설정:
   - **Releases**: View, Create, Edit
   - **Testing**: Manage testing tracks
8. **Invite user** 클릭

### 4. GitHub Secrets 설정

- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`: 다운로드한 JSON 파일의 **전체 내용** (파일 경로 아님)
- `ANDROID_KEYSTORE_BASE64`: Base64 인코딩된 Keystore
- `ANDROID_KEYSTORE_PASSWORD`: Keystore 생성 시 입력한 비밀번호
- `ANDROID_KEY_ALIAS`: Keystore alias (예: `ssurf-release`)
- `ANDROID_KEY_PASSWORD`: Key 비밀번호 (Keystore 비밀번호와 동일할 수 있음)

## 로컬에서 Fastlane 테스트

### 사전 준비

```bash
# Fastlane 의존성 설치
cd fastlane
bundle install
cd ..

# 네이티브 프로젝트 생성
npx expo prebuild
```

### iOS 테스트

```bash
# 환경 변수 설정
export APP_STORE_CONNECT_KEY_ID="your_key_id"
export APP_STORE_CONNECT_ISSUER_ID="your_issuer_id"
export APP_STORE_CONNECT_KEY_CONTENT="your_base64_key"
export APPLE_ID="your@email.com"
export MATCH_GIT_URL="https://github.com/yourorg/certificates"
export MATCH_PASSWORD="your_match_password"

# TestFlight 배포
bundle exec fastlane ios beta

# App Store 배포
bundle exec fastlane ios release
```

### Android 테스트

```bash
# 환경 변수 설정
export GOOGLE_PLAY_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
export KEYSTORE_PASSWORD="your_keystore_password"
export KEY_ALIAS="ssurf-release"
export KEY_PASSWORD="your_key_password"

# Internal Testing 배포
bundle exec fastlane android internal

# Beta 배포
bundle exec fastlane android beta

# Production 배포
bundle exec fastlane android release
```

## Fastlane Lanes

### iOS Lanes

| Lane          | 설명                             | 배포 대상                       |
| ------------- | -------------------------------- | ------------------------------- |
| `ios beta`    | TestFlight에 베타 빌드 업로드    | TestFlight (Internal Testing)   |
| `ios release` | App Store에 프로덕션 빌드 업로드 | App Store (수동 심사 제출 필요) |

### Android Lanes

| Lane               | 설명                           | 배포 대상                    |
| ------------------ | ------------------------------ | ---------------------------- |
| `android internal` | Internal Testing 트랙에 업로드 | Google Play Internal Testing |
| `android beta`     | Beta 트랙에 업로드             | Google Play Beta             |
| `android release`  | Production 트랙에 업로드       | Google Play Production       |

## 트러블슈팅

### iOS

**문제: Match에서 인증서를 찾을 수 없음**

```
Could not find certificate
```

**해결:**

```bash
# 인증서 재생성
bundle exec fastlane match nuke distribution
bundle exec fastlane match appstore
```

**문제: Xcode 빌드 실패**

```
xcodebuild: error: Unable to find a destination
```

**해결:**

- Xcode 버전 확인 (최신 버전 권장)
- `npx expo prebuild -p ios --clean` 재실행

### Android

**문제: Keystore 경로 오류**

```
Keystore file 'android/app/release.keystore' not found
```

**해결:**

- GitHub Actions에서 Keystore 디코딩 단계 확인
- 로컬에서는 `android/app/release.keystore` 위치에 파일 배치

**문제: Google Play API 권한 오류**

```
The caller does not have permission
```

**해결:**

- Google Play Console에서 서비스 계정 권한 재확인
- JSON 키 파일 재다운로드 및 Secret 업데이트

## 참고 자료

- [Fastlane 공식 문서](https://docs.fastlane.tools/)
- [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [App Store Connect API](https://developer.apple.com/documentation/appstoreconnectapi)
- [Google Play Developer API](https://developers.google.com/android-publisher)
