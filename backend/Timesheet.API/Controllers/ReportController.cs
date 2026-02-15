using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Timesheet.Application.Reports;
using Timesheet.Application.Timesheets.Interfaces;

namespace Timesheet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Manager")]
public class ReportController(ITimesheetService timesheetService) : ControllerBase
{
    [HttpPost("analytics")]
    public async Task<ActionResult<ProjectHoursSummary>> GetSummary([FromBody] TimeReportFilter filter)
    {
        var managerId = GetUserId();
        return Ok(await timesheetService.GetProjectWiseHoursSummary(managerId, filter));
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirst("userId")?.Value;

        if (string.IsNullOrWhiteSpace(claim))
            throw new UnauthorizedAccessException();

        return Guid.Parse(claim);
    }
}
