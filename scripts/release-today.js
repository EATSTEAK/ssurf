#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const process = require('node:process');

const args = process.argv.slice(2).filter((arg) => arg !== '--');
const knownFlags = new Set(['--dry-run', '--no-push', '--allow-dirty', '--help', '-h']);
const unknownFlags = args.filter((arg) => !knownFlags.has(arg));

if (unknownFlags.length > 0) {
  console.error(`알 수 없는 옵션: ${unknownFlags.join(', ')}`);
  printHelp();
  process.exit(1);
}

if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const isDryRun = args.includes('--dry-run');
const allowDirty = args.includes('--allow-dirty');
const shouldPush = !args.includes('--no-push') && !isDryRun;

try {
  const repoRoot = git(['rev-parse', '--show-toplevel']);
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  const appConfigPath = join(repoRoot, 'app.config.ts');

  if (branch !== 'main') {
    throw new Error(`release:today는 main 브랜치에서만 실행할 수 있습니다. 현재 브랜치: ${branch}`);
  }

  const worktreeStatus = runGit(['status', '--porcelain']);
  const worktreeLines = worktreeStatus
    ? worktreeStatus
        .split('\n')
        .map((line) => line.trimEnd())
        .filter(Boolean)
    : [];

  if (worktreeLines.length > 0 && !isDryRun && !allowDirty) {
    throw new Error([
      '작업 트리가 깨끗하지 않습니다. 변경 사항을 먼저 정리하거나 --allow-dirty를 사용해 주세요.',
      ...worktreeLines,
    ].join('\n'));
  }

  if (worktreeLines.length > 0 && (isDryRun || allowDirty)) {
    console.warn(
      isDryRun
        ? 'dry-run에서는 dirty worktree 검사를 통과시켜 계산만 진행합니다.'
        : '--allow-dirty로 dirty worktree 검사를 우회합니다.',
    );
    console.warn(worktreeLines.join('\n'));
  }

  if (allowDirty) {
    const stagedChanges = worktreeLines.filter((line) => line[0] !== ' ' && line[0] !== '?');
    if (stagedChanges.length > 0) {
      throw new Error([
        '--allow-dirty를 사용하더라도 staged 변경은 허용하지 않습니다.',
        ...stagedChanges,
      ].join('\n'));
    }

    const appConfigDirty = worktreeLines.find((line) => line.slice(3) === 'app.config.ts');
    if (appConfigDirty) {
      throw new Error('--allow-dirty를 사용하더라도 app.config.ts에 기존 변경이 있으면 실행할 수 없습니다.');
    }
  }

  const appConfig = readFileSync(appConfigPath, 'utf8');
  const versionCodeMatch = appConfig.match(/const versionCode = (\d+);/);

  if (!versionCodeMatch) {
    throw new Error('app.config.ts에서 `const versionCode = <number>;` 패턴을 찾지 못했습니다.');
  }

  const currentVersionCode = Number(versionCodeMatch[1]);
  const datePart = getTodayDatePart();
  const prefix = `b${datePart}`;
  const nextSuffix = getNextSuffix(prefix);

  if (nextSuffix > 99) {
    throw new Error(`오늘 날짜(${datePart})에 사용할 수 있는 suffix가 없습니다.`);
  }

  const suffix = String(nextSuffix).padStart(2, '0');
  const releaseTag = `${prefix}${suffix}`;
  const nextVersionCode = Number(`${datePart}${suffix}`);

  if (nextVersionCode <= currentVersionCode) {
    throw new Error(
      `계산된 versionCode(${nextVersionCode})가 현재 versionCode(${currentVersionCode})보다 커야 합니다.`,
    );
  }

  const remote = getRemoteName(branch);

  console.log(`현재 브랜치: ${branch}`);
  console.log(`현재 versionCode: ${currentVersionCode}`);
  console.log(`다음 release tag: ${releaseTag}`);
  console.log(`다음 versionCode: ${nextVersionCode}`);

  if (isDryRun) {
    console.log('dry-run 모드입니다. 아래 작업만 예정되어 있습니다.');
    console.log(`- app.config.ts의 versionCode를 ${nextVersionCode}로 변경`);
    console.log(`- git commit -m "release: ${releaseTag}"`);
    console.log(`- git tag ${releaseTag}`);
    if (!args.includes('--no-push')) {
      console.log(`- git push ${remote} ${branch}`);
      console.log(`- git push ${remote} ${releaseTag}`);
      console.log('주의: b* 태그를 push하면 iOS beta / Android alpha 배포가 트리거됩니다.');
    }
    process.exit(0);
  }

  ensureLocalTagDoesNotExist(releaseTag);
  ensureRemoteTagDoesNotExist(remote, releaseTag);

  const nextAppConfig = appConfig.replace(
    /const versionCode = \d+;/,
    `const versionCode = ${nextVersionCode};`,
  );

  writeFileSync(appConfigPath, nextAppConfig);

  const changedFiles = git(['diff', '--name-only']);
  if (changedFiles.trim() !== 'app.config.ts') {
    throw new Error([
      '의도하지 않은 변경이 감지되었습니다. release:today는 app.config.ts만 수정해야 합니다.',
      changedFiles,
    ].join('\n'));
  }

  runGit(['add', 'app.config.ts'], { inherit: true });
  runGit(['commit', '-m', `release: ${releaseTag}`], { inherit: true });
  runGit(['tag', releaseTag], { inherit: true });

  console.log(`local tag 생성 완료: ${releaseTag}`);

  if (shouldPush) {
    console.log('주의: b* 태그를 push하면 iOS beta / Android alpha 배포가 트리거됩니다.');
    runGit(['push', remote, branch], { inherit: true });
    runGit(['push', remote, releaseTag], { inherit: true });
  }

  console.log(`완료: release ${releaseTag}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

function printHelp() {
  console.log(`사용법: node scripts/release-today.js [options]\n\n옵션:\n  --dry-run       계산 결과와 예정 동작만 출력합니다.\n  --no-push       commit과 local tag까지만 수행합니다.\n  --allow-dirty   unstaged/untracked 변경은 허용하지만 staged 변경과 app.config.ts 기존 변경은 막습니다.\n  --help          도움말을 출력합니다.`);
}

function getTodayDatePart() {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}

function getNextSuffix(prefix) {
  const tagPattern = new RegExp(`^${prefix}(\\d{2})$`);
  const commitPattern = new RegExp(`^release: ${prefix}(\\d{2})$`);

  const tagMatches = git(['tag', '--list', `${prefix}*`])
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => tagPattern.exec(line))
    .filter(Boolean)
    .map((match) => Number(match[1]));

  const commitMatches = git(['log', '--format=%s', '--all'])
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => commitPattern.exec(line))
    .filter(Boolean)
    .map((match) => Number(match[1]));

  const maxSuffix = Math.max(0, ...tagMatches, ...commitMatches);
  return maxSuffix + 1;
}

function getRemoteName(branch) {
  const remote = gitOrNull(['config', `branch.${branch}.remote`]);
  return remote || 'origin';
}

function ensureLocalTagDoesNotExist(tagName) {
  const existingTag = git(['tag', '--list', tagName]);
  if (existingTag) {
    throw new Error(`local tag가 이미 존재합니다: ${tagName}`);
  }
}

function ensureRemoteTagDoesNotExist(remote, tagName) {
  const output = git(['ls-remote', '--tags', remote, `refs/tags/${tagName}`]);
  if (output) {
    throw new Error(`remote tag가 이미 존재합니다: ${tagName}`);
  }
}

function git(args) {
  return runGit(args).trim();
}

function gitOrNull(args) {
  const result = runGit(args, { allowFailure: true });
  if (result == null) {
    return null;
  }

  return result.trim() || null;
}

function runGit(args, options = {}) {
  const { inherit = false, allowFailure = false } = options;
  const result = spawnSync('git', args, {
    encoding: 'utf8',
    stdio: inherit ? 'inherit' : 'pipe',
  });

  if (result.status !== 0) {
    if (allowFailure) {
      return null;
    }

    const stderr = inherit ? '' : (result.stderr || result.stdout || '').trim();
    throw new Error(stderr || `git ${args.join(' ')} 실행에 실패했습니다.`);
  }

  return result.stdout || '';
}
