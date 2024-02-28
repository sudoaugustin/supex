export type Meta = { icon?: string; title?: string; viewport?: string; description?: string };

export type Pattern = {
  runAt?: 'document_end' | 'document_start' | 'document_idle';
  globs?: string[];
  matches: string[];
  // isMain?: boolean;
  allFrames?: boolean;
  matchBlank?: boolean;
  // matchFallback?: boolean;
  excludeGlobs?: string[];
  excludeMatches?: string[];
};
