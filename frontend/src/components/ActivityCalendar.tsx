import type { ActivityProvider } from "../types/portfolio";

type Props = {
  activity: ActivityProvider;
};

export function ActivityCalendar({ activity }: Props) {
  const days = activity.days || [];

  return (
    <article className="activity-card">
      <div className="activity-top">
        <div>
          <span className="activity-label">{activity.source || "live activity"}</span>
          <h3>{activity.provider}</h3>
        </div>
        {activity.profileUrl && (
          <a className="btn ghost" href={activity.profileUrl} target="_blank" rel="noreferrer">
            Open profile
          </a>
        )}
      </div>

      {activity.error ? (
        <p className="error-copy">{activity.error}</p>
      ) : (
        <>
          <div className="activity-stats">
            <div>
              <strong>{activity.accepted ?? activity.total ?? 0}</strong>
              <span>{activity.accepted ? "Accepted" : "Total"}</span>
            </div>
            <div>
              <strong>{activity.currentStreak ?? 0}</strong>
              <span>Current streak</span>
            </div>
            <div>
              <strong>{activity.bestStreak ?? 0}</strong>
              <span>Best streak</span>
            </div>
            <div>
              <strong>{activity.totalActiveDays ?? days.filter((day) => day.count > 0).length}</strong>
              <span>Active days</span>
            </div>
          </div>
          {activity.note && <p className="note-copy">{activity.note}</p>}
          <div className="heatmap" role="img" aria-label={`${activity.provider} consistency calendar`}>
            {days.map((day) => (
              <span
                className={`heat-cell level-${day.level}`}
                key={day.date}
                title={`${day.date}: ${day.count} activities`}
              />
            ))}
          </div>
          <div className="heat-legend">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <span className={`heat-cell level-${level}`} key={level} />
            ))}
            <span>More</span>
          </div>
        </>
      )}
    </article>
  );
}
