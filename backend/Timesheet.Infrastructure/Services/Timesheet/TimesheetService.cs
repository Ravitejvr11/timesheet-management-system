using Microsoft.EntityFrameworkCore;
using Timesheet.Application.Reports;
using Timesheet.Application.Timesheets.DTO;
using Timesheet.Application.Timesheets.Interfaces;
using Timesheet.Application.Timesheets.Strategies;
using Timesheet.Domain.Entities;
using Timesheet.Domain.Enums;
using Timesheet.Infrastructure.Persistence;

namespace Timesheet.Infrastructure.Services.Timesheet;

public class TimesheetService(AppDbContext context, IEnumerable<ITimesheetStatusStrategy> strategies) : ITimesheetService
{
    private readonly IEnumerable<ITimesheetStatusStrategy> _strategies = strategies;

    public async Task<List<TimesheetDto>> GetTimesheetsForEmployeeAsync(Guid employeeId, int projectId)
    {
        return await context.Timesheets
            .Where(t => t.EmployeeId == employeeId && t.ProjectId == projectId)
            .Include(t => t.Entries)
            .OrderByDescending(t => t.WeekStartDate)
            .Select(t => MapToDto(t))
            .ToListAsync();
    }

    public async Task<TimesheetDto> CreateTimesheetAsync(Guid employeeId, CreateTimesheetRequest request)
    {
        var timesheet = new Domain.Entities.Timesheet
        {
            EmployeeId = employeeId,
            ProjectId = request.ProjectId,
            WeekStartDate = request.WeekStartDate,
            WeekEndDate = request.WeekEndDate,
            Status = TimesheetStatus.Draft,
            TotalBillableHours = 0,
            TotalNonBillableHours = 0
        };

        context.Timesheets.Add(timesheet);
        await context.SaveChangesAsync();

        return MapToDto(timesheet);
    }

    public async Task<TimesheetDto> UpdateTimesheetAsync(Guid employeeId, int timesheetId, UpdateTimesheetRequest request)
    {
        var timesheet = await context.Timesheets
            .Include(t => t.Entries)
            .FirstOrDefaultAsync(t =>
                t.Id == timesheetId &&
                t.EmployeeId == employeeId);

        if (timesheet is null)
            throw new Exception("Timesheet not found.");

        if (timesheet.Status != TimesheetStatus.Draft &&
            timesheet.Status != TimesheetStatus.Rejected)
            throw new Exception("Timesheet cannot be edited.");

        // If editing rejected - reset to Draft
        if (timesheet.Status == TimesheetStatus.Rejected)
        {
            timesheet.Status = TimesheetStatus.Draft;
            timesheet.Comments = null;
        }

        timesheet.WeekStartDate = request.WeekStartDate;
        timesheet.WeekEndDate = request.WeekEndDate;

        if (request.Entries is not null)
        {
            context.TimesheetEntries.RemoveRange(timesheet.Entries);

            timesheet.Entries = request.Entries.Select(e => new TimesheetEntry
            {
                WorkDate = e.WorkDate,
                BillableHours = e.BillableHours,
                NonBillableHours = e.NonBillableHours,
                Description = e.Description
            }).ToList();

            CalculateTotals(timesheet);
        }

        await context.SaveChangesAsync();

        return MapToDto(timesheet);
    }

    public async Task SubmitTimesheetAsync(Guid employeeId, int timesheetId)
    {
        var timesheet = await context.Timesheets
            .FirstOrDefaultAsync(t =>
                t.Id == timesheetId &&
                t.EmployeeId == employeeId);

        if (timesheet is null)
            throw new Exception("Timesheet not found.");

        var strategy = _strategies
            .FirstOrDefault(s => s.CanHandle(timesheet.Status));

        if (strategy is null)
            throw new Exception("Invalid timesheet state transition.");

        strategy.Apply(timesheet, employeeId);

        await context.SaveChangesAsync();
    }

    public async Task ApproveTimesheetAsync(Guid managerId, int timesheetId)
    {
        var timesheet = await context.Timesheets
            .FirstOrDefaultAsync(t => t.Id == timesheetId);

        if (timesheet is null)
            throw new Exception("Timesheet not found.");

        if (timesheet.Status != TimesheetStatus.Submitted)
            throw new Exception("Only submitted timesheets can be approved.");

        timesheet.Status = TimesheetStatus.Approved;
        timesheet.ApprovedAt = DateTime.UtcNow;
        timesheet.ApprovedBy = managerId;

        await context.SaveChangesAsync();
    }

    public async Task RejectTimesheetAsync(Guid managerId, int timesheetId, string comments)
    {
        var timesheet = await context.Timesheets
            .FirstOrDefaultAsync(t => t.Id == timesheetId);

        if (timesheet is null)
            throw new Exception("Timesheet not found.");

        if (timesheet.Status != TimesheetStatus.Submitted)
            throw new Exception("Only submitted timesheets can be rejected.");

        timesheet.Status = TimesheetStatus.Rejected;
        timesheet.Comments = comments;
        timesheet.ApprovedBy = managerId;
        timesheet.ApprovedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
    }

    public async Task<ProjectHoursSummary> GetProjectWiseHoursSummary(Guid managerId,TimeReportFilter filter)
    {
        var query = BuildBaseQuery(managerId, filter);

        var groupedData = await query
                                    .GroupBy(e => 1)
                                    .Select(g => new
                                    {
                                        TotalBillableHours = g.Sum(x => (decimal?)x.BillableHours) ?? 0,
                                        TotalNonBillableHours = g.Sum(x => (decimal?)x.NonBillableHours) ?? 0,

                                        Projects = g
                                            .GroupBy(e => new
                                            {
                                                e.Timesheet.ProjectId,
                                                ProjectName = e.Timesheet.Project.Name
                                            })
                                            .Select(pg => new
                                            {
                                                pg.Key.ProjectId,
                                                pg.Key.ProjectName,

                                                BillableHours = pg.Sum(x => (decimal?)x.BillableHours) ?? 0,
                                                NonBillableHours = pg.Sum(x => (decimal?)x.NonBillableHours) ?? 0,

                                                Employees = pg
                                                    .GroupBy(e => new
                                                    {
                                                        e.Timesheet.EmployeeId,
                                                        EmployeeName = e.Timesheet.Employee.UserName
                                                    })
                                                    .Select(eg => new
                                                    {
                                                        eg.Key.EmployeeId,
                                                        eg.Key.EmployeeName,

                                                        BillableHours = eg.Sum(x => (decimal?)x.BillableHours) ?? 0,
                                                        NonBillableHours = eg.Sum(x => (decimal?)x.NonBillableHours) ?? 0
                                                    })
                                                    .ToList()
                                            })
                                            .ToList()
                                    })
                                    .FirstOrDefaultAsync();

        // 🔹 Handle empty result
        if (groupedData == null)
        {
            return new ProjectHoursSummary();
        }

        // 🔹 Map to DTO
        return new ProjectHoursSummary
        {
            TotalBillableHours = groupedData.TotalBillableHours,
            TotalNonBillableHours = groupedData.TotalNonBillableHours,

            Projects = groupedData.Projects.Select(p => new ProjectBillableDto
            {
                ProjectId = p.ProjectId,
                ProjectName = p.ProjectName,
                BillableHours = p.BillableHours,
                NonBillableHours = p.NonBillableHours,

                Employees = p.Employees.Select(e => new EmployeeBillableDto
                {
                    EmployeeId = e.EmployeeId,
                    EmployeeName = e.EmployeeName,
                    BillableHours = e.BillableHours,
                    NonBillableHours = e.NonBillableHours
                }).ToList()

            }).ToList()
        };
    }

    private IQueryable<TimesheetEntry> BuildBaseQuery(Guid managerId, TimeReportFilter filter)
    {
        var query = context.TimesheetEntries
            .AsNoTracking()
            .Where(e =>
                e.WorkDate >= filter.FromDate &&
                e.WorkDate <= filter.ToDate &&
                context.EmployeeManagers
                    .Any(me =>
                        me.ManagerId == managerId &&
                        me.EmployeeId == e.Timesheet.EmployeeId
                    )
            );

        if (filter.EmployeeIds != null && filter.EmployeeIds.Any())
        {
            query = query.Where(e => filter.EmployeeIds.Contains(e.Timesheet.EmployeeId));
        }

        if (filter.ProjectIds != null && filter.ProjectIds.Any())
        {
            query = query.Where(e =>
                filter.ProjectIds.Contains(e.Timesheet.ProjectId) &&
                e.Timesheet.Project.Status == ProjectStatus.Active
            );
        }

        return query;
    }

    private static void CalculateTotals(Domain.Entities.Timesheet timesheet)
    {
        timesheet.TotalBillableHours =
            timesheet.Entries.Sum(e => e.BillableHours);

        timesheet.TotalNonBillableHours =
            timesheet.Entries.Sum(e => e.NonBillableHours);
    }

    private static TimesheetDto MapToDto(Domain.Entities.Timesheet t)
    {
        return new TimesheetDto()
        {
            Id = t.Id,
            ProjectId = t.ProjectId,
            EmployeeId = t.EmployeeId,
            WeekStartDate = t.WeekStartDate,
            WeekEndDate = t.WeekEndDate,
            TotalBillableHours = t.TotalBillableHours,
            TotalNonBillableHours = t.TotalNonBillableHours,
            Status = t.Status,
            Comments = t.Comments,
            Entries = t.Entries.Select(e => new TimesheetEntryDto()
            {
                Id = e.Id,
                WorkDate = e.WorkDate,
                BillableHours = e.BillableHours,
                NonBillableHours = e.NonBillableHours,
                Description = e.Description
            }).ToList()
        };
    }

    public async Task<List<ManagerTimesheetDto>> GetTimesheetsForManagerAsync(Guid managerId)
    {
        var employeeIds = await context.EmployeeManagers
            .Where(me => me.ManagerId == managerId)
            .Select(me => me.EmployeeId)
            .ToListAsync();

        return await context.Timesheets
            .Where(t => employeeIds.Contains(t.EmployeeId) && (t.TotalBillableHours > 0 || t.TotalNonBillableHours > 0))
            .Include(t => t.Employee)
            .Include(t => t.Entries)
            .Select(t => new ManagerTimesheetDto(
                t.Id,
                t.ProjectId,
                t.Project.Name,
                t.Project.Code,
                t.Project.ClientName,
                t.EmployeeId,
                t.Employee.UserName,
                t.WeekStartDate,
                t.WeekEndDate,
                t.TotalBillableHours,
                t.TotalNonBillableHours,
                t.Status,
                t.Comments,
                t.Entries.Select(e => new TimesheetEntryDto()
                {
                    Id = e.Id,
                    WorkDate = e.WorkDate,
                    BillableHours = e.BillableHours,
                    NonBillableHours = e.NonBillableHours,
                    Description = e.Description
                }).ToList()
            ))
            .ToListAsync();
    }

}
