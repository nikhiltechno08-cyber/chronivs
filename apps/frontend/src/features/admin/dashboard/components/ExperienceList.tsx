import Link from 'next/link';

import type { AdminRecentExperience } from '../types';
import { DashboardEmptyState } from './DashboardEmptyState';

import { Sparkles } from 'lucide-react';

type ExperienceListProps = {
  experiences: AdminRecentExperience[];
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function ExperienceList({ experiences }: ExperienceListProps) {
  if (experiences.length === 0) {
    return (
      <DashboardEmptyState
        icon={Sparkles}
        title="No published experiences"
        description="Published experiences will appear here once customers complete checkout."
      />
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Experience Name</th>
            <th scope="col">Customer</th>
            <th scope="col">Published</th>
            <th scope="col">Created</th>
            <th scope="col">
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {experiences.map((experience) => (
            <tr key={experience.id}>
              <td data-label="Experience Name">
                <span className="admin-table-primary">{experience.name}</span>
              </td>
              <td data-label="Customer">{experience.customer ?? '—'}</td>
              <td data-label="Published">
                <span className={experience.published ? 'admin-published-badge is-yes' : 'admin-published-badge'}>
                  {experience.published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td data-label="Created">{formatDate(experience.createdAt)}</td>
              <td data-label="Open">
                {experience.publicUrl ? (
                  <Link
                    href={experience.publicUrl}
                    className="admin-table-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open
                  </Link>
                ) : (
                  <span className="admin-table-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
