import { FileCode, Clock, GitBranch } from 'lucide-react';

interface Session {
  id: string;
  project_name: string;
  drs_score: number;
  session_duration_minutes: number;
  files_changed: number;
  lines_added: number;
  created_at: string;
}

interface SessionListProps {
  sessions: Session[];
}

export function SessionList({ sessions }: SessionListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
            <th className="pb-3 font-medium">Project</th>
            <th className="pb-3 font-medium">DRS</th>
            <th className="pb-3 font-medium">Duration</th>
            <th className="pb-3 font-medium">Files</th>
            <th className="pb-3 font-medium">Lines</th>
            <th className="pb-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr
              key={session.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {session.project_name}
                  </span>
                </div>
              </td>
              <td className="py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    session.drs_score >= 85
                      ? 'bg-green-100 text-green-800'
                      : session.drs_score >= 70
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {session.drs_score}
                </span>
              </td>
              <td className="py-4">
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{session.session_duration_minutes}m</span>
                </div>
              </td>
              <td className="py-4">
                <div className="flex items-center gap-1 text-gray-600">
                  <FileCode className="w-4 h-4" />
                  <span>{session.files_changed}</span>
                </div>
              </td>
              <td className="py-4">
                <span className="text-green-600">+{session.lines_added}</span>
              </td>
              <td className="py-4 text-gray-500">
                {new Date(session.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
