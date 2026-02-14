
namespace Timesheet.Application.Timesheets.Strategies;

public interface ITimesheetStatusStrategy
{
    bool CanHandle(Timesheet.Domain.Enums.TimesheetStatus currentStatus);

    void Apply(Domain.Entities.Timesheet timesheet, Guid userId, string? comments = null);
}
