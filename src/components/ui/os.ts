import type { OsId } from '../../content/types';

export const OS_LABEL: Record<OsId, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
};

/** Where the reader pastes commands on each system. */
export const OS_SHELL: Record<OsId, string> = {
  windows: 'PowerShell',
  macos: 'Terminal',
  linux: 'Terminal',
};

/** id of an OS tab inside the tablist identified by `idBase`. */
export const tabId = (idBase: string, os: OsId) => `${idBase}-tab-${os}`;
