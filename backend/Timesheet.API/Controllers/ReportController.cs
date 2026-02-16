using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Timesheet.Application.Reports;
using Timesheet.Application.Timesheets.Interfaces;

namespace Timesheet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Manager")]
public class ReportController(ITimesheetService timesheetService) : BaseController
{
    [HttpPost("analytics")]
    public async Task<ActionResult<ProjectHoursSummary>> GetSummary([FromBody] TimeReportFilter filter)
    {
        var managerId = GetUserId();
        return Ok(await timesheetService.GetProjectWiseHoursSummary(managerId, filter));
    }
}
