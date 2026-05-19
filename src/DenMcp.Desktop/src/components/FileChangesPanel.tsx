import React, { useState, useCallback } from 'react';
import {
  GitFileStatus,
  GitDirtyCounts,
  DesktopDiffSnapshotLatestResult,
  getLatestDiffSnapshot,
} from '../desktop/sidecarBridgeApi';
import { truncateContent } from '../messagesView';
import { DiffPane } from './DiffPane';

// ── Status icon helpers ─────────────────────────────────────────

function statusIcon(file: GitFileStatus): string {
  if (file.is_untracked) return '?';
  const st = file.index_status ?? file.worktree_status;
  if (st === 'A') return 'A';
  if (st === 'D') return 'D';
  if (st === 'R') return 'R';
  if (st === 'C') return 'C';
  if (st === 'U') return 'U';
  return 'M';
}

function statusLabel(status: string): string {
  switch (status) {
    case 'M': return 'modified';
    case 'A': return 'added';
    case 'D': return 'deleted';
    case 'R': return 'renamed';
    case 'C': return 'copied';
    case 'U': return 'unmerged';
    case '?': return 'untracked';
    default: return 'changed';
  }
}

function statusClassName(status: string): string {
  switch (status) {
    case 'A': return 'status-added';
    case 'D': return 'status-deleted';
    case 'R': return 'status-renamed';
    case '?': return 'status-untracked';
    default: return 'status-modified';
  }
}

// ── Diff line delta computation ─────────────────────────────────

function computeLineDelta(diff: string | null | undefined): { added: number; deleted: number } {
  if (!diff) return { added: 0, deleted: 0 };
  let added = 0;
  let deleted = 0;
  const lines = diff.split('\n');
  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) added++;
    if (line.startsWith('-') && !line.startsWith('---')) deleted++;
  }
  return { added, deleted };
}

// ── Props ───────────────────────────────────────────────────────

export interface FileChangesPanelProps {
  files: GitFileStatus[];
  dirtyCounts: GitDirtyCounts;
  projectId: string;
  taskId: number | null;
  workspaceId: string | null;
  rootPath: string;
  sourceInstanceId: string;
}

// ── Component ───────────────────────────────────────────────────

export function FileChangesPanel({
  files,
  dirtyCounts,
  projectId,
  taskId,
  workspaceId,
  rootPath,
  sourceInstanceId,
}: FileChangesPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedFile, setSelectedFile] = useState<GitFileStatus | null>(null);
  const [diffResult, setDiffResult] = useState<DesktopDiffSnapshotLatestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleFileClick = useCallback(
    async (file: GitFileStatus) => {
      setSelectedFile(file);
      setLoading(true);
      setError(null);
      setDiffResult(null);

      try {
        const result = await getLatestDiffSnapshot({
          projectId,
          taskId,
          workspaceId,
          rootPath,
          path: file.path,
          sourceInstanceId,
        });
        setDiffResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    [projectId, taskId, workspaceId, rootPath, sourceInstanceId],
  );

  const selectedFileDelta = diffResult?.snapshot?.diff
    ? computeLineDelta(diffResult.snapshot.diff)
    : null;

  const expandedLabel = expanded ? '▼' : '▶';

  return (
    <section className="panel file-changes-panel">
      {/* ── Collapsible header ── */}
      <button
        type="button"
        className="panel-heading file-changes-toggle"
        onClick={toggleExpanded}
        title={expanded ? 'Collapse file list' : 'Expand file list'}
      >
        <span className="file-changes-summary">
          {expandedLabel} Changed files ({dirtyCounts.total} files)
        </span>
        {!expanded && files.length > 0 && (
          <span className="count-pill">{dirtyCounts.total}</span>
        )}
      </button>

      {/* ── Expanded content ── */}
      {expanded && (
        <div className="file-changes-body">
          {files.length === 0 ? (
            <div className="empty-state">
              <p>No file changes detected for this task/workspace.</p>
            </div>
          ) : (
            <>
              <ul className="file-changes-list">
                {files.map((file) => {
                  const icon = statusIcon(file);
                  const isActive = selectedFile?.path === file.path;
                  const perFileDelta = isActive ? selectedFileDelta : null;
                  return (
                    <li key={`${file.path}:${file.index_status}:${file.worktree_status}`}>
                      <button
                        type="button"
                        className={`file-button file-changes-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleFileClick(file)}
                        title={`${statusLabel(icon)}: ${file.path}`}
                      >
                        <span className={`status-icon ${statusClassName(icon)}`}>{icon}</span>
                        <code className="file-path">{truncateContent(file.path, 60)}</code>
                        {perFileDelta && (perFileDelta.added > 0 || perFileDelta.deleted > 0) && (
                          <span className="file-delta">
                            {perFileDelta.added > 0 && <span className="delta-added">+{perFileDelta.added}</span>}
                            {perFileDelta.deleted > 0 && <span className="delta-deleted">-{perFileDelta.deleted}</span>}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* ── Diff pane for selected file ── */}
              {selectedFile && (
                <div className="file-changes-diff">
                  <DiffPane
                    snapshot={null}
                    file={selectedFile}
                    diff={diffResult}
                    loading={loading}
                    error={error}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
