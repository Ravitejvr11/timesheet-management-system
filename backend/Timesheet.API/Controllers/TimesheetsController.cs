using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Timesheet.Application.Timesheets.DTO;
using Timesheet.Application.Timesheets.Interfaces;

namespace Timesheet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TimesheetsController(ITimesheetService timesheetService)
    : ControllerBase
{
    [HttpGet("my")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> GetMyTimesheets([FromQuery] int projectId)
    {
        var employeeId = GetUserId();

        var result = await timesheetService
            .GetTimesheetsForEmployeeAsync(employeeId, projectId);

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> CreateTimesheet(
        [FromBody] CreateTimesheetRequest request)
    {
        var employeeId = GetUserId();

        var result = await timesheetService
            .CreateTimesheetAsync(employeeId, request);

        return Ok(result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> UpdateTimesheet(
        int id,
        [FromBody] UpdateTimesheetRequest request)
    {
        var employeeId = GetUserId();

        var result = await timesheetService
            .UpdateTimesheetAsync(employeeId, id, request);

        return Ok(result);
    }

    [HttpPost("{id:int}/submit")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> SubmitTimesheet(int id)
    {
        var employeeId = GetUserId();

        await timesheetService
            .SubmitTimesheetAsync(employeeId, id);

        return NoContent();
    }

    [HttpPost("{id:int}/approve")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> ApproveTimesheet(int id)
    {
        var managerId = GetUserId();

        await timesheetService
            .ApproveTimesheetAsync(managerId, id);

        return NoContent();
    }

    [HttpPost("{id:int}/reject")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> RejectTimesheet(
        int id,
        [FromBody] string comments)
    {
        var managerId = GetUserId();

        await timesheetService
            .RejectTimesheetAsync(managerId, id, comments);

        return NoContent();
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirst("userId")?.Value;

        if (string.IsNullOrWhiteSpace(claim))
            throw new UnauthorizedAccessException();

        return Guid.Parse(claim);
    }
}
