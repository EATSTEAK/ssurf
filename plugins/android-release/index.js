const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * GitHub Actions에서 제공하는 환경변수를 사용하여
 * Android release signing 설정을 추가하는 Expo config plugin
 *
 * 환경변수:
 * - KEYSTORE_PASSWORD: Keystore 파일 비밀번호
 * - KEY_ALIAS: Key alias
 * - KEY_PASSWORD: Key 비밀번호
 */
const withAndroidReleaseSigning = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = addReleaseSigning(config.modResults.contents);
    }
    return config;
  });
};

function addReleaseSigning(buildGradle) {
  // 이미 환경변수 기반 signingConfigs.release가 있는지 확인
  if (buildGradle.includes('System.getenv("KEYSTORE_PASSWORD")')) {
    // 이미 있으면 buildTypes.release의 signingConfig만 확인/수정
    buildGradle = fixBuildTypesReleaseSigning(buildGradle);
    return buildGradle;
  }

  // 기존 하드코딩된 signingConfigs.release를 환경변수 기반으로 교체
  const hardcodedReleaseConfigRegex =
    /release\s*\{[^}]*storeFile\s+file\s*\(['"]release\.keystore['"]\)[^}]*\}/s;

  const envBasedReleaseConfig = `release {
            storeFile file('release.keystore')
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }`;

  // signingConfigs 블록 내의 release 설정을 교체
  if (hardcodedReleaseConfigRegex.test(buildGradle)) {
    buildGradle = buildGradle.replace(hardcodedReleaseConfigRegex, envBasedReleaseConfig);
  } else {
    // signingConfigs 블록에 release가 없는 경우 추가
    const signingConfigsRegex = /(signingConfigs\s*\{)/;
    if (signingConfigsRegex.test(buildGradle)) {
      buildGradle = buildGradle.replace(
        signingConfigsRegex,
        `$1\n        ${envBasedReleaseConfig}`,
      );
    }
  }

  // buildTypes.release의 signingConfig 수정
  buildGradle = fixBuildTypesReleaseSigning(buildGradle);

  return buildGradle;
}

function fixBuildTypesReleaseSigning(buildGradle) {
  // buildTypes 블록을 찾아서 라인별로 처리
  const lines = buildGradle.split('\n');
  const result = [];
  let inBuildTypes = false;
  let inRelease = false;
  let braceCount = 0;
  let buildTypesStartBraceCount = 0;
  let releaseHasSigningConfig = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // buildTypes 블록 진입 감지
    if (!inBuildTypes && trimmedLine.startsWith('buildTypes')) {
      inBuildTypes = true;
      buildTypesStartBraceCount = braceCount;
    }

    // 중괄호 카운팅
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    braceCount += openBraces - closeBraces;

    // buildTypes 내에서 release 블록 감지
    if (inBuildTypes && !inRelease && trimmedLine.startsWith('release')) {
      inRelease = true;
      releaseHasSigningConfig = false;
    }

    // release 블록 내에서 signingConfig 처리
    if (inRelease && trimmedLine.includes('signingConfig')) {
      releaseHasSigningConfig = true;
      if (trimmedLine.includes('signingConfigs.debug')) {
        // debug를 release로 교체
        result.push(line.replace('signingConfigs.debug', 'signingConfigs.release'));
        continue;
      }
    }

    result.push(line);

    // release 블록 종료 감지
    if (inRelease && closeBraces > 0) {
      // release 블록이 닫혔는지 확인 (간단한 휴리스틱)
      if (trimmedLine === '}' || (trimmedLine.endsWith('}') && !trimmedLine.includes('{'))) {
        inRelease = false;
      }
    }

    // buildTypes 블록 종료 감지
    if (inBuildTypes && braceCount <= buildTypesStartBraceCount && closeBraces > 0) {
      inBuildTypes = false;
    }
  }

  return result.join('\n');
}

module.exports = withAndroidReleaseSigning;
