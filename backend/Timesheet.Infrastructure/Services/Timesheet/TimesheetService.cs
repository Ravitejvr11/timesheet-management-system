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

    public async Task<List<TimesheetDto>> GetTimesheetsForEmployeeAsync(
        Guid employeeId,
        int projectId)
    {
        return await context.Timesheets
            .Where(t => t.EmployeeId == employeeId && t.ProjectId == projectId)
            .Include(t => t.Entries)
            .OrderByDescending(t => t.WeekStartDate)
            .Select(t => MapToDto(t))
            .ToListAsync();
    }

    public async Task<TimesheetDto> CreateTimesheetAsync(
        Guid employeeId,
        CreateTimesheetRequest request)
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

    public async Task<TimesheetDto> UpdateTimesheetAsync(
        Guid employeeId,
        int timesheetId,
        UpdateTimesheetRequest request)
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

        // If editing rejected → reset to Draft
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

    public async Task SubmitTimesheetAsync(
        Guid employeeId,
        int timesheetId)
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


    public async Task ApproveTimesheetAsync(
        Guid managerId,
        int timesheetId)
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

    public async Task RejectTimesheetAsync(
        Guid managerId,
        int timesheetId,
        string comments)
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

    public async Task<List<EmployeeProjectHoursSummary>> GetEmployeeProjectWiseSummary(EmployeeWiseHoursFilter filter)
    {
        var query = context.TimesheetEntries.AsNoTracking().Where(e => e.WorkDate >= filter.FromDate && e.WorkDate <= filter.ToDate);

        // Filter employees
        if (filter.EmployeeIds != null && filter.EmployeeIds.Any())
        {
            query = query.Where(e => filter.EmployeeIds.Contains(e.Timesheet.EmployeeId));
        }

        var result = await query
            .GroupBy(e => new
            {
                e.Timesheet.EmployeeId,
                EmployeeName = e.Timesheet.Employee.UserName,

                e.Timesheet.ProjectId,
                ProjectName = e.Timesheet.Project.Name
            })
            .Select(g => new EmployeeProjectHoursSummary
            {
                EmployeeId = g.Key.EmployeeId,
                EmployeeName = g.Key.EmployeeName,

                ProjectId = g.Key.ProjectId,
                ProjectName = g.Key.ProjectName,

                BillableHours = g.Sum(x => x.BillableHours),
                NonBillableHours = g.Sum(x => x.NonBillableHours),

                TotalHours = g.Sum(x => x.BillableHours + x.NonBillableHours)
            })
            .OrderBy(x => x.EmployeeName)
            .ThenByDescending(x => x.TotalHours)
            .ToListAsync();

        return result;
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
        return new TimesheetDto(
            t.Id,
            t.ProjectId,
            t.WeekStartDate,
            t.WeekEndDate,
            t.TotalBillableHours,
            t.TotalNonBillableHours,
            t.Status,
            t.Comments,
            t.Entries.Select(e => new TimesheetEntryDto(
                e.Id,
                e.WorkDate,
                e.BillableHours,
                e.NonBillableHours,
                e.Description
            )).ToList()
        );
    }
}
