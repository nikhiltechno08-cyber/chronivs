'use client';

import { Copy, ExternalLink, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { AdminExperienceListItem } from '../types';
import { copyToClipboard, formatDate } from '../utils';
import { ExperienceStatusBadge } from './ExperienceStatusBadge';

type ExperienceTableProps = {
  experiences: AdminExperienceListItem[];
  onView: (experienceId: string) => void;
};

function ExperienceActions({
  experience,
  onView,
}: {
  experience: AdminExperienceListItem;
  onView: (experienceId: string) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (label: string, value?: string | null) => {
    if (!value) return;
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1600);
    }
  };

  return (
    <div className="admin-order-actions">
      <button type="button" className="admin-order-action-btn" onClick={() => onView(experience.experienceId)}>
        <Eye aria-hidden="true" />
        View
      </button>
      {experience.publishedUrl ? (
        <a
          href={experience.publishedUrl}
          className="admin-order-action-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink aria-hidden="true" />
          Open
        </a>
      ) : null}
      <button
        type="button"
        className="admin-order-action-btn"
        onClick={() => void handleCopy('link', experience.publishedUrl)}
        disabled={!experience.publishedUrl}
      >
        <Copy aria-hidden="true" />
        {copied === 'link' ? 'Copied' : 'Copy Link'}
      </button>
      <button
        type="button"
        className="admin-order-action-btn"
        onClick={() => void handleCopy('id', experience.experienceId)}
      >
        <Copy aria-hidden="true" />
        {copied === 'id' ? 'Copied' : 'Copy ID'}
      </button>
      <button type="button" className="admin-order-action-btn is-muted" disabled title="Coming soon">
        <Trash2 aria-hidden="true" />
        Delete
      </button>
      <button type="button" className="admin-order-action-btn is-muted" disabled title="Coming soon">
        <MoreHorizontal aria-hidden="true" />
        More
      </button>
    </div>
  );
}

export function ExperienceTable({ experiences, onView }: ExperienceTableProps) {
  return (
    <>
      <div className="admin-table-wrap admin-experiences-table-wrap">
        <table className="admin-table admin-experiences-table">
          <thead>
            <tr>
              <th scope="col">Experience ID</th>
              <th scope="col">Customer</th>
              <th scope="col">Occasion</th>
              <th scope="col">Relationship</th>
              <th scope="col">Template</th>
              <th scope="col">Status</th>
              <th scope="col">Created Date</th>
              <th scope="col">Published URL</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {experiences.map((experience) => (
              <tr key={experience.experienceId}>
                <td data-label="Experience ID">
                  <code className="admin-code">{experience.experienceId.slice(0, 8)}…</code>
                </td>
                <td data-label="Customer">
                  <span className="admin-table-primary">{experience.customer}</span>
                  {experience.customerEmail ? (
                    <span className="admin-table-secondary">{experience.customerEmail}</span>
                  ) : null}
                </td>
                <td data-label="Occasion">{experience.occasion ?? '—'}</td>
                <td data-label="Relationship">{experience.relationship ?? '—'}</td>
                <td data-label="Template">{experience.template ?? '—'}</td>
                <td data-label="Status">
                  <ExperienceStatusBadge status={experience.status} />
                </td>
                <td data-label="Created Date">{formatDate(experience.createdAt)}</td>
                <td data-label="Published URL">
                  {experience.publishedUrl ? (
                    <a href={experience.publishedUrl} className="admin-table-link" target="_blank" rel="noopener noreferrer">
                      Open
                    </a>
                  ) : (
                    <span className="admin-table-muted">—</span>
                  )}
                </td>
                <td data-label="Actions">
                  <ExperienceActions experience={experience} onView={onView} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-experience-cards">
        {experiences.map((experience) => (
          <article key={experience.experienceId} className="admin-order-card admin-experience-card">
            <div className="admin-order-card-head">
              <div>
                <p className="admin-order-card-label">Experience</p>
                <code className="admin-code">{experience.experienceId.slice(0, 8)}…</code>
              </div>
              <ExperienceStatusBadge status={experience.status} />
            </div>
            <div className="admin-order-card-grid">
              <div>
                <span>Customer</span>
                <strong>{experience.customer}</strong>
              </div>
              <div>
                <span>Template</span>
                <strong>{experience.template ?? '—'}</strong>
              </div>
              <div>
                <span>Occasion</span>
                <strong>{experience.occasion ?? '—'}</strong>
              </div>
              <div>
                <span>Created</span>
                <strong>{formatDate(experience.createdAt)}</strong>
              </div>
            </div>
            <ExperienceActions experience={experience} onView={onView} />
          </article>
        ))}
      </div>
    </>
  );
}
