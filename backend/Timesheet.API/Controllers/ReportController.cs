using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Timesheet.Application.Reports;
using Timesheet.Application.Timesheets.Interfaces;

namespace Timesheet.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportController(ITimesheetService timesheetService) : ControllerBase
{
    [HttpGet("analytics")]
    public async Task<ActionResult<ProjectHoursSummary>> GetSummary([FromBody] TimeReportFilter filter)
    {
        return Ok(await timesheetService.GetProjectWiseHoursSummary(filter));
    }
}
