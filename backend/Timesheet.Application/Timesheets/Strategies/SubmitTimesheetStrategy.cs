using Timesheet.Domain.Entities;
using Timesheet.Domain.Enums;

namespace Timesheet.Application.Timesheets.Strategies;

public class SubmitTimesheetStrategy : ITimesheetStatusStrategy
{
    public bool CanHandle(TimesheetStatus currentStatus)
        => currentStatus == TimesheetStatus.Draft;

    public void Apply(Domain.Entities.Timesheet timesheet, Guid userId, string? comments = null)
    {
        timesheet.Status = TimesheetStatus.Submitted;
        timesheet.SubmittedAt = DateTime.UtcNow;
    }
}
